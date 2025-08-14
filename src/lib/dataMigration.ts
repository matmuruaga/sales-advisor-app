// src/lib/dataMigration.ts
import { createClient } from '@supabase/supabase-js';
import { mockContacts } from '@/data/mockContacts';
import { mockTeamMembers } from '@/data/mockTeamMembers';
import { mockReports } from '@/data/mockReports';
import { promptTemplates } from '@/data/promptTemplates';
import { quickActionTemplates } from '@/data/quickActionTemplates';
import { actionHistory } from '@/data/actionHistory';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
);

interface MigrationProgress {
  total: number;
  completed: number;
  currentStep: string;
  errors: string[];
}

interface MigrationOptions {
  organizationId?: string;
  skipExisting?: boolean;
  batchSize?: number;
  onProgress?: (progress: MigrationProgress) => void;
}

export class DataMigration {
  private organizationId: string;
  private options: MigrationOptions;
  private progress: MigrationProgress = {
    total: 0,
    completed: 0,
    currentStep: '',
    errors: []
  };

  constructor(organizationId: string, options: MigrationOptions = {}) {
    this.organizationId = organizationId;
    this.options = {
      skipExisting: true,
      batchSize: 50,
      ...options
    };
  }

  private updateProgress(step: string, increment: number = 1) {
    this.progress.currentStep = step;
    this.progress.completed += increment;
    
    if (this.options.onProgress) {
      this.options.onProgress({ ...this.progress });
    }
  }

  private addError(error: string) {
    this.progress.errors.push(error);
    console.error('Migration error:', error);
  }

