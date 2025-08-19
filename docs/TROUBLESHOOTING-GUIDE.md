# RLS Troubleshooting Guide

## Quick Reference

This guide provides systematic troubleshooting procedures for Row Level Security (RLS) issues in the Sales Advisor App.

## Emergency Contacts

- **Development Team**: Immediate escalation for RLS failures
- **Security Team**: For potential security breaches
- **DevOps Team**: For infrastructure and deployment issues

## Common Issues & Solutions

### 1. User Authentication & Access Issues

#### 🚨 Issue: User cannot log in after RLS implementation
**Symptoms:**
- Login fails with "Authentication error"
- User redirected to login page repeatedly
- Console shows "User organization not found"

**Diagnosis Commands:**
```sql
-- Check if user exists and has organization
SELECT id, email, organization_id, role, created_at 
FROM users 
WHERE email = 'user@company.com';

-- Check auth user exists
SELECT auth.uid() as current_user;

-- Verify RLS is properly enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
```

**Solutions:**
```sql
-- Solution 1: Fix missing organization_id
UPDATE users 
SET organization_id = 'correct-org-uuid' 
WHERE email = 'user@company.com' AND organization_id IS NULL;

-- Solution 2: Temporarily disable RLS for emergency access
ALTER TABLE users DISABLE ROW LEVEL SECURITY; -- EMERGENCY ONLY
-- Remember to re-enable: ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Solution 3: Check policy conflicts
SELECT * FROM pg_policies WHERE tablename = 'users';
```

#### 🚨 Issue: User sees "Insufficient permissions" error
**Symptoms:**
- User authenticated but cannot access data
- API returns 403 Forbidden
- Console shows "RLS policy violation"

**Diagnosis:**
```typescript
// Debug user context
const authContext = await getAuthContext(supabase);
console.log('User context:', authContext);

// Check user role and organization
const profile = await getCurrentUserProfile(supabase);
console.log('User profile:', profile);
```

**Solutions:**
```sql
-- Solution 1: Fix user role
UPDATE users 
SET role = 'rep' 
WHERE id = 'user-uuid' AND role IS NULL;

-- Solution 2: Check organization membership
SELECT u1.email as user_email, u1.organization_id as user_org,
       u2.email as target_email, u2.organization_id as target_org
FROM users u1, users u2 
WHERE u1.id = auth.uid() AND u2.email = 'target@company.com';
```

### 2. Data Visibility Issues

#### 🚨 Issue: User cannot see team members
**Symptoms:**
- Team list appears empty
- Individual team member profiles show 404
- Manager cannot see subordinate data

**Diagnosis Commands:**
```sql
-- Check team member organization alignment
SELECT email, organization_id, role 
FROM users 
WHERE organization_id = (
  SELECT organization_id FROM users WHERE id = auth.uid()
);

-- Verify team member policies
SELECT * FROM pg_policies 
WHERE tablename = 'users' 
AND policyname LIKE '%team%';
```

**Solutions:**
```typescript
// Solution 1: Use proper helper functions
// ❌ Wrong way
const team = await supabase.from('users').select('*');

// ✅ Correct way  
const team = await getTeamMembers(supabase, organizationId);

// Solution 2: Check organization context
const orgId = await getCurrentUserOrganizationId(supabase);
if (!orgId) {
  throw new Error('User has no organization assigned');
}
```

#### 🚨 Issue: Meeting participants not visible
**Symptoms:**
- Meeting loads but participant list is empty
- Cannot add participants to meetings
- Participant enrichment fails

**Diagnosis:**
```sql
-- Check meeting-participant relationship
SELECT m.id as meeting_id, m.organization_id as meeting_org,
       mp.email, mp.organization_id as participant_org
FROM meetings m
LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
WHERE m.id = 'meeting-uuid';

-- Check cross-reference policies
SELECT * FROM pg_policies 
WHERE tablename = 'meeting_participants';
```

**Solutions:**
```sql
-- Solution 1: Fix participant organization alignment
UPDATE meeting_participants 
SET organization_id = (
  SELECT organization_id FROM meetings 
  WHERE id = meeting_participants.meeting_id
)
WHERE organization_id IS NULL;

-- Solution 2: Verify meeting ownership
SELECT * FROM meetings 
WHERE id = 'meeting-uuid' 
AND organization_id = get_user_organization();
```

### 3. Performance Issues

#### 🚨 Issue: Slow query performance after RLS
**Symptoms:**
- Page load times increased significantly
- API timeouts
- Database CPU usage high

