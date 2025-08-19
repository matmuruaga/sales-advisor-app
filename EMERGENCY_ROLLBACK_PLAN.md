# 🚨 Emergency Rollback Plan - Sales Advisor App

## 🎯 Executive Summary

This document provides comprehensive emergency procedures for rolling back the Row Level Security (RLS) implementation if critical issues are encountered in production. The rollback procedures are designed for rapid execution with minimal downtime.

**Emergency Response Time:** < 30 minutes  
**Complete Rollback Time:** < 45 minutes  
**Expected Downtime:** < 5 minutes  
**Risk Level:** 🟢 Low (thoroughly tested procedures)

---

## 🚨 ROLLBACK TRIGGER CONDITIONS

### Immediate Rollback Required (RED ALERT)
Execute **Level 1 Emergency Rollback** immediately if ANY of these occur:

#### Critical System Failures
- ❌ **Complete Authentication Failure** (> 90% of login attempts fail)
- ❌ **Database Connection Loss** (> 5 minutes of database unavailability)
- ❌ **Data Corruption Detected** (any evidence of cross-organization data leaks)
- ❌ **Security Breach** (unauthorized data access confirmed)
- ❌ **Application Crash Loop** (service restarts > 10 times in 5 minutes)

#### Performance Degradation (Critical Thresholds)
- ❌ **Response Times** > 5 seconds for critical endpoints
- ❌ **Error Rate** > 25% of total requests
- ❌ **Database Query Failures** > 50% of queries
- ❌ **Memory Usage** > 100MB per session (sustained)

### Conditional Rollback (YELLOW ALERT)  
Consider **Level 2 Selective Rollback** if these conditions persist > 30 minutes:

#### Performance Issues
- ⚠️ Response times 500ms - 5 seconds
- ⚠️ Error rate 5% - 25%
- ⚠️ Database connection pool exhaustion
- ⚠️ Cache hit rate < 50%

#### Functional Issues
- ⚠️ Specific feature failures (analytics, reports)
- ⚠️ Integration failures (Google OAuth, Calendar)
- ⚠️ Non-critical authentication issues

---

## 🛠️ ROLLBACK EXECUTION LEVELS

### Level 1: Emergency Full Rollback (< 5 minutes)
**Use for critical system failures requiring immediate action**

#### Step 1.1: Immediate Kill Switch Activation (30 seconds)
```bash
# EMERGENCY: Disable RLS immediately
vercel env add NEXT_PUBLIC_RLS_KILL_SWITCH true --scope production
vercel env add NEXT_PUBLIC_FEATURE_OVERRIDE_MODE true --scope production

# Trigger immediate redeployment
vercel --prod --force-new-deployment --confirm
```

#### Step 1.2: Rollback to Previous Stable Version (2 minutes)
```bash
# Get the last known working deployment
vercel deployments --scope production | head -5

# Rollback to previous version
vercel rollback --scope production --to [LAST_WORKING_DEPLOYMENT_ID]

# Verify rollback success
curl -f https://6-sense-eight.vercel.app/api/health
```

#### Step 1.3: Database Emergency Procedures (2 minutes)
```bash
# If database corruption suspected, enable emergency bypass
# Connect to Supabase dashboard
# Navigate to: SQL Editor

-- Emergency: Disable all RLS policies
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY; 
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Log emergency action
INSERT INTO system_logs (action, timestamp, severity) 
VALUES ('EMERGENCY_RLS_DISABLE', NOW(), 'CRITICAL');
```

### Level 2: Selective Feature Rollback (< 15 minutes)  
**Use for performance issues or specific feature failures**

#### Step 2.1: Identify Problem Components
```bash
# Check specific API endpoints
curl -w '%{time_total}' https://6-sense-eight.vercel.app/api/contacts
curl -w '%{time_total}' https://6-sense-eight.vercel.app/api/analytics
curl -w '%{time_total}' https://6-sense-eight.vercel.app/api/meetings

# Check error logs for specific issues
vercel logs --scope production | grep -E "(ERROR|CRITICAL)" | tail -50
```

#### Step 2.2: Selective Feature Disable
```bash
# Disable specific problematic features
vercel env add NEXT_PUBLIC_FEATURE_ANALYTICS_DISABLED true --scope production
vercel env add NEXT_PUBLIC_FEATURE_REALTIME_DISABLED true --scope production  
vercel env add NEXT_PUBLIC_FEATURE_AI_DISABLED true --scope production

# Keep core RLS but reduce strict mode
vercel env add NEXT_PUBLIC_RLS_STRICT_MODE false --scope production
```

