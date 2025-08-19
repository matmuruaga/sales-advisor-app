# Deployment Security Checklist

## Pre-Deployment Validation

### 🚨 CRITICAL - Must Complete Before Any Deployment

#### 1. Environment Variables Setup
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - Currently using placeholder value
- [ ] **NEXT_PUBLIC_ENVIRONMENT** - Missing environment identifier
- [ ] **NEXT_PUBLIC_APP_URL** - URL validation failing for development
- [ ] All API keys properly configured and validated

#### 2. Security Audit
- [ ] No secrets committed to git repository
- [ ] All environment files properly excluded (.gitignore updated)
- [ ] Service role key different from anonymous key
- [ ] API usage limits configured for all services

#### 3. Environment Validation
Run the validation script for each environment:
```bash
# Development
npm run validate:env:dev

# Staging
npm run validate:env:staging

# Production
npm run validate:env:prod
```

### ⚠️ HIGH PRIORITY - Fix Before Production

#### Feature Flags Configuration
- [ ] `NEXT_PUBLIC_FEATURE_RLS_ENABLED=true` in production
- [ ] `NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false` in production
- [ ] `NEXT_PUBLIC_RLS_STRICT_MODE=true` in production
- [ ] `NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=false` in production

#### OAuth Configuration
- [ ] Google OAuth redirect URIs match exactly
- [ ] HTTPS enforced in production
- [ ] Proper scopes configured (minimal necessary)
- [ ] State parameter validation enabled

### 📝 MEDIUM PRIORITY - Complete This Week

#### Monitoring Setup
- [ ] API usage monitoring configured
- [ ] Cost alerts set for all AI services
- [ ] Error tracking (Sentry/similar) configured
- [ ] Health check endpoints implemented

#### Optional Integrations
- [ ] N8N webhook configuration (if using workflow automation)
- [ ] ElevenLabs integration (if using voice features)
- [ ] Additional AI providers (OpenAI) if needed

## Environment-Specific Checklists

### Development Environment ✅
```bash
# Current status from validation script:
✅ Supabase URL configured
✅ Supabase anon key configured  
✅ Google OAuth configured
✅ Anthropic API configured
❌ Service role key (placeholder)
❌ Environment identifier missing
❌ Feature flags not configured
```

**Required Actions:**
1. Get real Supabase service role key
2. Set `NEXT_PUBLIC_ENVIRONMENT=development`
3. Configure feature flags for development

### Staging Environment ⚠️
```bash
# Required configuration:
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_APP_URL=https://staging-6-sense-eight.vercel.app
GOOGLE_REDIRECT_URI=https://staging-6-sense-eight.vercel.app/api/auth/callback/google

# Feature flags:
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false
NEXT_PUBLIC_RLS_STRICT_MODE=false
```

### Production Environment 🚨
```bash
# Required configuration:
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://6-sense-eight.vercel.app
GOOGLE_REDIRECT_URI=https://6-sense-eight.vercel.app/api/auth/callback/google

# Feature flags:
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false
NEXT_PUBLIC_RLS_STRICT_MODE=true
NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=false
```

## Platform-Specific Setup

### Vercel Deployment
1. **Environment Variables Setup:**
   ```bash
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add ANTHROPIC_API_KEY  
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add N8N_WEBHOOK_SECRET
   ```

2. **Build Configuration:**
   - Ensure `prebuild` script runs validation
   - Configure build environment variables
   - Set up proper build caching

3. **Domain Configuration:**
   - Update `NEXT_PUBLIC_APP_URL` to match domain
   - Update Google OAuth redirect URIs
   - Configure custom domain if needed

### Other Platforms (Railway, Heroku, etc.)
Similar environment variable setup through platform dashboard or CLI.

## Security Validation Steps

### 1. Secrets Audit
```bash
# Check for committed secrets
git log --grep="API" --grep="key" --grep="secret" --oneline

# Scan for potential secrets in codebase
grep -r "sk-" . --exclude-dir=node_modules
grep -r "GOCSPX" . --exclude-dir=node_modules
```

### 2. API Key Validation
- [ ] All API keys have proper scopes/permissions
- [ ] Usage limits configured
- [ ] Billing alerts enabled
- [ ] Regular key rotation schedule

### 3. Database Security
- [ ] RLS policies enabled and tested
- [ ] Service role key used only server-side
- [ ] Database access patterns monitored
- [ ] Backup and recovery procedures tested

## Post-Deployment Validation

### 1. Functional Testing
- [ ] Authentication flow works
- [ ] Google OAuth integration works
- [ ] API endpoints respond correctly
- [ ] Database operations work with RLS
- [ ] AI integrations functional

### 2. Security Testing
- [ ] No sensitive data exposed in client
- [ ] API rate limiting works
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS redirects work correctly

### 3. Monitoring Verification
- [ ] Error tracking receiving data
- [ ] Performance monitoring active
- [ ] Cost tracking configured
- [ ] Alert thresholds tested

## Rollback Procedures

### Emergency Procedures
1. **Kill Switch Activation:**
   ```bash
   # Disable RLS immediately if issues occur
   NEXT_PUBLIC_RLS_KILL_SWITCH=true
   ```

2. **Revert to Previous Version:**
   ```bash
   # Vercel rollback
   vercel rollback
   
   # Or redeploy previous working version
   git checkout previous-working-commit
   vercel --prod
   ```

3. **Service Degradation:**
   - Disable non-critical features
   - Switch to mock authentication if needed
   - Reduce AI API usage if cost issues

## Maintenance Schedule

### Weekly
- [ ] Review error logs
- [ ] Check API usage and costs
- [ ] Validate environment configuration
- [ ] Test backup procedures

### Monthly  
- [ ] Security audit
- [ ] API key rotation
- [ ] Performance optimization
- [ ] Cost optimization review

### Quarterly
- [ ] Full security assessment
- [ ] Disaster recovery testing
- [ ] Technology updates
- [ ] Documentation updates

## Emergency Contacts

- **Security Issues:** Create private issue in repository
- **Service Outages:** Check status pages (Supabase, Vercel, etc.)
- **API Issues:** Check service provider status pages
- **Database Issues:** Check Supabase dashboard and logs

---

## Quick Commands Reference

```bash
# Validate environment
npm run validate:env:dev
npm run validate:env:prod

# Build with validation
npm run build

# Deploy to production
vercel --prod

# Check logs
vercel logs --follow

# Environment variable management
vercel env ls
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
```

---

**Last Updated:** 2025-01-19  
**Next Review:** 2025-02-19