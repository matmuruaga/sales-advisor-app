-- ============================================================================
-- SUPABASE TABLE SCHEMAS BACKUP
-- Generated: 2025-01-19
-- Purpose: Complete backup of table schemas for critical tables requiring RLS
-- Focus: 9 tables without RLS + meeting_participants schema details
-- ============================================================================

-- ============================================================================
-- MEETING_PARTICIPANTS TABLE SCHEMA (RLS ENABLED - NEEDS SCHEMA CHANGES)
-- ============================================================================

-- Current table structure for meeting_participants:
-- This table currently has RLS ENABLED but needs schema modifications

/*
CREATE TABLE public.meeting_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id text NOT NULL,
    email text NOT NULL,
    name text,
    contact_id uuid,
    organization_id uuid NOT NULL,
    is_organizer boolean DEFAULT false,
    attendance_status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    meeting_date_time timestamp with time zone,
    meeting_platform text DEFAULT 'google-meet'::text,
    display_name text,
    response_status text DEFAULT 'pending'::text,
    enrichment_status text DEFAULT 'pending'::text,
    enrichment_source text,
    auto_match_confidence numeric(3,2),
    last_seen_in_meeting timestamp with time zone DEFAULT now(),
    meeting_title character varying(500),
    is_optional boolean DEFAULT false
);
*/

-- Current indexes for meeting_participants:
-- PRIMARY KEY: meeting_participants_pkey (id)
-- UNIQUE: unique_meeting_participant (meeting_id, email)
-- INDEXES:
--   - idx_meeting_participants_email (email)
--   - idx_meeting_participants_meeting_id (meeting_id)
--   - idx_meeting_participants_contact_id (contact_id)
--   - idx_meeting_participants_organization_id (organization_id)
--   - idx_meeting_participants_meeting_email (meeting_id, email)
--   - idx_meeting_participants_date_time (meeting_date_time)
--   - idx_meeting_participants_enrichment_status (enrichment_status)
--   - idx_meeting_participants_org_date (organization_id, meeting_date_time DESC)

-- ============================================================================
-- CRITICAL TABLES WITHOUT RLS - FULL SCHEMA BACKUP NEEDED
-- ============================================================================

-- TABLE 1: users (RLS DISABLED - HAS POLICIES)
-- Purpose: Core user management and authentication
-- Critical: Contains organization_id for multi-tenancy
-- Action Required: Enable RLS

-- TABLE 2: user_sessions (RLS DISABLED - HAS POLICIES)
-- Purpose: User session management
-- Critical: Session validation and security
-- Action Required: Enable RLS

-- TABLE 3: user_performance (RLS DISABLED - HAS POLICIES)  
-- Purpose: Performance tracking and analytics
-- Critical: Contains sensitive performance data
-- Action Required: Enable RLS

-- TABLE 4: ai_model_configs (RLS DISABLED - HAS POLICIES)
-- Purpose: AI model configurations
-- Critical: Contains API keys and sensitive configs
-- Action Required: Enable RLS

-- TABLE 5: api_rate_limits (RLS DISABLED - HAS POLICIES)
-- Purpose: API rate limiting per user/org
-- Critical: Security and resource management
-- Action Required: Enable RLS

-- TABLE 6: auth_session_monitoring (RLS DISABLED - NO POLICIES)
-- Purpose: Authentication session monitoring
-- Critical: Security monitoring
-- Action Required: Enable RLS + Create Policies

-- TABLE 7: contact_embeddings (RLS DISABLED - HAS POLICIES)
-- Purpose: AI embeddings for contact search
-- Critical: Contains vector embeddings
-- Action Required: Enable RLS

-- TABLE 8: real_time_presence (RLS DISABLED - HAS POLICIES)
-- Purpose: Real-time user presence tracking
-- Critical: Live collaboration features
-- Action Required: Enable RLS

-- TABLE 9: system_logs (RLS DISABLED - NO POLICIES)
-- Purpose: System-wide event logging
-- Critical: Audit trail and debugging
-- Action Required: Enable RLS + Create Policies

-- ============================================================================
-- ROLLBACK SCHEMA INFORMATION
-- ============================================================================