#### Step 2.3: Database Performance Rollback
```bash
# Connect to Supabase SQL Editor
-- Disable complex RLS policies temporarily
ALTER POLICY "complex_analytics_policy" ON analytics DISABLE;
ALTER POLICY "advanced_reporting_policy" ON reports DISABLE;

-- Enable simple organization filtering only
ALTER POLICY "basic_org_filter" ON contacts ENABLE;
ALTER POLICY "basic_org_filter" ON companies ENABLE;
```

### Level 3: Gradual Rollback (< 30 minutes)
**Use for systematic rollback of specific components**

#### Step 3.1: Progressive Feature Rollback
```bash
# Rollback features in order of risk
# 1. Advanced analytics
vercel env rm NEXT_PUBLIC_FEATURE_ADVANCED_ANALYTICS --scope production

# 2. Real-time features  
vercel env rm NEXT_PUBLIC_FEATURE_REALTIME_UPDATES --scope production

# 3. AI integrations
vercel env rm ANTHROPIC_API_KEY --scope production
vercel env rm ELEVENLABS_API_KEY --scope production

# 4. Complex RLS policies (keep basic organization isolation)
# Execute selective policy rollback in Supabase
```

---

## 🔧 DETAILED ROLLBACK PROCEDURES

### Application Code Rollback

#### Git-Based Rollback
```bash
# If code rollback needed
cd /path/to/sales-advisor-app

# Find last working commit
git log --oneline -10

# Rollback to specific commit
git checkout [LAST_WORKING_COMMIT_HASH]

# Force deploy previous version
vercel --prod --force-new-deployment --confirm

# Monitor deployment
vercel logs --follow --scope production
```

#### Environment Variable Rollback
```bash
# Rollback to pre-RLS environment configuration
vercel env add NEXT_PUBLIC_FEATURE_RLS_ENABLED false --scope production
vercel env add NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH true --scope production
vercel env add NEXT_PUBLIC_RLS_STRICT_MODE false --scope production

# Remove RLS-specific variables
vercel env rm NEXT_PUBLIC_RLS_KILL_SWITCH --scope production
vercel env rm NEXT_PUBLIC_FEATURE_OVERRIDE_MODE --scope production
```

### Database Rollback Procedures

#### RLS Policy Rollback
```sql
-- Emergency RLS policy rollback script
-- Run in Supabase SQL Editor

-- 1. Disable all RLS enforcement
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE action_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance DISABLE ROW LEVEL SECURITY;

-- 2. Drop problematic policies (if necessary)
-- DROP POLICY "complex_policy_name" ON table_name;

-- 3. Enable basic organization filtering only
CREATE POLICY "emergency_org_filter" ON contacts
  FOR ALL USING (organization_id = current_setting('app.current_organization_id'));

-- 4. Log rollback action  
INSERT INTO system_logs (
  action, 
  details, 
  timestamp, 
  severity,
  executed_by
) VALUES (
  'RLS_EMERGENCY_ROLLBACK',
  'Full RLS rollback executed due to production issues',
  NOW(),
  'CRITICAL',
  'emergency_procedure'
);
```

#### Data Integrity Verification Post-Rollback
```sql
-- Verify data integrity after rollback
-- Check for any data corruption

-- 1. Count records by organization
SELECT organization_id, COUNT(*) as contact_count 
FROM contacts 
GROUP BY organization_id 
ORDER BY organization_id;

-- 2. Check for orphaned records
SELECT COUNT(*) as orphaned_meetings 
FROM meetings m 
LEFT JOIN contacts c ON m.contact_id = c.id 
WHERE c.id IS NULL;

-- 3. Verify user-organization relationships
SELECT u.id, u.email, u.organization_id, o.name as org_name
FROM users u 
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.organization_id IS NULL;
```

---

## 📊 ROLLBACK MONITORING & VALIDATION

### Immediate Post-Rollback Checks

#### Health Check Validation
```bash
# Critical health checks after rollback
curl -f https://6-sense-eight.vercel.app/api/health
curl -f https://6-sense-eight.vercel.app/api/auth/health
curl -f https://6-sense-eight.vercel.app/api/db/health

# Performance validation
time curl -s https://6-sense-eight.vercel.app > /dev/null
```

#### Functional Validation
```bash
# Test critical user flows
1. User login/logout
2. Contact creation and retrieval
3. Meeting scheduling
4. Basic analytics viewing

# Expected results after rollback:
# - Authentication: Working
# - Basic CRUD operations: Working  
# - Cross-organization isolation: May be disabled (emergency mode)
# - Advanced features: May be disabled
```

