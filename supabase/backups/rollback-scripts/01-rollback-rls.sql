-- ============================================================================
-- ROLLBACK SCRIPT: RLS CHANGES
-- Generated: 2025-01-19
-- Purpose: Rollback all RLS changes to restore original state
-- Execution Order: 1st script to run during rollback
-- ============================================================================

-- ============================================================================
-- EMERGENCY ROLLBACK - DISABLE RLS ON MODIFIED TABLES
-- ============================================================================

-- This script will restore the RLS state to the original backup configuration
-- Run this FIRST if you need to rollback RLS changes

BEGIN;

-- ============================================================================
-- STEP 1: DISABLE RLS ON TABLES THAT SHOULD NOT HAVE IT
-- ============================================================================

-- Based on backup: These 9 tables should have RLS DISABLED
-- (Even though they have policies, RLS was disabled in original state)

-- TABLE: users (has policies but RLS was DISABLED)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- TABLE: user_sessions (has policies but RLS was DISABLED)  
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;

-- TABLE: user_performance (has policies but RLS was DISABLED)
ALTER TABLE public.user_performance DISABLE ROW LEVEL SECURITY;

-- TABLE: ai_model_configs (has policies but RLS was DISABLED)
ALTER TABLE public.ai_model_configs DISABLE ROW LEVEL SECURITY;

-- TABLE: api_rate_limits (has policies but RLS was DISABLED)
ALTER TABLE public.api_rate_limits DISABLE ROW LEVEL SECURITY;

-- TABLE: auth_session_monitoring (no policies, RLS was DISABLED)
ALTER TABLE public.auth_session_monitoring DISABLE ROW LEVEL SECURITY;

-- TABLE: contact_embeddings (has policies but RLS was DISABLED)
ALTER TABLE public.contact_embeddings DISABLE ROW LEVEL SECURITY;

-- TABLE: real_time_presence (has policies but RLS was DISABLED)
ALTER TABLE public.real_time_presence DISABLE ROW LEVEL SECURITY;

-- TABLE: system_logs (no policies, RLS was DISABLED)
ALTER TABLE public.system_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: ENSURE TABLES WITH RLS REMAIN ENABLED
-- ============================================================================

-- These 27 tables should keep RLS ENABLED (as per original backup)
-- Only run these if RLS was accidentally disabled during implementation

-- Core Action Tables
-- ALTER TABLE public.action_analytics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.action_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.action_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.action_sequences ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.action_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- Activity and Metrics Tables  
-- ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.ai_impact_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.available_actions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.call_analytics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.call_intelligence ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.team_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Business Data Tables
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Meeting and Calendar Tables
-- ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.meeting_summaries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.participant_enrichment_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Pipeline and Templates
-- ALTER TABLE public.pipeline_attribution ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.quick_action_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: REMOVE ANY NEW POLICIES CREATED DURING RLS IMPLEMENTATION
-- ============================================================================

-- If new policies were created for the 9 tables during RLS implementation,
-- remove them here. The original policies (if any) are in 03-rls-policies.sql

-- For tables that originally had NO policies:
-- auth_session_monitoring and system_logs - remove any new policies

-- Drop any new policies on auth_session_monitoring
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'auth_session_monitoring'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.auth_session_monitoring';
        RAISE NOTICE 'Dropped policy: % on auth_session_monitoring', pol.policyname;
    END LOOP;
END $$;

-- Drop any new policies on system_logs  
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'system_logs'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.system_logs';
        RAISE NOTICE 'Dropped policy: % on system_logs', pol.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- STEP 4: RESTORE ORIGINAL POLICIES (if needed)
-- ============================================================================

-- The original policies for tables that had them are preserved in:
-- /supabase/backups/2025-01-19-pre-rls/03-rls-policies.sql
-- 
-- If policies were modified during implementation, restore them by running
-- the relevant sections from that file.

-- ============================================================================
-- STEP 5: VALIDATION CHECKS
-- ============================================================================

-- Verify RLS status matches original backup state
DO $$
DECLARE
    rec RECORD;
    expected_rls BOOLEAN;
