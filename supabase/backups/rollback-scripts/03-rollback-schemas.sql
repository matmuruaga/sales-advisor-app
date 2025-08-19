-- ============================================================================
-- ROLLBACK SCRIPT: SCHEMA CHANGES
-- Generated: 2025-01-19
-- Purpose: Rollback all schema changes made during RLS implementation
-- Execution Order: 3rd script to run during rollback
-- ============================================================================

-- ============================================================================
-- SCHEMA ROLLBACK - TABLE STRUCTURE CHANGES
-- ============================================================================

-- This script handles rollback of any schema modifications made during
-- RLS implementation, particularly for the meeting_participants table
-- and any other structural changes.

BEGIN;

-- ============================================================================
-- ROLLBACK: meeting_participants table changes
-- ============================================================================

-- If any columns were added during RLS implementation, drop them here
-- Example rollback statements (uncomment and modify as needed):

-- Drop any new columns that were added
-- ALTER TABLE public.meeting_participants DROP COLUMN IF EXISTS new_column_name;
-- ALTER TABLE public.meeting_participants DROP COLUMN IF EXISTS another_new_column;

-- Restore original column types if they were modified
-- Example: If enrichment_status was changed from text to enum, restore to text
-- ALTER TABLE public.meeting_participants ALTER COLUMN enrichment_status TYPE text;

-- Restore original column constraints if they were modified
-- Example: If a NOT NULL constraint was added/removed
-- ALTER TABLE public.meeting_participants ALTER COLUMN column_name DROP NOT NULL;
-- ALTER TABLE public.meeting_participants ALTER COLUMN column_name SET NOT NULL;

-- ============================================================================
-- ROLLBACK: Index changes
-- ============================================================================

-- If any indexes were dropped during RLS implementation, recreate them
-- Based on backup, these indexes should exist for meeting_participants:

-- Ensure all original indexes exist (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS meeting_participants_pkey 
    ON public.meeting_participants USING btree (id);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_email 
    ON public.meeting_participants USING btree (email);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id 
    ON public.meeting_participants USING btree (meeting_id);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_contact_id 
    ON public.meeting_participants USING btree (contact_id);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_organization_id 
    ON public.meeting_participants USING btree (organization_id);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_email 
    ON public.meeting_participants USING btree (meeting_id, email);

CREATE UNIQUE INDEX IF NOT EXISTS unique_meeting_participant 
    ON public.meeting_participants USING btree (meeting_id, email);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_date_time 
    ON public.meeting_participants USING btree (meeting_date_time);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_enrichment_status 
    ON public.meeting_participants USING btree (enrichment_status);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_org_date 
    ON public.meeting_participants USING btree (organization_id, meeting_date_time DESC);

-- Drop any new indexes that were added during RLS implementation
-- Example:
-- DROP INDEX IF EXISTS new_index_name;

-- ============================================================================
-- ROLLBACK: Foreign Key constraints
-- ============================================================================

-- If foreign key constraints were modified during RLS implementation, restore them
-- Based on backup, meeting_participants should have these FK relationships:
-- - contact_id → contacts(id)  
-- - organization_id → organizations(id)

-- Add back foreign keys if they were dropped (modify constraint names as needed)
-- ALTER TABLE public.meeting_participants 
--   ADD CONSTRAINT fk_meeting_participants_contact_id 
--   FOREIGN KEY (contact_id) REFERENCES public.contacts(id);

-- ALTER TABLE public.meeting_participants 
--   ADD CONSTRAINT fk_meeting_participants_organization_id 
--   FOREIGN KEY (organization_id) REFERENCES public.organizations(id);

-- ============================================================================
-- ROLLBACK: Other critical tables schema changes
-- ============================================================================

-- If schema changes were made to any of the 9 critical tables during RLS
-- implementation, rollback those changes here:

-- users table rollback
-- ALTER TABLE public.users DROP COLUMN IF EXISTS new_security_column;
-- ALTER TABLE public.users ALTER COLUMN role TYPE user_role;

-- user_sessions table rollback  
-- ALTER TABLE public.user_sessions DROP COLUMN IF EXISTS new_session_field;

-- user_performance table rollback
-- ALTER TABLE public.user_performance DROP COLUMN IF EXISTS new_performance_metric;

-- ai_model_configs table rollback
-- ALTER TABLE public.ai_model_configs DROP COLUMN IF EXISTS new_config_field;

-- api_rate_limits table rollback
-- ALTER TABLE public.api_rate_limits DROP COLUMN IF EXISTS new_rate_field;

-- auth_session_monitoring table rollback
-- ALTER TABLE public.auth_session_monitoring DROP COLUMN IF EXISTS new_monitoring_field;

-- contact_embeddings table rollback
-- ALTER TABLE public.contact_embeddings DROP COLUMN IF EXISTS new_embedding_field;

-- real_time_presence table rollback
-- ALTER TABLE public.real_time_presence DROP COLUMN IF EXISTS new_presence_field;

-- system_logs table rollback
-- ALTER TABLE public.system_logs DROP COLUMN IF EXISTS new_log_field;

-- ============================================================================
-- ROLLBACK: Trigger changes
-- ============================================================================

-- If any triggers were modified during RLS implementation, restore them
-- Most tables should have updated_at triggers

-- Example trigger restoration (modify as needed):
-- CREATE OR REPLACE TRIGGER trigger_meeting_participants_updated_at
--   BEFORE UPDATE ON public.meeting_participants
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROLLBACK: Data type changes
-- ============================================================================

-- If any data types were changed during RLS implementation, restore them
-- Example: If an enum was created and used, revert to original type

-- Restore text fields that might have been changed to enums
-- ALTER TABLE public.meeting_participants ALTER COLUMN attendance_status TYPE text;
-- ALTER TABLE public.meeting_participants ALTER COLUMN response_status TYPE text;
-- ALTER TABLE public.meeting_participants ALTER COLUMN enrichment_status TYPE text;

-- ============================================================================
-- ROLLBACK: Default value changes
-- ============================================================================

-- If any default values were modified, restore original defaults
-- Based on backup, these are the original defaults for meeting_participants:

-- Restore original defaults (idempotent)
ALTER TABLE public.meeting_participants 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.meeting_participants 
  ALTER COLUMN is_organizer SET DEFAULT false;

ALTER TABLE public.meeting_participants 
  ALTER COLUMN attendance_status SET DEFAULT 'pending'::text;

ALTER TABLE public.meeting_participants 
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.meeting_participants 
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.meeting_participants 
  ALTER COLUMN meeting_platform SET DEFAULT 'google-meet'::text;

ALTER TABLE public.meeting_participants 
  ALTER COLUMN response_status SET DEFAULT 'pending'::text;

ALTER TABLE public.meeting_participants 
  ALTER COLUMN enrichment_status SET DEFAULT 'pending'::text;

ALTER TABLE public.meeting_participants 
  ALTER COLUMN last_seen_in_meeting SET DEFAULT now();

ALTER TABLE public.meeting_participants 
  ALTER COLUMN is_optional SET DEFAULT false;

-- ============================================================================
-- ROLLBACK: Check constraints
-- ============================================================================

-- If any check constraints were added/modified during RLS, rollback here
-- Example:
-- ALTER TABLE public.meeting_participants DROP CONSTRAINT IF EXISTS new_check_constraint;

-- ============================================================================
-- ROLLBACK: Sequence changes
-- ============================================================================

-- If any sequences were modified, restore them
-- (This is less common but include for completeness)

-- ============================================================================
-- VALIDATION: Verify schema matches original backup
-- ============================================================================

-- Verify meeting_participants column count and types
DO $$
DECLARE
    col_count INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE 'Validating meeting_participants schema after rollback...';
    
    -- Count columns
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'meeting_participants';
    
    RAISE NOTICE 'meeting_participants has % columns', col_count;
    
    -- Expected columns based on backup: 20 columns
    IF col_count != 20 THEN
        RAISE WARNING 'ROLLBACK ISSUE: meeting_participants has % columns, expected 20', col_count;
    END IF;
    
    -- Verify key columns exist with correct types
    FOR rec IN 
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'meeting_participants'
          AND column_name IN ('id', 'meeting_id', 'email', 'organization_id', 'enrichment_status')
        ORDER BY column_name
    LOOP
        RAISE NOTICE 'Column %: type=%, nullable=%, default=%', 
            rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
END $$;

-- Verify index counts
DO $$
DECLARE
    idx_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idx_count
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'meeting_participants';
    
    RAISE NOTICE 'meeting_participants has % indexes', idx_count;
    
    -- Expected: 10 indexes based on backup
    IF idx_count != 10 THEN
        RAISE WARNING 'ROLLBACK ISSUE: meeting_participants has % indexes, expected 10', idx_count;
    END IF;
END $$;

-- ============================================================================
-- VALIDATION: Check all critical tables exist and are accessible
-- ============================================================================

DO $$
DECLARE
    table_name TEXT;
    table_exists BOOLEAN;
    sample_count INTEGER;
BEGIN
    RAISE NOTICE 'Validating all critical tables after schema rollback...';
    
    -- Check each critical table
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'meeting_participants', 'users', 'user_sessions', 'user_performance',
            'ai_model_configs', 'api_rate_limits', 'auth_session_monitoring',
            'contact_embeddings', 'real_time_presence', 'system_logs'
        ])
    LOOP
        -- Check table exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = table_name
        ) INTO table_exists;
        
        IF NOT table_exists THEN
            RAISE WARNING 'ROLLBACK ISSUE: Table % does not exist', table_name;
        ELSE
            -- Try to count records (basic accessibility test)
            BEGIN
                EXECUTE 'SELECT COUNT(*) FROM public.' || quote_ident(table_name) INTO sample_count;
                RAISE NOTICE 'OK: Table % exists and accessible (% records)', table_name, sample_count;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'ROLLBACK ISSUE: Table % exists but not accessible: %', table_name, SQLERRM;
            END;
        END IF;
    END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- POST-ROLLBACK VERIFICATION QUERIES
-- ============================================================================

-- Run these queries after rollback to verify schema integrity:

-- 1. Verify meeting_participants structure matches backup
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'meeting_participants'
ORDER BY ordinal_position;

-- 2. Verify all indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'meeting_participants'
ORDER BY indexname;

-- 3. Check table sizes (should be similar to pre-rollback)
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN (
    'meeting_participants', 'users', 'user_sessions', 'user_performance',
    'ai_model_configs', 'api_rate_limits', 'auth_session_monitoring',
    'contact_embeddings', 'real_time_presence', 'system_logs'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Test basic queries on each table
-- SELECT COUNT(*) FROM meeting_participants;
-- SELECT COUNT(*) FROM users WHERE organization_id IS NOT NULL;
-- SELECT COUNT(*) FROM user_sessions WHERE expires_at > NOW();
-- etc.

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- After running this script:
-- 1. Verify all tables have expected structure
-- 2. Test application functionality that depends on these schemas
-- 3. Check that foreign key relationships work correctly
-- 4. Verify indexes are being used properly (check query plans)
-- 5. Run full application test suite
-- 6. Monitor for schema-related errors in application logs

-- If schema issues persist after rollback:
-- 1. Compare current schema with backup files
-- 2. Check for missing constraints or indexes
-- 3. Verify data types match expectations
-- 4. Ensure triggers are functioning
-- 5. Check foreign key relationships

-- ============================================================================