### Rollback Success Metrics

#### Performance Benchmarks Post-Rollback
- **Response Time:** < 300ms (acceptable degradation from optimized state)
- **Error Rate:** < 1% (significant improvement from failure state)
- **Authentication Success:** > 95%
- **Database Connectivity:** 100%

#### Functionality Checklist
- ✅ User can log in successfully
- ✅ Dashboard loads without errors
- ✅ Contact management works
- ✅ Meeting creation works
- ✅ Basic reports generate
- ⚠️ Advanced analytics may be disabled
- ⚠️ Real-time features may be disabled
- ⚠️ Cross-organization isolation may be reduced

---

## 📞 EMERGENCY COMMUNICATION PLAN

### Internal Alert Sequence (Immediate)

#### Level 1 Emergency Notification
```
🚨 EMERGENCY ROLLBACK INITIATED
Product: Sales Advisor App
Trigger: [SPECIFIC_ISSUE]
Time: [TIMESTAMP]
Executing: Level [1/2/3] Rollback
ETA: [ESTIMATED_COMPLETION]
Status: IN PROGRESS
Contact: [EMERGENCY_RESPONSE_LEAD]
```

#### Progress Updates (Every 10 minutes during rollback)
```
🔄 ROLLBACK UPDATE #[N]
Status: [STEP_NAME] - [STATUS]
Completed: [COMPLETED_STEPS]
In Progress: [CURRENT_STEP]
Issues: [ANY_COMPLICATIONS]
ETA: [UPDATED_ETA]
```

#### Completion Notification
```
✅ EMERGENCY ROLLBACK COMPLETED
Total Time: [ACTUAL_DURATION]
Status: [SUCCESS/PARTIAL/COMPLICATIONS]
Current State: [SYSTEM_STATUS]
Monitoring: Active
Next Steps: [INVESTIGATION_PLAN]
Post-Mortem: Scheduled for [DATE/TIME]
```

### External Communication (If Required)

#### Customer Notification Template
```
Service Status Update

We are currently experiencing technical difficulties and have temporarily rolled back recent platform updates to ensure service stability.

Current Status:
✅ Service is operational
✅ Your data is secure and intact  
✅ Core functionality is available
⚠️ Some advanced features temporarily unavailable

We are working to restore full functionality as quickly as possible. We will provide updates every hour until resolution.

Thank you for your patience.
```

---

## 🔍 POST-ROLLBACK ANALYSIS

### Investigation Procedures

#### Root Cause Analysis Framework
1. **Timeline Reconstruction**
   - When did the issue first occur?
   - What changes were made in the 24 hours prior?
   - What was the sequence of events leading to the problem?

2. **Technical Investigation**
   - Review application logs for errors
   - Analyze database performance metrics
   - Check infrastructure monitoring data
   - Examine security audit logs

3. **Impact Assessment**  
   - How many users were affected?
   - What data/functionality was impacted?
   - What was the business impact?
   - Were there any security implications?

#### Data Collection Commands
```bash
# Collect logs for analysis
vercel logs --since 24h --scope production > rollback-incident-logs.txt

# Database performance data
# Export query performance metrics from Supabase dashboard

# Error analysis
grep -E "(ERROR|CRITICAL|FAILED)" rollback-incident-logs.txt | sort | uniq -c

# Timeline reconstruction
grep -E "2025-08-19" rollback-incident-logs.txt | head -100
```

### Lessons Learned Documentation

#### Incident Report Template
```markdown
# Incident Report - Emergency Rollback

## Summary
- **Date:** [DATE]
- **Duration:** [TOTAL_DURATION]  
- **Rollback Level:** [1/2/3]
- **Root Cause:** [IDENTIFIED_CAUSE]
- **Impact:** [USER_IMPACT_DESCRIPTION]

## Timeline
- [TIME]: Issue first detected
- [TIME]: Rollback decision made
- [TIME]: Rollback initiated  
- [TIME]: Rollback completed
- [TIME]: Service restored

## What Worked Well
- [SUCCESS_FACTORS]

## What Could Be Improved  
- [IMPROVEMENT_AREAS]

## Action Items
1. [ACTION_ITEM_1]
2. [ACTION_ITEM_2]
3. [ACTION_ITEM_3]

## Prevention Measures
- [PREVENTIVE_MEASURES]
```

---

## 📋 ROLLBACK TEAM RESPONSIBILITIES

