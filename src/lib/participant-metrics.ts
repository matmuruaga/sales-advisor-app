import { createClient } from '@supabase/supabase-js';

export interface ParticipantMetrics {
  // Participant Management KPIs
  totalParticipants: number;
  matchedParticipants: number;
  enrichedParticipants: number;
  unknownParticipants: number;
  pendingParticipants: number;
  
  // Match Rate Metrics
  overallMatchRate: number; // percentage of participants with contacts
  autoMatchRate: number; // percentage matched automatically
  manualMatchRate: number; // percentage matched manually
  apiEnrichmentRate: number; // percentage enriched via APIs
  
  // Enrichment Performance
  enrichmentSources: Record<string, {
    attempts: number;
    successes: number;
    failures: number;
    successRate: number;
    averageCost: number;
    totalCost: number;
  }>;
  
  // Meeting Insights
  meetingsWithFullParticipantData: number;
  averageParticipantsPerMeeting: number;
  meetingsWithUnknownParticipants: number;
  
  // Time-based Metrics
  averageEnrichmentTime: number; // minutes
  participantsAddedLast24h: number;
  participantsEnrichedLast24h: number;
  
  // Quality Metrics
  highConfidenceMatches: number; // matches with >0.9 confidence
  lowConfidenceMatches: number; // matches with <0.7 confidence
  duplicateEmailsDetected: number;
  
  // Cost Analysis
  totalEnrichmentCost: number; // in cents
  averageCostPerEnrichment: number;
  costBySource: Record<string, number>;
  
  // Error Tracking
  recentErrors: Array<{
    timestamp: string;
    type: string;
    message: string;
    participantEmail?: string;
    source?: string;
  }>;
  
  // Trend Data
  dailyStats: Array<{
    date: string;
    participantsAdded: number;
    participantsMatched: number;
    participantsEnriched: number;
    totalCost: number;
  }>;
}

export class ParticipantMetricsCollector {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async collectMetrics(organizationId: string, days: number = 30): Promise<ParticipantMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    try {
      // Collect base participant statistics
      const [
        participantStats,
        enrichmentHistory,
        meetingStats,
        dailyTrends,
        recentErrors
      ] = await Promise.all([
        this.getParticipantStats(organizationId),
        this.getEnrichmentHistory(organizationId, startDate),
        this.getMeetingStats(organizationId),
        this.getDailyTrends(organizationId, days),
        this.getRecentErrors(organizationId)
      ]);

