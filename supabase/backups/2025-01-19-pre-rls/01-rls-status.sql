-- ============================================================================
-- SUPABASE RLS STATUS BACKUP
-- Generated: 2025-01-19
-- Purpose: Current state of Row Level Security for all tables
-- ============================================================================

-- ============================================================================
-- TABLES WITHOUT RLS (9 CRITICAL TABLES) - REQUIRE ATTENTION
-- ============================================================================

-- Table: ai_model_configs
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: AI model configurations
-- Note: Has RLS policies but RLS is DISABLED

-- Table: api_rate_limits  
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: API rate limiting configuration
-- Note: Has RLS policies but RLS is DISABLED

-- Table: auth_session_monitoring
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: NO
-- Purpose: Authentication session monitoring
-- Note: No RLS policies defined

-- Table: contact_embeddings
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: Contact AI embeddings for search
-- Note: Has RLS policies but RLS is DISABLED

-- Table: real_time_presence
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: Real-time user presence tracking
-- Note: Has RLS policies but RLS is DISABLED

-- Table: system_logs
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: NO
-- Purpose: System-wide logging
-- Note: No RLS policies defined

-- Table: user_performance
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: User performance metrics
-- Note: Has RLS policies but RLS is DISABLED

-- Table: user_sessions
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: User session management
-- Note: Has RLS policies but RLS is DISABLED

-- Table: users
-- RLS Status: DISABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Purpose: User management and profiles
-- Note: Has RLS policies but RLS is DISABLED

-- ============================================================================
-- TABLES WITH RLS ENABLED (27 TABLES) - CURRENTLY SECURE
-- ============================================================================

-- Table: action_analytics
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 3 policies

-- Table: action_categories
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 1 policy

-- Table: action_history
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 3 policies

-- Table: action_sequences
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 5 policies

-- Table: action_templates
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 7 policies

-- Table: actions
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 6 policies

-- Table: activities
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- Table: ai_impact_metrics
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 3 policies

-- Table: available_actions
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 1 policy

-- Table: call_analytics
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- Table: call_intelligence
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 3 policies

-- Table: companies
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 5 policies

-- Table: contacts
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 7 policies

-- Table: daily_metrics
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- Table: deals
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- Table: google_calendar_tokens
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 4 policies

-- Table: industries
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 1 policy

-- Table: meeting_participants
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 6 policies

-- Table: meeting_summaries
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 1 policy

-- Table: organizations
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 3 policies

-- Table: participant_enrichment_history
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 1 policy

-- Table: pipeline_attribution
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- Table: pipeline_stages
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- Table: prompt_templates
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 5 policies

-- Table: quick_action_templates
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 5 policies

-- Table: reports
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 5 policies

-- Table: team_performance_metrics
-- RLS Status: ENABLED
-- Indexes: YES | Rules: NO | Triggers: YES
-- Policy Count: 2 policies

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================
-- Total Public Schema Tables: 36
-- Tables WITH RLS Enabled: 27 (75%)
-- Tables WITHOUT RLS (Critical): 9 (25%)
-- Total RLS Policies: 115 policies across enabled tables

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To disable RLS on any table:
-- ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;

-- To enable RLS on any table:
-- ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- To drop all policies on a table (BE CAREFUL):
-- DROP POLICY IF EXISTS policy_name ON public.table_name;
-- ============================================================================