  async migrateAll(): Promise<MigrationProgress> {
    try {
      // Calculate total items to migrate
      this.progress.total = 
        mockContacts.length +
        mockTeamMembers.length +
        mockReports.length +
        promptTemplates.length +
        Object.values(quickActionTemplates).flat().length +
        actionHistory.length;

      console.log(`Starting migration of ${this.progress.total} items for organization ${this.organizationId}`);

      // Step 1: Migrate team members (users)
      await this.migrateTeamMembers();

      // Step 2: Migrate companies
      await this.migrateCompanies();

      // Step 3: Migrate contacts
      await this.migrateContacts();

      // Step 4: Migrate team performance data
      await this.migratePerformanceData();

      // Step 5: Migrate templates
      await this.migrateTemplates();

      // Step 6: Migrate quick action templates
      await this.migrateQuickActionTemplates();

      // Step 7: Migrate reports
      await this.migrateReports();

      // Step 8: Migrate action history
      await this.migrateActionHistory();

      console.log('Migration completed successfully!');
      return this.progress;

    } catch (error) {
      this.addError(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async migrateTeamMembers() {
    this.updateProgress('Migrating team members...', 0);

    try {
      // Get admin user for created_by fields
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('role', 'admin')
        .single();

      if (!adminUser) {
        throw new Error('Admin user not found for organization');
      }

      for (const member of mockTeamMembers) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('organization_id', this.organizationId)
            .eq('email', member.email)
            .single();

          if (existingUser && this.options.skipExisting) {
            this.updateProgress(`Skipping existing user: ${member.name}`);
            continue;
          }

          // Insert or update user
          const userData = {
            organization_id: this.organizationId,
            email: member.email,
            full_name: member.name,
            role: 'rep' as const,
            territory: member.territory,
          };

          if (existingUser) {
            await supabase
              .from('users')
              .update(userData)
              .eq('id', existingUser.id);
          } else {
            await supabase
              .from('users')
              .insert(userData);
          }

          this.updateProgress(`Migrated user: ${member.name}`);

        } catch (error) {
          this.addError(`Failed to migrate team member ${member.name}: ${error}`);
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate team members: ${error}`);
      throw error;
    }
  }

  private async migrateCompanies() {
    this.updateProgress('Migrating companies...', 0);

    try {
      // Get technology industry ID
      const { data: techIndustry } = await supabase
        .from('industries')
        .select('id')
        .eq('name', 'Technology')
        .single();

      const industryId = techIndustry?.id;

      // Extract unique companies from contacts
      const uniqueCompanies = Array.from(
        new Set(mockContacts.map(contact => contact.company))
      ).map(companyName => {
        const contact = mockContacts.find(c => c.company === companyName);
        return {
          name: companyName,
          industry_id: industryId,
          size_category: contact?.employees || '100-500',
          revenue_range: contact?.revenue || '$1M-$10M',
          headquarters: contact?.location || 'Unknown',
        };
      });

      for (const company of uniqueCompanies) {
        try {
          // Check if company already exists
          const { data: existing } = await supabase
            .from('companies')
            .select('id')
            .eq('organization_id', this.organizationId)
            .eq('name', company.name)
            .single();

          if (existing && this.options.skipExisting) {
            this.updateProgress(`Skipping existing company: ${company.name}`);
            continue;
          }

          const companyData = {
            organization_id: this.organizationId,
            ...company,
          };

          if (existing) {
            await supabase
              .from('companies')
              .update(companyData)
              .eq('id', existing.id);
          } else {
            await supabase
              .from('companies')
              .insert(companyData);
          }

          this.updateProgress(`Migrated company: ${company.name}`);

        } catch (error) {
          this.addError(`Failed to migrate company ${company.name}: ${error}`);
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate companies: ${error}`);
      throw error;
    }
  }

  private async migrateContacts() {
    this.updateProgress('Migrating contacts...', 0);

    try {
      // Get companies and users for foreign keys
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('organization_id', this.organizationId);

      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('organization_id', this.organizationId);

      const companyMap = new Map(companies?.map(c => [c.name, c.id]) || []);
      const userMap = new Map(users?.map(u => [u.full_name, u.id]) || []);

      // Process contacts in batches
      for (let i = 0; i < mockContacts.length; i += this.options.batchSize!) {
        const batch = mockContacts.slice(i, i + this.options.batchSize!);

        for (const contact of batch) {
          try {
            const companyId = companyMap.get(contact.company);
            if (!companyId) {
              this.addError(`Company not found for contact ${contact.name}: ${contact.company}`);
              continue;
            }

            // Randomly assign to a user for demo purposes
            const randomUser = users?.[Math.floor(Math.random() * users.length)];

            const contactData = {
              organization_id: this.organizationId,
              company_id: companyId,
              assigned_user_id: randomUser?.id,
              full_name: contact.name,
              email: contact.email,
              phone: contact.phone,
              role_title: contact.role,
              location: contact.location,
              avatar_url: contact.avatar,
              status: contact.status,
              score: contact.score,
              probability: contact.probability,
              deal_value: contact.value ? parseFloat(contact.value.replace(/[^0-9.-]+/g, '')) : null,
              source: contact.source,
              tags: contact.tags,
              interests: contact.interests,
              social_profiles: contact.social,
              recent_posts: contact.recentPosts,
              recent_comments: contact.recentComments,
              sentiment_analysis: contact.sentiment,
              user_trends: contact.userTrend,
              personality_insights: contact.personalityInsights,
              professional_background: contact.professionalBackground,
              buying_behavior: contact.buyingBehavior,
              engagement_metrics: contact.engagement,
              ai_insights: contact.aiInsights,
              last_activity_at: this.parseRelativeTime(contact.lastActivity),
              last_contact_at: this.parseRelativeTime(contact.lastContact),
              next_action_description: contact.nextAction,
              notes_count: contact.notes,
              activities_count: contact.activities,
            };

            // Check if contact already exists
            const { data: existing } = await supabase
              .from('contacts')
              .select('id')
              .eq('organization_id', this.organizationId)
              .eq('email', contact.email)
              .single();

            if (existing && this.options.skipExisting) {
              this.updateProgress(`Skipping existing contact: ${contact.name}`);
              continue;
            }

            if (existing) {
              await supabase
                .from('contacts')
                .update(contactData)
                .eq('id', existing.id);
            } else {
              await supabase
                .from('contacts')
                .insert(contactData);
            }

            this.updateProgress(`Migrated contact: ${contact.name}`);

          } catch (error) {
            this.addError(`Failed to migrate contact ${contact.name}: ${error}`);
          }
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate contacts: ${error}`);
      throw error;
    }
  }

  private async migratePerformanceData() {
    this.updateProgress('Migrating performance data...', 0);

    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('organization_id', this.organizationId);

      const userMap = new Map(users?.map(u => [u.full_name, u.id]) || []);

      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      for (const member of mockTeamMembers) {
        try {
          const userId = userMap.get(member.name);
          if (!userId) {
            this.addError(`User not found for performance data: ${member.name}`);
            continue;
          }

          const performanceData = {
            organization_id: this.organizationId,
            user_id: userId,
            quota_attainment: member.performance.quotaAttainment,
            quota_trend: member.performance.quotaTrend,
            win_rate: member.performance.winRate,
            deal_velocity: member.performance.dealVelocity,
            pipeline_value: member.performance.pipelineValue,
            activities_completed: member.performance.activitiesCompleted,
            calls_connected: member.performance.callsConnected,
            meetings_booked: member.performance.meetingsBooked,
            performance_status: member.performance.status,
            coaching_priority: member.coachingPriority,
            strengths: member.coachingInfo.strengths,
            improvement_areas: member.coachingInfo.improvements,
            ai_summary: member.aiInsights.summary,
            predicted_quota: member.aiInsights.predictedQuota,
            pipeline_conversion_rate: member.aiInsights.pipelineConversion,
            risk_factors: member.aiInsights.riskFactors,
            opportunities: member.aiInsights.opportunities,
            recommended_focus: member.aiInsights.recommendedFocus,
            activity_trends: member.activityTrends,
            period_start: currentPeriodStart.toISOString().split('T')[0],
            period_end: currentPeriodEnd.toISOString().split('T')[0],
          };

          await supabase
            .from('user_performance')
            .upsert(performanceData, {
              onConflict: 'user_id,period_start,period_end'
            });

          this.updateProgress(`Migrated performance data for: ${member.name}`);

        } catch (error) {
          this.addError(`Failed to migrate performance data for ${member.name}: ${error}`);
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate performance data: ${error}`);
      throw error;
    }
  }

  private async migrateTemplates() {
    this.updateProgress('Migrating prompt templates...', 0);

    try {
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('role', 'admin')
        .single();

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      for (const template of promptTemplates) {
        try {
          const templateData = {
            organization_id: this.organizationId,
            title: template.title,
            prompt_text: template.prompt,
            created_by: adminUser.id,
          };

          await supabase
            .from('prompt_templates')
            .insert(templateData);

          this.updateProgress(`Migrated template: ${template.title}`);

        } catch (error) {
          this.addError(`Failed to migrate template ${template.title}: ${error}`);
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate templates: ${error}`);
      throw error;
    }
  }

  private async migrateQuickActionTemplates() {
    this.updateProgress('Migrating quick action templates...', 0);

    try {
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('role', 'admin')
        .single();

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      for (const [actionType, templates] of Object.entries(quickActionTemplates)) {
        for (const template of templates) {
          try {
            const templateData = {
              organization_id: this.organizationId,
              action_type: actionType,
              title: template.title,
              prompt_text: template.prompt,
              category: template.category,
              created_by: adminUser.id,
            };

            await supabase
              .from('quick_action_templates')
              .insert(templateData);

            this.updateProgress(`Migrated quick template: ${template.title}`);

          } catch (error) {
            this.addError(`Failed to migrate quick template ${template.title}: ${error}`);
          }
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate quick action templates: ${error}`);
      throw error;
    }
  }

  private async migrateReports() {
    this.updateProgress('Migrating reports...', 0);

    try {
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('role', 'admin')
        .single();

      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      for (const report of mockReports) {
        try {
          const reportData = {
            organization_id: this.organizationId,
            title: report.title,
            category: report.category,
            description: report.description,
            icon_name: report.icon,
            metrics: report.metrics,
            is_featured: report.featured || false,
            status: report.status,
            tags: report.tags,
            created_by: adminUser.id,
          };

          await supabase
            .from('reports')
            .insert(reportData);

          this.updateProgress(`Migrated report: ${report.title}`);

        } catch (error) {
          this.addError(`Failed to migrate report ${report.title}: ${error}`);
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate reports: ${error}`);
      throw error;
    }
  }

  private async migrateActionHistory() {
    this.updateProgress('Migrating action history...', 0);

    try {
      const { data: actions } = await supabase
        .from('available_actions')
        .select('id, slug');

      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('role', 'admin')
        .single();

      if (!adminUser || !actions) {
        throw new Error('Required data not found for action history migration');
      }

      const actionMap = new Map(actions.map(a => [a.slug, a.id]));

      for (const historyItem of actionHistory) {
        try {
          // Map action IDs based on slugs (simplified mapping)
          let actionId = actionMap.get('schedule-meeting'); // default fallback
          
          if (historyItem.actionId.includes('follow')) {
            actionId = actionMap.get('schedule-meeting');
          } else if (historyItem.actionId.includes('health')) {
            actionId = actionMap.get('deal-health-check');
          }

          const historyData = {
            organization_id: this.organizationId,
            action_id: actionId,
            executed_by: adminUser.id,
            status: historyItem.status.toLowerCase() as 'completed' | 'failed',
            summary: historyItem.summary,
            result_details: historyItem.details || {},
            kpis: historyItem.details?.kpis || {},
            executed_at: historyItem.timestamp,
          };

          await supabase
            .from('action_history')
            .insert(historyData);

          this.updateProgress(`Migrated action history item: ${historyItem.summary}`);

        } catch (error) {
          this.addError(`Failed to migrate action history item: ${error}`);
        }
      }

    } catch (error) {
      this.addError(`Failed to migrate action history: ${error}`);
      throw error;
    }
  }

  private parseRelativeTime(relativeTime: string): string | null {
    const now = new Date();
    
    if (relativeTime.includes('hour')) {
      const hours = parseInt(relativeTime);
      return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
    } else if (relativeTime.includes('day')) {
      const days = parseInt(relativeTime);
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    } else if (relativeTime.includes('week')) {
      const weeks = parseInt(relativeTime);
      return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    return null;
  }
}

// Utility function to run migration
export async function runDataMigration(
  organizationId: string, 
  options?: MigrationOptions
): Promise<MigrationProgress> {
  const migration = new DataMigration(organizationId, options);
  return migration.migrateAll();
}