      return {
        ...participantStats,
        ...enrichmentHistory,
        ...meetingStats,
        dailyStats: dailyTrends,
        recentErrors
      };

    } catch (error) {
      console.error('Error collecting participant metrics:', error);
      throw error;
    }
  }

  private async getParticipantStats(organizationId: string) {
    const { data: participants, error } = await this.supabase
      .from('meeting_participants')
      .select('id, enrichment_status, contact_id, auto_match_confidence, created_at')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const total = participants.length;
    const matched = participants.filter(p => p.enrichment_status === 'matched').length;
    const enriched = participants.filter(p => p.enrichment_status === 'enriched').length;
    const unknown = participants.filter(p => p.enrichment_status === 'unknown').length;
    const pending = participants.filter(p => p.enrichment_status === 'pending').length;

    const withContacts = participants.filter(p => p.contact_id).length;
    const highConfidence = participants.filter(p => (p.auto_match_confidence || 0) > 0.9).length;
    const lowConfidence = participants.filter(p => (p.auto_match_confidence || 0) < 0.7 && p.auto_match_confidence).length;

    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const addedLast24h = participants.filter(p => new Date(p.created_at) > last24h).length;

    return {
      totalParticipants: total,
      matchedParticipants: matched,
      enrichedParticipants: enriched,
      unknownParticipants: unknown,
      pendingParticipants: pending,
      overallMatchRate: total > 0 ? (withContacts / total) * 100 : 0,
      highConfidenceMatches: highConfidence,
      lowConfidenceMatches: lowConfidence,
      participantsAddedLast24h: addedLast24h,
    };
  }

  private async getEnrichmentHistory(organizationId: string, startDate: Date) {
    const { data: history, error } = await this.supabase
      .from('participant_enrichment_history')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('performed_at', startDate.toISOString());

    if (error) throw error;

    // Group by source
    const sourceStats: Record<string, any> = {};
    let totalCost = 0;
    let autoMatches = 0;
    let manualMatches = 0;
    let apiEnrichments = 0;

    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    let enrichedLast24h = 0;

    for (const entry of history) {
      const source = entry.enrichment_source || 'unknown';
      
      if (!sourceStats[source]) {
        sourceStats[source] = {
          attempts: 0,
          successes: 0,
          failures: 0,
          successRate: 0,
          averageCost: 0,
          totalCost: 0
        };
      }

      sourceStats[source].attempts++;
      
      if (entry.status === 'success') {
        sourceStats[source].successes++;
        
        if (entry.enrichment_type === 'contact_match' && source === 'auto') {
          autoMatches++;
        } else if (entry.enrichment_type === 'contact_match' && source === 'manual') {
          manualMatches++;
        } else if (entry.enrichment_type === 'api_lookup') {
          apiEnrichments++;
        }

        if (new Date(entry.performed_at) > last24h) {
          enrichedLast24h++;
        }
      } else {
        sourceStats[source].failures++;
      }

      const cost = entry.cost_cents || 0;
      sourceStats[source].totalCost += cost;
      totalCost += cost;
    }

    // Calculate rates and averages
    Object.keys(sourceStats).forEach(source => {
      const stats = sourceStats[source];
      stats.successRate = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
      stats.averageCost = stats.successes > 0 ? stats.totalCost / stats.successes : 0;
    });

    const totalMatches = autoMatches + manualMatches + apiEnrichments;

    return {
      autoMatchRate: totalMatches > 0 ? (autoMatches / totalMatches) * 100 : 0,
      manualMatchRate: totalMatches > 0 ? (manualMatches / totalMatches) * 100 : 0,
      apiEnrichmentRate: totalMatches > 0 ? (apiEnrichments / totalMatches) * 100 : 0,
      enrichmentSources: sourceStats,
      totalEnrichmentCost: totalCost,
      averageCostPerEnrichment: history.filter(h => h.status === 'success').length > 0 
        ? totalCost / history.filter(h => h.status === 'success').length 
        : 0,
      costBySource: Object.fromEntries(
        Object.entries(sourceStats).map(([source, stats]) => [source, (stats as any).totalCost])
      ),
      participantsEnrichedLast24h: enrichedLast24h,
      averageEnrichmentTime: 5 // TODO: Calculate based on job completion times
    };
  }

  private async getMeetingStats(organizationId: string) {
    const { data: summaries, error } = await this.supabase
      .from('meeting_summaries')
      .select('total_participants, known_contacts, unknown_participants')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const totalMeetings = summaries.length;
    const meetingsWithFullData = summaries.filter(m => m.unknown_participants === 0).length;
    const meetingsWithUnknowns = summaries.filter(m => m.unknown_participants > 0).length;
    const totalParticipants = summaries.reduce((sum, m) => sum + (m.total_participants || 0), 0);
    const averageParticipants = totalMeetings > 0 ? totalParticipants / totalMeetings : 0;

    // Check for duplicate emails
    const { data: participants, error: participantsError } = await this.supabase
      .from('meeting_participants')
      .select('email')
      .eq('organization_id', organizationId);

    if (participantsError) throw participantsError;

    const emailCounts: Record<string, number> = {};
    participants.forEach(p => {
      emailCounts[p.email] = (emailCounts[p.email] || 0) + 1;
    });

    const duplicateEmails = Object.values(emailCounts).filter(count => count > 1).length;

    return {
      meetingsWithFullParticipantData: meetingsWithFullData,
      averageParticipantsPerMeeting: averageParticipants,
      meetingsWithUnknownParticipants: meetingsWithUnknowns,
      duplicateEmailsDetected: duplicateEmails
    };
  }

  private async getDailyTrends(organizationId: string, days: number) {
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Participants added this day
      const { data: participantsAdded } = await this.supabase
        .from('meeting_participants')
        .select('id')
        .eq('organization_id', organizationId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      // Enrichment history for this day
      const { data: enrichmentActivity } = await this.supabase
        .from('participant_enrichment_history')
        .select('status, cost_cents, enrichment_type')
        .eq('organization_id', organizationId)
        .gte('performed_at', startOfDay.toISOString())
        .lte('performed_at', endOfDay.toISOString());

      const matched = enrichmentActivity?.filter(e => 
        e.status === 'success' && e.enrichment_type === 'contact_match'
      ).length || 0;

      const enriched = enrichmentActivity?.filter(e => 
        e.status === 'success' && e.enrichment_type === 'api_lookup'
      ).length || 0;

      const dailyCost = enrichmentActivity?.reduce((sum, e) => sum + (e.cost_cents || 0), 0) || 0;

      trends.push({
        date: dateStr,
        participantsAdded: participantsAdded?.length || 0,
        participantsMatched: matched,
        participantsEnriched: enriched,
        totalCost: dailyCost
      });
    }

    return trends;
  }

  private async getRecentErrors(organizationId: string) {
    const { data: errors, error } = await this.supabase
      .from('participant_enrichment_history')
      .select('performed_at, enrichment_source, enrichment_type, participant_id')
      .eq('organization_id', organizationId)
      .eq('status', 'failed')
      .order('performed_at', { ascending: false })
      .limit(10);

    if (error) return [];

    // Get participant emails for failed enrichments
    const participantIds = errors.map(e => e.participant_id).filter(Boolean);
    const { data: participants } = await this.supabase
      .from('meeting_participants')
      .select('id, email')
      .in('id', participantIds);

    const participantMap = new Map(participants?.map(p => [p.id, p.email]) || []);

    return errors.map(error => ({
      timestamp: error.performed_at,
      type: error.enrichment_type || 'unknown',
      message: `${error.enrichment_source || 'unknown'} enrichment failed`,
      participantEmail: participantMap.get(error.participant_id),
      source: error.enrichment_source
    }));
  }
}

