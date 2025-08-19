# Emergency Rollback Runbook

## 🚨 CRITICAL WARNING 🚨

**This runbook contains procedures to rollback Row Level Security implementation. Use only in emergency situations where RLS implementation has caused critical system failure.**

## Decision Matrix

| Severity | Impact | Recovery Time | Action Required |
|----------|--------|---------------|-----------------|
| **P0 - Critical** | System down, all users affected | < 5 minutes | Full Rollback |
| **P1 - High** | Major feature broken, >50% users | < 15 minutes | Targeted Rollback |
| **P2 - Medium** | Minor issues, <10% users affected | < 1 hour | Patch in Place |

## Pre-Rollback Assessment

### 1. Verify Rollback Necessity

**Ask these questions before proceeding:**

- [ ] Is the system completely unusable?
- [ ] Are multiple users reporting critical data access issues?
- [ ] Have patch attempts failed within 15 minutes?
- [ ] Is there evidence of data security compromise?

**If 2+ answers are YES, proceed with rollback.**

### 2. Identify Rollback Scope

#### Full Rollback Required When:
- [ ] Authentication system completely broken
- [ ] Multiple tables showing RLS policy failures
- [ ] Database performance severely degraded (>500% increase)
- [ ] Cross-organization data leaks detected

#### Targeted Rollback Sufficient When:
- [ ] Single table/feature affected
- [ ] Users can work around the issue
- [ ] Performance impact <200%
- [ ] No security implications

## Full System Rollback Procedure

### Phase 1: Emergency Response (0-5 minutes)

#### 1.1 Alert Team
```bash
# Send emergency alert
echo "EMERGENCY: RLS rollback initiated at $(date)" | mail -s "CRITICAL: Sales Advisor RLS Rollback" team@company.com

# Update status page
curl -X POST "https://status.company.com/incidents" \
  -H "Authorization: Bearer $STATUS_TOKEN" \
  -d '{"status":"investigating","message":"Database access issues - investigating"}'
```

#### 1.2 Access Database
```bash
# Connect to production database
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Verify connection
psql $DATABASE_URL -c "SELECT NOW(), version();"
```

#### 1.3 Create Emergency Backup
```bash
# Create pre-rollback snapshot
BACKUP_DIR="emergency-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Export current schema
pg_dump --schema-only --no-owner --no-privileges $DATABASE_URL > $BACKUP_DIR/current_schema.sql

# Export RLS status
psql $DATABASE_URL -c "
COPY (
  SELECT schemaname, tablename, rowsecurity, 
         (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
  FROM pg_tables t 
  WHERE schemaname = 'public'
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/rls_status.csv
```

### Phase 2: Execute Rollback (5-10 minutes)

#### 2.1 Run Master Rollback Script
```bash
# Execute the automated rollback
cd /path/to/sales-advisor-app
chmod +x supabase/backups/rollback-scripts/rollback-all.sh
./supabase/backups/rollback-scripts/rollback-all.sh
```

**Expected Output:**
```
============================================================================
SUPABASE RLS ROLLBACK - MASTER SCRIPT
Generated: 2025-01-19
WARNING: This will rollback ALL RLS changes and restore original state
============================================================================

✅ Supabase CLI found
✅ Pre-rollback backup created
✅ Step 1/3: RLS Rollback completed
✅ Step 2/3: Function Rollback completed
✅ Step 3/3: Schema Rollback completed
✅ Validation queries executed
✅ Rollback process completed successfully
```

#### 2.2 Manual Rollback (If Script Fails)

**Step 2.2.1: Disable RLS on Critical Tables**
```sql
-- Disable RLS on core tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'contacts', 'meetings', 'actions');
```

**Step 2.2.2: Restore Original Functions**
```sql
-- Remove SECURITY DEFINER from critical functions
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$;
```

### Phase 3: Validation (10-15 minutes)

#### 3.1 System Health Check
```bash
# Test application endpoints
curl -f "https://your-app.com/api/health" || echo "❌ Health check failed"

# Test user authentication
curl -X POST "https://your-app.com/api/auth/test" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' || echo "❌ Auth test failed"
```

#### 3.2 Database Validation
```sql
-- Verify RLS is disabled on critical tables
DO $$
DECLARE
  table_record RECORD;
  rls_enabled BOOLEAN;
BEGIN
  FOR table_record IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'contacts', 'meetings', 'actions')
  LOOP
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_record.tablename;
    
    IF rls_enabled THEN
      RAISE NOTICE '❌ RLS still enabled on %', table_record.tablename;
    ELSE
      RAISE NOTICE '✅ RLS disabled on %', table_record.tablename;
    END IF;
  END LOOP;
END $$;

-- Test basic queries work
SELECT COUNT(*) FROM users; -- Should return total user count
SELECT COUNT(*) FROM contacts; -- Should return all contacts
SELECT COUNT(*) FROM meetings; -- Should return all meetings
```

#### 3.3 Application Function Test
```bash
# Test key user journeys
echo "Testing user login..."
curl -X POST "https://your-app.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com","password":"testpass"}'

echo "Testing data access..."
curl -H "Authorization: Bearer $TEST_TOKEN" \
  "https://your-app.com/api/contacts"

echo "Testing meeting creation..."
curl -X POST "https://your-app.com/api/meetings" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Meeting","date":"2025-08-20T10:00:00Z"}'
```