BEGIN
    RAISE NOTICE 'Validating RLS status after rollback...';
    
    -- Tables that should have RLS DISABLED (the 9 critical ones)
    FOR rec IN 
        SELECT tablename 
        FROM (VALUES 
            ('users'),
            ('user_sessions'),
            ('user_performance'), 
            ('ai_model_configs'),
            ('api_rate_limits'),
            ('auth_session_monitoring'),
            ('contact_embeddings'),
            ('real_time_presence'),
            ('system_logs')
        ) t(tablename)
    LOOP
        SELECT rowsecurity INTO expected_rls 
        FROM pg_tables 
        WHERE tablename = rec.tablename AND schemaname = 'public';
        
        IF expected_rls = TRUE THEN
            RAISE WARNING 'ROLLBACK ISSUE: Table % still has RLS ENABLED when it should be DISABLED', rec.tablename;
        ELSE
            RAISE NOTICE 'OK: Table % has RLS correctly DISABLED', rec.tablename;
        END IF;
    END LOOP;
    
    -- Check one table that should have RLS ENABLED
    SELECT rowsecurity INTO expected_rls 
    FROM pg_tables 
    WHERE tablename = 'meeting_participants' AND schemaname = 'public';
    
    IF expected_rls = FALSE THEN
        RAISE WARNING 'ROLLBACK ISSUE: Table meeting_participants has RLS DISABLED when it should be ENABLED';
    ELSE
        RAISE NOTICE 'OK: Table meeting_participants has RLS correctly ENABLED';
    END IF;
END $$;

-- ============================================================================
-- STEP 6: VERIFY POLICY COUNTS
-- ============================================================================

-- Check that policy counts match expected state
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Validating policy counts after rollback...';
    
    -- Tables that should have NO policies
    FOR rec IN 
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies 
        WHERE tablename IN ('auth_session_monitoring', 'system_logs')
        AND schemaname = 'public'
        GROUP BY tablename
    LOOP
        RAISE WARNING 'ROLLBACK ISSUE: Table % has % policies, expected 0', rec.tablename, rec.policy_count;
    END LOOP;
    
    -- Tables that should have policies - check they exist
    SELECT COUNT(*) as policy_count INTO rec
    FROM pg_policies 
    WHERE tablename = 'users' AND schemaname = 'public';
    
    IF rec.policy_count = 0 THEN
        RAISE WARNING 'ROLLBACK ISSUE: Table users has no policies, expected 6';
    ELSE
        RAISE NOTICE 'OK: Table users has % policies', rec.policy_count;
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- POST-ROLLBACK VERIFICATION QUERIES
-- ============================================================================

-- Run these queries after rollback to verify success:

-- 1. Check RLS status for all critical tables
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status,
    CASE 
        WHEN tablename IN ('users', 'user_sessions', 'user_performance', 'ai_model_configs', 
                          'api_rate_limits', 'auth_session_monitoring', 'contact_embeddings',
                          'real_time_presence', 'system_logs') 
        THEN 'Should be DISABLED'
        ELSE 'Should be ENABLED'
    END as expected_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'user_sessions', 'user_performance', 'ai_model_configs',
    'api_rate_limits', 'auth_session_monitoring', 'contact_embeddings', 
    'real_time_presence', 'system_logs', 'meeting_participants', 
    'contacts', 'organizations', 'actions'
  )
ORDER BY tablename;

-- 2. Check policy counts
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'user_sessions', 'user_performance', 'ai_model_configs',
    'api_rate_limits', 'auth_session_monitoring', 'contact_embeddings',
    'real_time_presence', 'system_logs'
  )
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- After running this script:
-- 1. Test application functionality
-- 2. Check that data access works as expected  
-- 3. Verify performance is normal
-- 4. Run application test suite
-- 5. Monitor error logs for RLS-related issues

-- If issues persist, check:
-- - 02-rollback-functions.sql for function rollback
-- - 03-rollback-schemas.sql for schema changes
-- - Original backup files in /supabase/backups/2025-01-19-pre-rls/

-- ============================================================================