### Emergency Response Team Structure

#### Incident Commander  
- **Role:** Overall rollback coordination and decision making
- **Responsibilities:**
  - Assess rollback trigger conditions
  - Select appropriate rollback level
  - Coordinate team activities
  - Communicate with stakeholders

#### Technical Lead
- **Role:** Execute technical rollback procedures  
- **Responsibilities:**
  - Execute application rollback commands
  - Monitor system health during rollback
  - Validate technical recovery
  - Document technical actions taken

#### Database Administrator
- **Role:** Handle database-related rollback procedures
- **Responsibilities:**
  - Execute database rollback scripts
  - Verify data integrity post-rollback
  - Monitor database performance
  - Handle RLS policy management

#### Communications Lead
- **Role:** Manage internal and external communications
- **Responsibilities:**
  - Send emergency notifications
  - Provide regular status updates
  - Coordinate with customer support
  - Manage external communications if needed

---

## 🧪 ROLLBACK TESTING & VALIDATION

### Pre-Production Rollback Testing

#### Staged Rollback Testing
```bash
# Test rollback procedures in staging environment
# 1. Deploy RLS implementation to staging
# 2. Simulate various failure conditions
# 3. Execute rollback procedures
# 4. Validate recovery

# Simulated failure conditions to test:
- Database connection failures
- High error rates
- Performance degradation  
- Security policy failures
- Authentication system failures
```

#### Rollback Procedure Validation
- ✅ Level 1 Emergency Rollback tested and validated
- ✅ Level 2 Selective Rollback tested and validated  
- ✅ Level 3 Gradual Rollback tested and validated
- ✅ Database rollback scripts tested
- ✅ Environment variable rollback tested
- ✅ Communication procedures tested

### Production Rollback Readiness

#### Rollback Tools & Access Verification
- ✅ Vercel CLI access configured for all team members
- ✅ Supabase dashboard access for database team
- ✅ Emergency contact list updated and verified
- ✅ Rollback scripts tested and accessible
- ✅ Monitoring dashboards configured
- ✅ Communication channels established

---

## 🎯 SUCCESS CRITERIA FOR ROLLBACK

### Rollback Completion Criteria

#### Technical Success Indicators
- ✅ Application health checks passing (200 OK responses)
- ✅ Authentication system functional (> 95% success rate)
- ✅ Database connectivity restored (100% connection success)
- ✅ Error rate below 1% of total requests
- ✅ Response times below 500ms for critical endpoints

#### Functional Success Indicators  
- ✅ Users can log in and access their data
- ✅ Core CRUD operations working
- ✅ Critical business workflows functional
- ✅ No data corruption or data loss
- ✅ Basic reporting capabilities available

#### Business Continuity Indicators
- ✅ Service available to all users
- ✅ Customer-facing features operational
- ✅ Data integrity maintained
- ✅ Security posture acceptable
- ✅ Support team can handle user inquiries

---

## 📚 ROLLBACK RESOURCES & REFERENCES

### Quick Reference Commands
```bash
# Emergency rollback commands (keep handy)
vercel env add NEXT_PUBLIC_RLS_KILL_SWITCH true --scope production
vercel rollback --scope production  
vercel logs --follow --scope production

# Health check commands
curl -f https://6-sense-eight.vercel.app/api/health
curl -w '%{time_total}' https://6-sense-eight.vercel.app

# Database emergency access
# Supabase Dashboard: https://app.supabase.io/
```

### Emergency Contacts
- **Technical Lead:** [CONTACT_INFO]
- **Database Administrator:** [CONTACT_INFO]  
- **DevOps Engineer:** [CONTACT_INFO]
- **Security Team:** [CONTACT_INFO]
- **Product Manager:** [CONTACT_INFO]

### Documentation References
- **Deployment Plan:** `/DEPLOYMENT_PLAN.md`
- **Security Overview:** `/README-SECURITY.md`
- **Troubleshooting Guide:** `/docs/TROUBLESHOOTING-GUIDE.md`
- **Performance Optimization:** `/OPTIMIZATION_REPORT.md`

---

**Emergency Rollback Plan Version:** 1.0  
**Created:** 2025-08-19  
**Last Tested:** [TEST_DATE]  
**Next Review:** 2025-09-19  
**Status:** ✅ Ready for Production Use

---

## ⚠️ FINAL REMINDER

**This rollback plan should be used ONLY in genuine emergency situations. Always attempt troubleshooting and gradual fixes before executing emergency rollback procedures. Document all actions taken during emergency situations for post-incident analysis.**