**Diagnosis Commands:**
```sql
-- Check query execution plans
EXPLAIN ANALYZE SELECT * FROM contacts 
WHERE organization_id = get_user_organization();

-- Identify missing indexes
SELECT schemaname, tablename, attname, inherited, n_distinct, correlation
FROM pg_stats 
WHERE tablename IN ('contacts', 'users', 'meetings')
AND schemaname = 'public';

-- Check slow queries
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements 
WHERE query LIKE '%organization_id%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solutions:**
```sql
-- Solution 1: Add composite indexes
CREATE INDEX CONCURRENTLY idx_contacts_org_user 
ON contacts (organization_id, user_id);

CREATE INDEX CONCURRENTLY idx_meetings_org_date 
ON meetings (organization_id, scheduled_for);

-- Solution 2: Optimize RLS functions
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
STABLE -- Mark as STABLE for better performance
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (SELECT organization_id FROM users WHERE id = auth.uid());
END;
$$;

-- Solution 3: Use partial indexes for common patterns
CREATE INDEX CONCURRENTLY idx_active_users_org 
ON users (organization_id) 
WHERE role IN ('rep', 'manager', 'admin');
```

### 4. API Route Issues

#### 🚨 Issue: API routes return empty data
**Symptoms:**
- Frontend receives empty arrays
- API logs show successful queries but no results
- Data exists in database but not returned

**Diagnosis:**
```typescript
// Debug API route
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('API Auth user:', user?.id, error);
  
  // Check organization context
  const authContext = await getAuthContext(supabase);
  console.log('API Auth context:', authContext);
  
  // Test direct query
  const { data, error: queryError } = await supabase
    .from('contacts')
    .select('*');
  console.log('Query result:', data?.length, queryError);
  
  return NextResponse.json({ user, authContext, data, queryError });
}
```

**Solutions:**
```typescript
// Solution 1: Use server-side Supabase client
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabase = createServerComponentClient({ cookies });

// Solution 2: Proper error handling
try {
  const authContext = await getAuthContext(supabase);
  const data = await supabase.from('table').select('*');
  return NextResponse.json(data);
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Authentication failed' }, 
    { status: 401 }
  );
}
```

### 5. Migration Issues

#### 🚨 Issue: RLS migration breaks existing functionality
**Symptoms:**
- Previously working features now fail
- Users locked out of their data
- Cascade of application errors

**Immediate Response:**
```bash
# Emergency rollback
cd /path/to/project
./supabase/backups/rollback-scripts/rollback-all.sh
```

**Diagnosis:**
```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Identify problematic policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for orphaned data
SELECT tablename, 
       COUNT(*) as total_rows,
       COUNT(*) FILTER (WHERE organization_id IS NULL) as orphaned_rows
