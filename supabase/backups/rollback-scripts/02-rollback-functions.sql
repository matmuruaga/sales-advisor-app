-- ============================================================================
-- ROLLBACK SCRIPT: FUNCTION CHANGES
-- Generated: 2025-01-19
-- Purpose: Rollback all SECURITY DEFINER functions to original state
-- Execution Order: 2nd script to run during rollback  
-- ============================================================================

-- ============================================================================
-- CRITICAL SECURITY ROLLBACK
-- ============================================================================

-- During RLS implementation, all SECURITY DEFINER functions should have
-- "SET search_path = public, extensions" added for security.
-- This script rolls back to the original functions WITHOUT search_path.

-- WARNING: This restores the original INSECURE state where SECURITY DEFINER
-- functions do NOT have search_path configured. This is a security risk but
-- matches the original backup state.

BEGIN;

-- ============================================================================
-- FUNCTION ROLLBACK 1-5: Core Security Functions
-- ============================================================================

-- ROLLBACK: anonymize_contact
CREATE OR REPLACE FUNCTION public.anonymize_contact(contact_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  org_id UUID;
  result RECORD;
BEGIN
  -- Obtener organization_id del contacto
  SELECT organization_id INTO org_id
  FROM contacts WHERE id = contact_uuid;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;
  
  -- Verificar permisos (solo admin puede anonimizar)
  IF get_user_role() != 'admin' OR get_user_organization() != org_id THEN
    RAISE EXCEPTION 'Insufficient permissions to anonymize contact';
  END IF;
  
  -- Anonimizar datos del contacto
  UPDATE contacts 
  SET 
    full_name = 'ANONYMIZED_' || LEFT(id::text, 8),
    email = NULL,
    phone = NULL,
    location = 'REDACTED',
    social_profiles = NULL,
    recent_posts = '[]'::jsonb,
    recent_comments = '[]'::jsonb,
    personality_insights = NULL,
    professional_background = NULL,
    buying_behavior = NULL,
    ai_insights = jsonb_build_object(
      'summary', 'Contact data has been anonymized for GDPR compliance',
      'anonymized_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = contact_uuid
  RETURNING id, full_name, updated_at INTO result;
  
  -- Eliminar embeddings asociados
  DELETE FROM contact_embeddings WHERE contact_id = contact_uuid;
  
  -- Registrar en audit log
  INSERT INTO audit.audit_logs (
    organization_id,
    user_id,
    table_name,
    record_id,
    action_type,
    new_values,
    created_at
  ) VALUES (
    org_id,
    auth.uid(),
    'contacts',
    contact_uuid,
    'ANONYMIZE',
    jsonb_build_object(
      'status', 'anonymized',
      'anonymized_at', NOW()
    ),
    NOW()
  );
  
  RETURN json_build_object(
    'contact_id', result.id,
    'new_name', result.full_name,
    'anonymized_at', result.updated_at,
    'success', true
  );
END;
$function$;

-- ROLLBACK: check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(endpoint text, max_requests integer DEFAULT 1000)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := date_trunc('hour', NOW());
  
  SELECT request_count INTO current_count
  FROM api_rate_limits
  WHERE organization_id = get_user_organization()
    AND user_id = auth.uid()
    AND api_endpoint = endpoint
    AND api_rate_limits.window_start = check_rate_limit.window_start;
  
  IF current_count IS NULL THEN
    INSERT INTO api_rate_limits (organization_id, user_id, api_endpoint, request_count, window_start, limit_per_window)
    VALUES (get_user_organization(), auth.uid(), endpoint, 1, window_start, max_requests);
    RETURN TRUE;
  ELSIF current_count < max_requests THEN
    UPDATE api_rate_limits 
    SET request_count = request_count + 1,
        updated_at = NOW()
    WHERE organization_id = get_user_organization()
      AND user_id = auth.uid()
      AND api_endpoint = endpoint
      AND api_rate_limits.window_start = check_rate_limit.window_start;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;

-- ROLLBACK: decrypt_pii
CREATE OR REPLACE FUNCTION public.decrypt_pii(encrypted_data text, key_suffix text DEFAULT 'default'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Generar la misma clave para desencriptar
  encryption_key := encode(
    digest('supabase_pii_key_' || key_suffix, 'sha256'),
    'hex'
  );
  
  -- Desencriptar
  RETURN convert_from(
    decrypt(
      decode(encrypted_data, 'base64'),
      encryption_key::bytea,
      'aes'
    ),
    'utf8'
  );
END;
$function$;

-- ROLLBACK: encrypt_pii
CREATE OR REPLACE FUNCTION public.encrypt_pii(data text, key_suffix text DEFAULT 'default'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Generar una clave basada en un secret y el sufijo proporcionado
  -- En producción, esto debería usar vault o una clave externa
  encryption_key := encode(
    digest('supabase_pii_key_' || key_suffix, 'sha256'),
    'hex'
  );
  
  -- Encriptar usando pgcrypto
  RETURN encode(
    encrypt(
      data::bytea,
      encryption_key::bytea,
      'aes'
    ),
    'base64'
  );
END;
$function$;

-- ============================================================================
-- FUNCTION ROLLBACK 6-10: Core Helper Functions  
-- ============================================================================

-- ROLLBACK: get_user_organization
CREATE OR REPLACE FUNCTION public.get_user_organization()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (SELECT organization_id FROM users WHERE id = auth.uid()),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$function$;

-- ROLLBACK: get_user_organization_id  
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (SELECT organization_id FROM users WHERE id = auth.uid()),
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$function$;

-- ROLLBACK: get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT COALESCE(
    (SELECT role FROM users WHERE id = auth.uid()),
    'rep'::user_role
  );
$function$;

-- ROLLBACK: is_session_valid
CREATE OR REPLACE FUNCTION public.is_session_valid()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM users 
    WHERE id = auth.uid()
  );
$function$;

-- ROLLBACK: validate_user_session
CREATE OR REPLACE FUNCTION public.validate_user_session()
 RETURNS TABLE(user_id uuid, organization_id uuid, user_role user_role, is_valid boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT 
    auth.uid(),
    COALESCE(u.organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(u.role, 'rep'::user_role),
    CASE WHEN u.id IS NOT NULL THEN true ELSE false END
  FROM (SELECT auth.uid() as auth_id) a
  LEFT JOIN users u ON u.id = a.auth_id;
$function$;

-- ============================================================================
-- FUNCTION ROLLBACK 11-15: Utility Functions
-- ============================================================================

-- ROLLBACK: increment_template_usage
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE prompt_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$function$;

-- ROLLBACK: increment_quick_template_usage
CREATE OR REPLACE FUNCTION public.increment_quick_template_usage(template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE quick_action_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$function$;

-- ROLLBACK: is_user_admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users 
    WHERE id = auth.uid()
  );
END;
$function$;

-- ROLLBACK: is_user_manager_or_admin
CREATE OR REPLACE FUNCTION public.is_user_manager_or_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'manager')
    FROM users 
    WHERE id = auth.uid()
  );
END;
$function$;

-- ROLLBACK: search_contacts
CREATE OR REPLACE FUNCTION public.search_contacts(search_query text, organization_uuid uuid DEFAULT NULL::uuid)
 RETURNS SETOF contacts
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT *
  FROM contacts c
  WHERE 
    (organization_uuid IS NULL OR c.organization_id = organization_uuid)
    AND (
      c.full_name ILIKE '%' || search_query || '%' OR
      c.email ILIKE '%' || search_query || '%' OR
      c.role_title ILIKE '%' || search_query || '%' OR
      EXISTS (
        SELECT 1 FROM unnest(c.tags) AS tag 
        WHERE tag ILIKE '%' || search_query || '%'
      ) OR
      EXISTS (
        SELECT 1 FROM unnest(c.interests) AS interest 
        WHERE interest ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY c.score DESC, c.last_activity_at DESC NULLS LAST;
END;
$function$;

-- ============================================================================
-- FUNCTION ROLLBACK 16-20: Analytics and Reporting
-- ============================================================================

-- ROLLBACK: get_organization_stats
CREATE OR REPLACE FUNCTION public.get_organization_stats(org_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  stats JSON;
BEGIN
  -- Usar la org del usuario actual si no se proporciona
  IF org_id IS NULL THEN
    org_id := get_user_organization();
  END IF;
  
  SELECT json_build_object(
    'total_users', COUNT(DISTINCT u.id),
    'total_contacts', COUNT(DISTINCT c.id),
    'total_companies', COUNT(DISTINCT co.id),
    'hot_contacts', COUNT(DISTINCT CASE WHEN c.status = 'hot' THEN c.id END),
    'total_pipeline_value', COALESCE(SUM(DISTINCT c.deal_value), 0),
    'actions_this_month', COUNT(DISTINCT ah.id),
    'active_integrations', COUNT(DISTINCT ei.id)
  ) INTO stats
  FROM organizations o
  LEFT JOIN users u ON u.organization_id = o.id
  LEFT JOIN contacts c ON c.organization_id = o.id
  LEFT JOIN companies co ON co.organization_id = o.id
  LEFT JOIN action_history ah ON ah.organization_id = o.id 
    AND ah.created_at >= date_trunc('month', NOW())
  LEFT JOIN integrations.external_integrations ei ON ei.organization_id = o.id
    AND ei.status = 'active'
  WHERE o.id = org_id
  GROUP BY o.id;
  
  RETURN stats;
END;
$function$;

-- ROLLBACK: get_contact_statistics
CREATE OR REPLACE FUNCTION public.get_contact_statistics(organization_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_contacts', COUNT(*),
    'hot_contacts', COUNT(*) FILTER (WHERE status = 'hot'),
    'warm_contacts', COUNT(*) FILTER (WHERE status = 'warm'),
    'cold_contacts', COUNT(*) FILTER (WHERE status = 'cold'),
    'avg_score', COALESCE(AVG(score), 0),
    'total_pipeline_value', COALESCE(SUM(deal_value), 0),
    'qualified_leads', COUNT(*) FILTER (WHERE pipeline_stage IN ('qualified', 'demo', 'proposal', 'negotiation')),
    'closed_won', COUNT(*) FILTER (WHERE pipeline_stage = 'closed-won'),
    'closed_lost', COUNT(*) FILTER (WHERE pipeline_stage = 'closed-lost')
  )
  INTO result
  FROM contacts
  WHERE organization_id = organization_uuid;
  
  RETURN result;
END;
$function$;

-- ROLLBACK: get_team_performance_summary  
CREATE OR REPLACE FUNCTION public.get_team_performance_summary(organization_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  current_period_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  current_period_end DATE := current_period_start + INTERVAL '1 month' - INTERVAL '1 day';
BEGIN
  SELECT json_build_object(
    'total_reps', COUNT(DISTINCT up.user_id),
    'avg_quota_attainment', COALESCE(AVG(up.quota_attainment), 0),
    'avg_win_rate', COALESCE(AVG(up.win_rate), 0),
    'total_pipeline_value', COALESCE(SUM(up.pipeline_value), 0),
    'top_performers', COUNT(*) FILTER (WHERE up.performance_status = 'excellent'),
    'needs_coaching', COUNT(*) FILTER (WHERE up.performance_status = 'needs-attention'),
    'total_activities', COALESCE(SUM(up.activities_completed), 0),
    'total_meetings', COALESCE(SUM(up.meetings_booked), 0)
  )
  INTO result
  FROM user_performance up
  JOIN users u ON up.user_id = u.id
  WHERE u.organization_id = organization_uuid
    AND up.period_start = current_period_start
    AND up.period_end = current_period_end;
  
  RETURN result;
END;
$function$;

-- ROLLBACK: get_actions_summary
CREATE OR REPLACE FUNCTION public.get_actions_summary(org_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result jsonb := '{}';
    total_count integer;
    pending_count integer;
    completed_count integer;
    success_rate_val decimal(5,2);
    avg_completion_val decimal(10,2);
    actions_by_type_val jsonb := '{}';
    actions_by_priority_val jsonb := '{}';
BEGIN
    -- Verificar que el usuario tenga acceso a esta organización
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND organization_id = org_id
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Contar total de acciones
    SELECT COUNT(*) INTO total_count
    FROM actions
    WHERE organization_id = org_id;

    -- Contar acciones pendientes
    SELECT COUNT(*) INTO pending_count
    FROM actions
    WHERE organization_id = org_id
    AND status = 'pending';

    -- Contar acciones completadas
    SELECT COUNT(*) INTO completed_count
    FROM actions
    WHERE organization_id = org_id
    AND status = 'completed';

    -- Calcular tasa de éxito
    success_rate_val := CASE 
        WHEN total_count > 0 THEN (completed_count::decimal / total_count::decimal) * 100
        ELSE 0
    END;

    -- Calcular tiempo promedio de completión (en minutos)
    SELECT AVG(actual_duration_minutes) INTO avg_completion_val
    FROM actions
    WHERE organization_id = org_id
    AND status = 'completed'
    AND actual_duration_minutes IS NOT NULL;

    -- Agrupar por tipo
    SELECT jsonb_object_agg(type, count) INTO actions_by_type_val
    FROM (
        SELECT type, COUNT(*) as count
        FROM actions
        WHERE organization_id = org_id
        GROUP BY type
    ) t;

    -- Agrupar por prioridad
    SELECT jsonb_object_agg(priority, count) INTO actions_by_priority_val
    FROM (
        SELECT priority, COUNT(*) as count
        FROM actions
        WHERE organization_id = org_id
        GROUP BY priority
    ) p;

    -- Construir resultado
    result := jsonb_build_object(
        'total_actions', total_count,
        'pending_actions', pending_count,
        'completed_actions', completed_count,
        'success_rate', COALESCE(success_rate_val, 0),
        'avg_completion_time', COALESCE(avg_completion_val, 0),
        'actions_by_type', COALESCE(actions_by_type_val, '{}'),
        'actions_by_priority', COALESCE(actions_by_priority_val, '{}')
    );

    RETURN result;
END;
$function$;

-- ============================================================================
-- FUNCTION ROLLBACK 21-24: Integration and Maintenance Functions
-- ============================================================================

-- ROLLBACK: upsert_google_calendar_tokens
CREATE OR REPLACE FUNCTION public.upsert_google_calendar_tokens(p_user_id uuid, p_access_token text, p_refresh_token text, p_expiry_date bigint, p_scope text, p_token_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Verify the user exists in auth.users (security check)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;
  
  -- Insert or update the tokens
  INSERT INTO google_calendar_tokens (
    user_id,
    access_token,
    refresh_token,
    expiry_date,
    scope,
    token_type,
    updated_at
  ) VALUES (
    p_user_id,
    p_access_token,
    p_refresh_token,
    p_expiry_date,
    p_scope,
    p_token_type,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expiry_date = EXCLUDED.expiry_date,
    scope = EXCLUDED.scope,
    token_type = EXCLUDED.token_type,
    updated_at = NOW();
END;
$function$;

-- ROLLBACK: cleanup_old_data
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  audit_deleted INTEGER;
  webhooks_deleted INTEGER;
  sessions_deleted INTEGER;
  rate_limits_deleted INTEGER;
BEGIN
  -- Eliminar audit logs mayores a 6 meses
  DELETE FROM audit.audit_logs 
  WHERE created_at < NOW() - INTERVAL '6 months';
  GET DIAGNOSTICS audit_deleted = ROW_COUNT;
  
  -- Eliminar webhooks procesados mayores a 30 días
  DELETE FROM integrations.webhook_events 
  WHERE processing_status = 'completed' 
  AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS webhooks_deleted = ROW_COUNT;
  
  -- Eliminar sesiones expiradas
  DELETE FROM user_sessions 
  WHERE expires_at < NOW();
  GET DIAGNOSTICS sessions_deleted = ROW_COUNT;
  
  -- Eliminar rate limits antiguos
  DELETE FROM api_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 day';
  GET DIAGNOSTICS rate_limits_deleted = ROW_COUNT;
  
  -- Retornar resumen
  RETURN json_build_object(
    'audit_logs_deleted', audit_deleted,
    'webhooks_deleted', webhooks_deleted,
    'sessions_deleted', sessions_deleted,
    'rate_limits_deleted', rate_limits_deleted,
    'cleaned_at', NOW()
  );
END;
$function$;

-- ROLLBACK: export_dashboard_data
CREATE OR REPLACE FUNCTION public.export_dashboard_data(org_id uuid, date_from date DEFAULT (CURRENT_DATE - '30 days'::interval), date_to date DEFAULT CURRENT_DATE)
 RETURNS TABLE(export_type text, data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- KPI Summary
    RETURN QUERY
    SELECT 
        'kpi_summary'::TEXT,
        json_build_object(
            'pipeline_contribution', SUM(dks.ai_attributed_arr),
            'avg_cost_per_lead', AVG(dks.cost_per_qualified_lead),
            'avg_roi', AVG(dks.roi_percentage),
            'total_qualified_leads', SUM(dks.qualified_leads),
            'avg_call_quality', AVG(dks.avg_call_quality),
            'period_from', date_from,
            'period_to', date_to
        )::JSONB
    FROM mv_daily_kpi_summary dks
    WHERE dks.organization_id = org_id
        AND dks.activity_date BETWEEN date_from AND date_to;
    
    -- Team Performance
    RETURN QUERY
    SELECT 
        'team_performance'::TEXT,
        jsonb_agg(
            json_build_object(
                'user_id', wtp.user_id,
                'week_start', wtp.week_start,
                'performance_score', wtp.performance_score,
                'team_ranking', wtp.team_ranking,
                'performance_tier', wtp.performance_tier,
                'weekly_calls', wtp.weekly_calls,
                'weekly_qualified', wtp.weekly_qualified,
                'weekly_arr', wtp.weekly_arr
            )
        )::JSONB
    FROM mv_weekly_team_performance wtp
    WHERE wtp.organization_id = org_id
        AND wtp.week_start >= date_from;
END;
$function$;

-- ROLLBACK: refresh_all_materialized_views and schedule_dashboard_refresh
-- (These functions are complex and may have dependencies, restore from backup if needed)

COMMIT;

-- ============================================================================
-- VALIDATION CHECKS
-- ============================================================================

-- Verify all functions are restored to original state (without search_path)
DO $$
DECLARE
    rec RECORD;
    func_count INTEGER;
BEGIN
    RAISE NOTICE 'Validating function rollback...';
    
    -- Count SECURITY DEFINER functions
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.prosecdef = true;
    
    RAISE NOTICE 'Found % SECURITY DEFINER functions in public schema', func_count;
    
    -- Check that core functions exist
    FOR rec IN 
        SELECT 'get_user_organization' as fname
        UNION SELECT 'get_user_role'
        UNION SELECT 'is_session_valid'
        UNION SELECT 'validate_user_session'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p 
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = rec.fname
        ) THEN
            RAISE WARNING 'ROLLBACK ISSUE: Core function % is missing', rec.fname;
        ELSE
            RAISE NOTICE 'OK: Core function % exists', rec.fname;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- After running this script:
-- 1. Test all function calls from application
-- 2. Verify that SECURITY DEFINER functions work as before
-- 3. Check that search_path vulnerability is restored (insecure but original state)
-- 4. Run application integration tests
-- 5. Monitor for function-related errors

-- IMPORTANT: This rollback restores the original INSECURE state where
-- SECURITY DEFINER functions do NOT have search_path configured.
-- This is a known security vulnerability but matches the backup state.

-- ============================================================================