### Phase 4: Communication (15-20 minutes)

#### 4.1 Update Status Page
```bash
# Update incident status
curl -X PUT "https://status.company.com/incidents/$INCIDENT_ID" \
  -H "Authorization: Bearer $STATUS_TOKEN" \
  -d '{
    "status":"resolved",
    "message":"Database access restored. System operating normally.",
    "resolved_at":"'$(date -Iseconds)'"
  }'
```

#### 4.2 Team Notification
```bash
# Send all-clear notification
echo "✅ RESOLVED: Sales Advisor RLS rollback completed successfully at $(date).

System Status: OPERATIONAL
- User authentication: ✅ Working
- Data access: ✅ Restored  
- API endpoints: ✅ Responding
- Database: ✅ Operating normally

Next Steps:
1. Monitor system for 1 hour
2. Review rollback logs
3. Plan RLS re-implementation with fixes

Incident Duration: $(($(date +%s) - $INCIDENT_START))s" | \
mail -s "RESOLVED: Sales Advisor System Restored" team@company.com
```

## Targeted Rollback Procedures

### Single Table Rollback

When only one table is causing issues:

```sql
-- Example: Rolling back contacts table only
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Remove problematic policies
DROP POLICY IF EXISTS "contacts_org_isolation" ON contacts;
DROP POLICY IF EXISTS "contacts_user_access" ON contacts;

-- Test table access
SELECT COUNT(*) FROM contacts; -- Should work normally

-- Gradually re-enable with simpler policy
CREATE POLICY "contacts_simple_org" ON contacts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Re-enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
```

### Function-Specific Rollback

When RLS functions are causing issues:

```sql
-- Remove SECURITY DEFINER temporarily
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID
LANGUAGE plpgsql  -- Removed SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT organization_id FROM users WHERE id = auth.uid());
END;
$$;

-- Test function
SELECT get_user_organization(); -- Should return UUID

-- Add back SECURITY DEFINER when ready
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (SELECT organization_id FROM users WHERE id = auth.uid());
END;
$$;
```

## Post-Rollback Checklist

### Immediate (0-30 minutes)
- [ ] All critical systems operational
- [ ] User authentication working
- [ ] Data access restored
- [ ] API endpoints responding
- [ ] Status page updated
- [ ] Team notified

### Short-term (30 minutes - 2 hours)
- [ ] Monitor error logs
- [ ] Check user feedback channels
- [ ] Verify data integrity
- [ ] Document incident timeline
- [ ] Preserve rollback logs

### Medium-term (2-24 hours)
- [ ] Conduct incident post-mortem
- [ ] Analyze root cause
- [ ] Plan RLS re-implementation
- [ ] Update rollback procedures
- [ ] Review monitoring alerts

## Monitoring During Rollback

### Key Metrics to Watch

```bash
# Database connections
psql $DATABASE_URL -c "
SELECT COUNT(*) as active_connections,
       MAX(query_start) as latest_query
FROM pg_stat_activity 
WHERE state = 'active';
"

# Query performance
psql $DATABASE_URL -c "
SELECT query, mean_exec_time, calls
FROM pg_stat_statements 
WHERE query LIKE '%users%' OR query LIKE '%contacts%'
ORDER BY mean_exec_time DESC 
LIMIT 5;
"

# Error rates
tail -f /var/log/application.log | grep ERROR | wc -l
```

### Application Health Indicators

```bash
# Response time monitoring
for endpoint in "/api/health" "/api/users/me" "/api/contacts"; do
  time curl -f "https://your-app.com$endpoint" > /dev/null 2>&1
  echo "Endpoint $endpoint: $?"
done

# User session monitoring
psql $DATABASE_URL -c "
SELECT COUNT(*) as active_sessions,
       COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '5 minutes') as recent_sessions
FROM user_sessions 
WHERE is_active = true;
"
```

## Recovery Time Objectives (RTO)

| Rollback Type | Target RTO | Maximum RTO |
|---------------|------------|-------------|
| **Full Rollback** | 15 minutes | 30 minutes |
| **Targeted Rollback** | 10 minutes | 20 minutes |
| **Function Rollback** | 5 minutes | 10 minutes |

## Prevention for Future

### Pre-Deployment Checklist
- [ ] RLS tested in staging environment
- [ ] Performance benchmarks completed
- [ ] Rollback scripts tested
- [ ] Team trained on procedures
- [ ] Monitoring alerts configured

### Rollback Testing Schedule
- **Monthly**: Test rollback scripts in staging
- **Quarterly**: Full rollback drill with team
- **Annually**: Review and update procedures

## Emergency Contacts

**Immediate Response Team:**
- Lead Developer: [Phone] / [Email]
- DevOps Engineer: [Phone] / [Email]  
- Database Administrator: [Phone] / [Email]

**Escalation:**
- Engineering Manager: [Phone] / [Email]
- CTO: [Phone] / [Email]
- Customer Success: [Phone] / [Email]

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-19  
**Next Drill:** 2025-09-19  
**Emergency Hotline:** [24/7 Number]