FROM (
  SELECT 'users' as tablename, organization_id FROM users
  UNION ALL
  SELECT 'contacts' as tablename, organization_id FROM contacts
  UNION ALL
  SELECT 'meetings' as tablename, organization_id FROM meetings
) data
GROUP BY tablename;
```

## Diagnostic Queries

### User Context Validation

```sql
-- Complete user context check
WITH user_context AS (
  SELECT 
    auth.uid() as auth_user_id,
    u.id as db_user_id,
    u.email,
    u.organization_id,
    u.role,
    u.created_at,
    CASE WHEN auth.uid() = u.id THEN '✅ MATCH' ELSE '❌ MISMATCH' END as auth_status
  FROM users u
  WHERE u.id = auth.uid()
)
SELECT * FROM user_context;
```

### RLS Status Overview

```sql
-- RLS status for all tables
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '🔒 ENABLED' ELSE '⚠️ DISABLED' END as rls_status,
  (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
```

### Organization Data Audit

```sql
-- Organization data distribution
WITH org_stats AS (
  SELECT 'users' as table_name, organization_id, COUNT(*) as row_count FROM users GROUP BY organization_id
  UNION ALL
  SELECT 'contacts' as table_name, organization_id, COUNT(*) FROM contacts GROUP BY organization_id
  UNION ALL
  SELECT 'meetings' as table_name, organization_id, COUNT(*) FROM meetings GROUP BY organization_id
  UNION ALL
  SELECT 'actions' as table_name, organization_id, COUNT(*) FROM actions GROUP BY organization_id
)
SELECT 
  table_name,
  organization_id,
  row_count,
  CASE 
    WHEN organization_id IS NULL THEN '❌ ORPHANED'
    ELSE '✅ ASSIGNED'
  END as status
FROM org_stats
ORDER BY table_name, organization_id;
```

## Recovery Procedures

### 1. Partial Recovery (Table-Specific)

If only specific tables are problematic:

```sql
-- Disable RLS for specific table
ALTER TABLE problematic_table DISABLE ROW LEVEL SECURITY;

-- Fix data issues
UPDATE problematic_table 
SET organization_id = 'correct-org-id' 
WHERE organization_id IS NULL;

-- Re-enable RLS
ALTER TABLE problematic_table ENABLE ROW LEVEL SECURITY;
```

### 2. User-Specific Recovery

If specific users are locked out:

```sql
-- Temporarily bypass RLS for user data fix
SET ROLE postgres; -- or service_role

-- Fix user organization assignment
UPDATE users 
SET organization_id = 'correct-org-id'
WHERE email = 'locked-user@company.com';

-- Reset to normal role
SET ROLE authenticated;
```

### 3. Data Migration Recovery

If data migration caused orphaned records:

```sql
-- Identify and fix orphaned records
WITH orphaned_contacts AS (
  SELECT c.id, c.email, c.company_id,
         co.organization_id as company_org_id
  FROM contacts c
  LEFT JOIN companies co ON c.company_id = co.id
  WHERE c.organization_id IS NULL
  AND co.organization_id IS NOT NULL
)
UPDATE contacts
SET organization_id = orphaned_contacts.company_org_id
FROM orphaned_contacts
WHERE contacts.id = orphaned_contacts.id;
```

## Prevention Strategies

### 1. Pre-Deployment Testing

```bash
#!/bin/bash
# RLS Testing Script

echo "Testing RLS implementation..."

# Test 1: User isolation
psql $DATABASE_URL -c "
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-org-1';
SELECT COUNT(*) FROM contacts; -- Should only see org-1 contacts
"

# Test 2: Role restrictions  
psql $DATABASE_URL -c "
SET ROLE authenticated;
SET request.jwt.claims.sub = 'regular-user';
UPDATE users SET role = 'admin' WHERE id = auth.uid(); -- Should fail
"

# Test 3: Performance benchmarking
psql $DATABASE_URL -c "
EXPLAIN ANALYZE SELECT * FROM contacts 
WHERE organization_id = get_user_organization();
"
```

### 2. Monitoring Setup

```sql
-- Create monitoring views
CREATE VIEW rls_policy_violations AS
SELECT 
  schemaname,
  tablename,
  COUNT(*) as violation_count,
  MAX(last_failure) as last_violation
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename;

-- Alert trigger for policy violations
CREATE OR REPLACE FUNCTION alert_rls_violation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log security event
  INSERT INTO security_audit_log (event_type, details, created_at)
  VALUES ('RLS_VIOLATION', 
          jsonb_build_object('table', TG_TABLE_NAME, 'user', auth.uid()),
          NOW());
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## Escalation Procedures

### Level 1: Development Team (15 minutes)
- Data visibility issues
- Performance degradation
- Non-critical access problems

### Level 2: Security Team (5 minutes)
- Authentication failures
- Potential data leaks
- Cross-organization access

### Level 3: Emergency Rollback (Immediate)
- System-wide access failure
- Critical security breach
- Data corruption

## Rollback Decision Matrix

| Issue Severity | User Impact | Data Risk | Action |
|---------------|-------------|-----------|--------|
| **Low** | <10% users | None | Patch in place |
| **Medium** | 10-50% users | Low | Targeted rollback |
| **High** | >50% users | Medium | Partial rollback |
| **Critical** | All users | High | Full rollback |

## Post-Incident Checklist

- [ ] **Document issue**: Record symptoms, root cause, and resolution
- [ ] **Update monitoring**: Add new alerts based on incident
- [ ] **Review policies**: Check if RLS policies need adjustment
- [ ] **Test recovery**: Verify all functionality restored
- [ ] **Update documentation**: Include lessons learned
- [ ] **Team briefing**: Share findings with development team

## Contact Information

**Emergency Escalation:**
- On-call Developer: [Contact Info]
- Security Team Lead: [Contact Info]  
- DevOps Manager: [Contact Info]

**Documentation Updates:**
- Technical Writer: [Contact Info]
- Product Owner: [Contact Info]

---

**Document Version:** 1.0  
**Last Updated:** 2025-08-19  
**Next Review:** 2025-09-19  
**Emergency Hotline:** [Emergency Number]