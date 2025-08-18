import { Queue, Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';

// Job types for participant enrichment
export interface EnrichParticipantJob {
  participantId: string;
  organizationId: string;
  email: string;
  displayName?: string;
  enrichmentSources: ('clearbit' | 'apollo' | 'linkedin')[];
  priority: 'high' | 'medium' | 'low';
}

export interface AutoMatchJob {
  organizationId: string;
  lookbackDays?: number; // How far back to look for unmatched participants
}

export interface BulkEnrichmentJob {
  organizationId: string;
  participantIds: string[];
  source: 'clearbit' | 'apollo' | 'linkedin';
  batchSize: number;
}

// Initialize Redis connection for BullMQ
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// Create queues
export const participantEnrichmentQueue = new Queue('participant-enrichment', {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const autoMatchQueue = new Queue('auto-match', {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 25,
    attempts: 2,
    repeat: { 
      cron: '0 */6 * * *' // Run every 6 hours
    },
  },
});

export const bulkEnrichmentQueue = new Queue('bulk-enrichment', {
  connection: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 20,
    removeOnFail: 10,
    attempts: 2,
  },
});

// Supabase client for job processing
function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for server-side operations
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

// Enrichment service implementations
class EnrichmentService {
  private static async enrichWithClearbit(email: string, displayName?: string) {
    const apiKey = process.env.CLEARBIT_API_KEY;
    if (!apiKey) {
      throw new Error('Clearbit API key not configured');
    }

    try {
      const response = await fetch(`https://person.clearbit.com/v2/combined/find?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.status === 202) {
        // Clearbit is processing, return null to retry later
        return null;
      }

      if (!response.ok) {
        throw new Error(`Clearbit API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        fullName: data.person?.name?.fullName || displayName,
        email,
        roleTitle: data.person?.employment?.title,
        companyName: data.company?.name,
        location: data.person?.location?.city + ', ' + data.person?.location?.state,
        phone: data.person?.phone,
        linkedinUrl: data.person?.linkedin?.handle ? `https://linkedin.com/in/${data.person.linkedin.handle}` : undefined,
        avatarUrl: data.person?.avatar,
        confidenceScore: 0.9,
        cost: 100 // 1 cent
      };
    } catch (error) {
      console.error('Clearbit enrichment error:', error);
      throw error;
    }
  }

  private static async enrichWithApollo(email: string, displayName?: string) {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      throw new Error('Apollo API key not configured');
    }

    try {
      const response = await fetch('https://api.apollo.io/v1/people/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify({
          email: email,
          reveal_personal_emails: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status}`);
      }

      const data = await response.json();
      const person = data.person;

      if (!person) {
        return null;
      }

      return {
        fullName: person.name || displayName,
        email,
        roleTitle: person.title,
        companyName: person.organization?.name,
        location: person.city + ', ' + person.state,
        phone: person.phone_numbers?.[0]?.raw_number,
        linkedinUrl: person.linkedin_url,
        confidenceScore: 0.85,
        cost: 50 // 0.5 cents
      };
    } catch (error) {
      console.error('Apollo enrichment error:', error);
      throw error;
    }
  }

  private static async enrichWithLinkedIn(email: string, displayName?: string) {
    // LinkedIn Sales Navigator API integration would go here
    // For now, return mock data
    return {
      fullName: displayName || 'Professional User',
      email,
      roleTitle: 'Senior Professional',
      companyName: 'Professional Services Inc.',
      location: 'Professional City',
      linkedinUrl: 'https://linkedin.com/in/professional',
      confidenceScore: 0.7,
      cost: 200 // 2 cents
    };
  }

  public static async enrichParticipant(
    source: 'clearbit' | 'apollo' | 'linkedin',
    email: string,
    displayName?: string
  ) {
    switch (source) {
      case 'clearbit':
        return await this.enrichWithClearbit(email, displayName);
      case 'apollo':
        return await this.enrichWithApollo(email, displayName);
      case 'linkedin':
        return await this.enrichWithLinkedIn(email, displayName);
      default:
        throw new Error(`Unknown enrichment source: ${source}`);
    }
  }
}

// Worker for participant enrichment jobs
export const participantEnrichmentWorker = new Worker(
  'participant-enrichment',
  async (job: Job<EnrichParticipantJob>) => {
    const { participantId, organizationId, email, displayName, enrichmentSources } = job.data;
    const supabase = getSupabaseServiceClient();

    console.log(`🔄 Processing enrichment job for participant: ${participantId}`);

    try {
      // Get the participant to enrich
      const { data: participant, error: participantError } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('id', participantId)
        .eq('organization_id', organizationId)
        .single();

      if (participantError || !participant) {
        throw new Error(`Participant not found: ${participantId}`);
      }

      // Skip if already enriched
      if (participant.enrichment_status === 'enriched') {
        console.log(`⏭️ Participant ${participantId} already enriched, skipping`);
        return { status: 'skipped', reason: 'already_enriched' };
      }

      let enrichedData = null;
      let successfulSource = null;
      let totalCost = 0;

      // Try each enrichment source in order of priority
      for (const source of enrichmentSources) {
        try {
          console.log(`🔍 Trying enrichment with ${source} for ${email}`);
          const result = await EnrichmentService.enrichParticipant(source, email, displayName);
          
          if (result) {
            enrichedData = result;
            successfulSource = source;
            totalCost = result.cost || 0;
            break;
          }
        } catch (error) {
          console.error(`❌ Enrichment failed with ${source}:`, error);
          // Continue to next source
        }
      }

      if (!enrichedData) {
        // Mark as unknown if all sources failed
        await supabase
          .from('meeting_participants')
          .update({
            enrichment_status: 'unknown',
            updated_at: new Date().toISOString()
          })
          .eq('id', participantId);

        // Log the failed attempt
        await supabase
          .from('participant_enrichment_history')
          .insert({
            participant_id: participantId,
            organization_id: organizationId,
            enrichment_type: 'api_lookup',
            enrichment_source: enrichmentSources.join(','),
            status: 'failed',
            performed_at: new Date().toISOString()
          });

        return { status: 'failed', reason: 'no_data_found' };
      }

      // Check if company exists or create it
      let companyId = null;
      if (enrichedData.companyName) {
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('organization_id', organizationId)
          .ilike('name', enrichedData.companyName)
          .single();

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              organization_id: organizationId,
              name: enrichedData.companyName,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (!companyError && newCompany) {
            companyId = newCompany.id;
          }
        }
      }

      // Create the contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          organization_id: organizationId,
          company_id: companyId,
          full_name: enrichedData.fullName,
          email: enrichedData.email,
          phone: enrichedData.phone,
          role_title: enrichedData.roleTitle,
          location: enrichedData.location,
          avatar_url: enrichedData.avatarUrl,
          status: 'warm',
          score: 65,
          source: `participant_enrichment_${successfulSource}`,
          social_profiles: enrichedData.linkedinUrl ? { linkedin: enrichedData.linkedinUrl } : null,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (contactError) {
        throw new Error(`Failed to create contact: ${contactError.message}`);
      }

      // Update participant with the new contact
      await supabase
        .from('meeting_participants')
        .update({
          contact_id: newContact.id,
          enrichment_status: 'enriched',
          enrichment_source: successfulSource,
          auto_match_confidence: enrichedData.confidenceScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId);

      // Log the successful enrichment
      await supabase
        .from('participant_enrichment_history')
        .insert({
          participant_id: participantId,
          organization_id: organizationId,
          enrichment_type: 'api_lookup',
          enrichment_source: successfulSource,
          status: 'success',
          confidence_score: enrichedData.confidenceScore,
          data_found: enrichedData,
          matched_contact_id: newContact.id,
          cost_cents: totalCost,
          performed_at: new Date().toISOString()
        });

      console.log(`✅ Successfully enriched participant ${participantId} with ${successfulSource}`);

      return {
        status: 'success',
        source: successfulSource,
        contactId: newContact.id,
        cost: totalCost
      };

    } catch (error) {
      console.error(`❌ Enrichment job failed for participant ${participantId}:`, error);
      
      // Log the error
      await supabase
        .from('participant_enrichment_history')
        .insert({
          participant_id: participantId,
          organization_id: organizationId,
          enrichment_type: 'api_lookup',
          enrichment_source: enrichmentSources.join(','),
          status: 'failed',
          performed_at: new Date().toISOString()
        });

      throw error;
    }
  },
  { connection: redisConfig, concurrency: 5 }
);

// Worker for auto-matching participants with existing contacts
export const autoMatchWorker = new Worker(
  'auto-match',
  async (job: Job<AutoMatchJob>) => {
    const { organizationId, lookbackDays = 7 } = job.data;
    const supabase = getSupabaseServiceClient();

    console.log(`🔄 Running auto-match job for organization: ${organizationId}`);

    try {
      // Get unmatched participants from the last N days
      const lookbackDate = new Date();
      lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

      const { data: unmatchedParticipants, error: participantsError } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('enrichment_status', 'pending')
        .gte('meeting_date_time', lookbackDate.toISOString());

      if (participantsError) {
        throw new Error(`Failed to fetch unmatched participants: ${participantsError.message}`);
      }

      if (!unmatchedParticipants || unmatchedParticipants.length === 0) {
        console.log(`✅ No unmatched participants found for organization ${organizationId}`);
        return { status: 'success', matched: 0 };
      }

      // Get all contacts for the organization
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, email, full_name')
        .eq('organization_id', organizationId);

      if (contactsError) {
        throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
      }

      let matchedCount = 0;

      for (const participant of unmatchedParticipants) {
        // Try exact email match first
        let matchedContact = contacts.find(c => 
          c.email && c.email.toLowerCase() === participant.email.toLowerCase()
        );

        let confidenceScore = 1.0;

        if (!matchedContact && participant.display_name) {
          // Try fuzzy name matching within same domain
          const participantDomain = participant.email.split('@')[1];
          matchedContact = contacts.find(c => 
            c.email && 
            c.email.split('@')[1] === participantDomain &&
            c.full_name &&
            participant.display_name &&
            similarity(c.full_name.toLowerCase(), participant.display_name.toLowerCase()) > 0.8
          );
          confidenceScore = 0.8;
        }

        if (matchedContact) {
          // Update participant with matched contact
          await supabase
            .from('meeting_participants')
            .update({
              contact_id: matchedContact.id,
              enrichment_status: 'matched',
              enrichment_source: 'auto',
              auto_match_confidence: confidenceScore,
              updated_at: new Date().toISOString()
            })
            .eq('id', participant.id);

          // Log the match
          await supabase
            .from('participant_enrichment_history')
            .insert({
              participant_id: participant.id,
              organization_id: organizationId,
              enrichment_type: 'contact_match',
              enrichment_source: 'auto',
              status: 'success',
              confidence_score: confidenceScore,
              matched_contact_id: matchedContact.id,
              performed_at: new Date().toISOString()
            });

          matchedCount++;
          console.log(`✅ Auto-matched participant ${participant.email} with contact ${matchedContact.full_name}`);
        }
      }

      console.log(`✅ Auto-match job completed. Matched ${matchedCount} participants.`);

      return {
        status: 'success',
        processed: unmatchedParticipants.length,
        matched: matchedCount
      };

    } catch (error) {
      console.error(`❌ Auto-match job failed for organization ${organizationId}:`, error);
      throw error;
    }
  },
  { connection: redisConfig, concurrency: 2 }
);

// Simple string similarity function (Dice coefficient)
function similarity(a: string, b: string): number {
  const first = a.replace(/\s+/g, '').toLowerCase();
  const second = b.replace(/\s+/g, '').toLowerCase();

  if (first === second) return 1;
  if (first.length < 2 || second.length < 2) return 0;

  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

// Utility functions for job management
export class ParticipantEnrichmentJobManager {
  static async queueEnrichment(jobData: EnrichParticipantJob) {
    return await participantEnrichmentQueue.add(
      `enrich-${jobData.participantId}`,
      jobData,
      {
        priority: jobData.priority === 'high' ? 1 : jobData.priority === 'medium' ? 5 : 10,
        delay: jobData.priority === 'high' ? 0 : 5000, // High priority jobs run immediately
      }
    );
  }

  static async queueAutoMatch(organizationId: string, lookbackDays?: number) {
    return await autoMatchQueue.add(
      `auto-match-${organizationId}`,
      { organizationId, lookbackDays },
      { 
        jobId: `auto-match-${organizationId}`, // Prevent duplicate jobs
      }
    );
  }

  static async queueBulkEnrichment(jobData: BulkEnrichmentJob) {
    return await bulkEnrichmentQueue.add(
      `bulk-enrich-${jobData.organizationId}`,
      jobData
    );
  }

  static async getQueueStats() {
    const [enrichmentWaiting, enrichmentActive, enrichmentCompleted, enrichmentFailed] = await Promise.all([
      participantEnrichmentQueue.getWaiting(),
      participantEnrichmentQueue.getActive(),
      participantEnrichmentQueue.getCompleted(),
      participantEnrichmentQueue.getFailed(),
    ]);

    return {
      enrichment: {
        waiting: enrichmentWaiting.length,
        active: enrichmentActive.length,
        completed: enrichmentCompleted.length,
        failed: enrichmentFailed.length,
      }
    };
  }
}

// Graceful shutdown
export function setupGracefulShutdown() {
  const shutdown = async () => {
    console.log('🛑 Shutting down participant enrichment workers...');
    await participantEnrichmentWorker.close();
    await autoMatchWorker.close();
    await participantEnrichmentQueue.close();
    await autoMatchQueue.close();
    await bulkEnrichmentQueue.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}