-- To rollback meeting_participants to current schema (if changes are made):
/*
-- Drop new columns (if any were added during RLS implementation)
-- ALTER TABLE meeting_participants DROP COLUMN IF EXISTS new_column_name;

-- Restore original column types/constraints (if any were modified)
-- ALTER TABLE meeting_participants ALTER COLUMN column_name TYPE original_type;

-- Recreate dropped indexes
CREATE UNIQUE INDEX meeting_participants_pkey ON public.meeting_participants USING btree (id);
CREATE INDEX idx_meeting_participants_email ON public.meeting_participants USING btree (email);
CREATE INDEX idx_meeting_participants_meeting_id ON public.meeting_participants USING btree (meeting_id);
CREATE INDEX idx_meeting_participants_contact_id ON public.meeting_participants USING btree (contact_id);
CREATE INDEX idx_meeting_participants_organization_id ON public.meeting_participants USING btree (organization_id);
CREATE INDEX idx_meeting_participants_meeting_email ON public.meeting_participants USING btree (meeting_id, email);
CREATE UNIQUE INDEX unique_meeting_participant ON public.meeting_participants USING btree (meeting_id, email);
CREATE INDEX idx_meeting_participants_date_time ON public.meeting_participants USING btree (meeting_date_time);
CREATE INDEX idx_meeting_participants_enrichment_status ON public.meeting_participants USING btree (enrichment_status);
CREATE INDEX idx_meeting_participants_org_date ON public.meeting_participants USING btree (organization_id, meeting_date_time DESC);
*/

-- ============================================================================
-- TABLE COUNTS AND VALIDATION DATA (for rollback verification)
-- ============================================================================

-- When performing rollback, verify these record counts match:
-- SELECT 'meeting_participants', COUNT(*) FROM meeting_participants;
-- SELECT 'users', COUNT(*) FROM users WHERE organization_id IS NOT NULL;
-- SELECT 'user_sessions', COUNT(*) FROM user_sessions WHERE expires_at > NOW();
-- SELECT 'user_performance', COUNT(*) FROM user_performance;
-- SELECT 'ai_model_configs', COUNT(*) FROM ai_model_configs;
-- SELECT 'api_rate_limits', COUNT(*) FROM api_rate_limits;
-- SELECT 'auth_session_monitoring', COUNT(*) FROM auth_session_monitoring;
-- SELECT 'contact_embeddings', COUNT(*) FROM contact_embeddings;
-- SELECT 'real_time_presence', COUNT(*) FROM real_time_presence WHERE updated_at > NOW() - INTERVAL '1 hour';
-- SELECT 'system_logs', COUNT(*) FROM system_logs WHERE created_at > NOW() - INTERVAL '7 days';

-- ============================================================================
-- FOREIGN KEY REFERENCES (Important for rollback)
-- ============================================================================

-- meeting_participants foreign key references:
-- - contact_id → contacts(id)
-- - organization_id → organizations(id)

-- users foreign key references:
-- - organization_id → organizations(id)

-- user_sessions foreign key references:
-- - user_id → users(id)

-- user_performance foreign key references:
-- - user_id → users(id)
-- - organization_id → organizations(id)

-- contact_embeddings foreign key references:
-- - contact_id → contacts(id)

-- real_time_presence foreign key references:
-- - user_id → users(id)
-- - organization_id → organizations(id)

-- ============================================================================
-- TRIGGERS AND FUNCTIONS AFFECTED
-- ============================================================================

-- These tables have triggers that may be affected by RLS changes:
-- - meeting_participants: updated_at trigger
-- - users: updated_at trigger
-- - user_sessions: updated_at trigger  
-- - user_performance: updated_at trigger
-- - ai_model_configs: updated_at trigger
-- - api_rate_limits: updated_at trigger
-- - contact_embeddings: updated_at trigger
-- - real_time_presence: updated_at trigger

-- No triggers on:
-- - auth_session_monitoring
-- - system_logs

-- ============================================================================
-- BACKUP VALIDATION QUERIES
-- ============================================================================

-- Run these queries to validate backup integrity:
/*
-- Verify RLS status matches backup
SELECT tablename, 
       (SELECT rowsecurity FROM pg_tables WHERE tablename = t.tablename AND schemaname = 'public') as rls_enabled
FROM (VALUES 
  ('meeting_participants'),
  ('users'),
  ('user_sessions'), 
  ('user_performance'),
  ('ai_model_configs'),
  ('api_rate_limits'),
  ('auth_session_monitoring'),
  ('contact_embeddings'),
  ('real_time_presence'),
  ('system_logs')
) t(tablename);

-- Verify index counts
SELECT 
  schemaname,
  tablename,
  COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN (
  'meeting_participants', 'users', 'user_sessions', 'user_performance',
  'ai_model_configs', 'api_rate_limits', 'auth_session_monitoring',
  'contact_embeddings', 'real_time_presence', 'system_logs'
) 
AND schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verify policy counts
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN (
  'meeting_participants', 'users', 'user_sessions', 'user_performance',
  'ai_model_configs', 'api_rate_limits', 'auth_session_monitoring',
  'contact_embeddings', 'real_time_presence', 'system_logs'
)
AND schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
*/

-- ============================================================================
-- EMERGENCY ROLLBACK PROCEDURE
-- ============================================================================

-- In case of emergency, execute in this order:
-- 1. Disable RLS on all modified tables
-- 2. Drop any new policies that were created
-- 3. Restore original function definitions (from 04-functions.sql)
-- 4. Verify data integrity with validation queries above
-- 5. Test application functionality
-- 6. Check performance metrics

-- ============================================================================