// SLA Metrics for monitoring
export interface ParticipantSLAMetrics {
  // Response Time SLAs
  averageEnrichmentTime: number; // minutes
  p95EnrichmentTime: number; // 95th percentile
  p99EnrichmentTime: number; // 99th percentile
  
  // Availability SLAs
  apiUptimePercent: number;
  enrichmentServiceUptime: number;
  
  // Quality SLAs
  dataQualityScore: number; // 0-100
  matchAccuracy: number; // percentage of correctly matched participants
  
  // Performance SLAs
  throughputPerHour: number; // participants processed per hour
  errorRate: number; // percentage of failed operations
  
  // Business SLAs
  unknownParticipantReduction: number; // week-over-week improvement
  contactCompleteness: number; // percentage of enriched contacts with full data
}

// Alerting thresholds
export const PARTICIPANT_ALERTS = {
  HIGH_ERROR_RATE: 10, // > 10% error rate
  LOW_MATCH_RATE: 50, // < 50% match rate  
  HIGH_COST_PER_ENRICHMENT: 300, // > 3 cents per enrichment
  QUEUE_BACKLOG: 100, // > 100 items in queue
  LOW_CONFIDENCE_MATCHES: 20, // > 20% low confidence matches
  API_TIMEOUT: 30000, // > 30 seconds response time
  DAILY_COST_LIMIT: 5000, // > $50 per day in enrichment costs
};

export function checkAlerts(metrics: ParticipantMetrics): Array<{
  level: 'warning' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}> {
  const alerts = [];

  // Error rate check
  const totalAttempts = Object.values(metrics.enrichmentSources)
    .reduce((sum, source) => sum + source.attempts, 0);
  const totalFailures = Object.values(metrics.enrichmentSources)
    .reduce((sum, source) => sum + source.failures, 0);
  const errorRate = totalAttempts > 0 ? (totalFailures / totalAttempts) * 100 : 0;

  if (errorRate > PARTICIPANT_ALERTS.HIGH_ERROR_RATE) {
    alerts.push({
      level: 'critical',
      message: `High enrichment error rate detected`,
      metric: 'errorRate',
      value: errorRate,
      threshold: PARTICIPANT_ALERTS.HIGH_ERROR_RATE
    });
  }

  // Match rate check
  if (metrics.overallMatchRate < PARTICIPANT_ALERTS.LOW_MATCH_RATE) {
    alerts.push({
      level: 'warning',
      message: `Low participant match rate`,
      metric: 'matchRate',
      value: metrics.overallMatchRate,
      threshold: PARTICIPANT_ALERTS.LOW_MATCH_RATE
    });
  }

  // Cost per enrichment check
  if (metrics.averageCostPerEnrichment > PARTICIPANT_ALERTS.HIGH_COST_PER_ENRICHMENT) {
    alerts.push({
      level: 'warning',
      message: `High average enrichment cost`,
      metric: 'avgCostPerEnrichment',
      value: metrics.averageCostPerEnrichment,
      threshold: PARTICIPANT_ALERTS.HIGH_COST_PER_ENRICHMENT
    });
  }

  // Low confidence matches check
  const lowConfidenceRate = metrics.totalParticipants > 0 
    ? (metrics.lowConfidenceMatches / metrics.totalParticipants) * 100 
    : 0;
    
  if (lowConfidenceRate > PARTICIPANT_ALERTS.LOW_CONFIDENCE_MATCHES) {
    alerts.push({
      level: 'warning',
      message: `High rate of low confidence matches`,
      metric: 'lowConfidenceRate',
      value: lowConfidenceRate,
      threshold: PARTICIPANT_ALERTS.LOW_CONFIDENCE_MATCHES
    });
  }

  // Daily cost check (using last day from trends)
  const lastDay = metrics.dailyStats[metrics.dailyStats.length - 1];
  if (lastDay && lastDay.totalCost > PARTICIPANT_ALERTS.DAILY_COST_LIMIT) {
    alerts.push({
      level: 'critical',
      message: `Daily enrichment cost exceeded budget`,
      metric: 'dailyCost',
      value: lastDay.totalCost,
      threshold: PARTICIPANT_ALERTS.DAILY_COST_LIMIT
    });
  }

  return alerts;
}