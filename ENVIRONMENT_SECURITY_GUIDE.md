# Environment Security & Configuration Guide

## CRITICAL SECURITY ALERT 🚨

**IMMEDIATE ACTIONS REQUIRED:**

1. **Service Role Key Missing**: The `SUPABASE_SERVICE_ROLE_KEY` is currently set to placeholder values in all environment files. This key is required for critical admin operations.

2. **Secrets Exposed**: API keys are currently committed in `.env.local` and `.env.production` files. These must be removed from git history and configured securely.

3. **OAuth Configuration**: Missing proper production redirect URLs and security configurations.

## Environment Variables Security Classification

### 🔴 CRITICAL - Never Expose to Client
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- `ANTHROPIC_API_KEY` - AI service costs
- `GOOGLE_CLIENT_SECRET` - OAuth security
- `N8N_WEBHOOK_SECRET` - Workflow security
- `NEXTAUTH_SECRET` - Session security
- `JWT_SECRET` - Token signing
- `SESSION_SECRET` - Session encryption

### 🟡 SENSITIVE - Server-side Only
- `ELEVENLABS_API_KEY` - Voice synthesis costs
- `OPENAI_API_KEY` - AI service costs
- `N8N_WEBHOOK_URL` - Integration endpoint
- `SENTRY_DSN` - Error tracking

### 🟢 PUBLIC - Safe to Expose
- `NEXT_PUBLIC_SUPABASE_URL` - Public endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Limited permissions
- `NEXT_PUBLIC_APP_URL` - Application URL
- `GOOGLE_CLIENT_ID` - OAuth identifier
- All `NEXT_PUBLIC_*` variables

## Service Role Key Usage Patterns

### ✅ CORRECT Usage (Server-side Only)
```typescript
// API routes (/api/*)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Server-side only
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Middleware
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  throw new Error('Service role key not configured');
}
```

### ❌ INCORRECT Usage (Never Do This)
```typescript
// Client components - NEVER
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🚨 SECURITY BREACH
)

// Pages - NEVER
export async function getServerSideProps() {
  return {
    props: {
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY // 🚨 EXPOSED TO CLIENT
    }
  }
}
```

## Current Usage Analysis

### Files Using Service Role Key (Audit Complete):
- `/src/middleware/rlsValidation.ts` ✅ Correct (server-side)
- `/src/app/api/webhooks/n8n/route.ts` ✅ Correct (API route)
- `/src/app/api/generate-action/route.ts` ✅ Correct (API route)
- `/src/lib/participant-enrichment-jobs.ts` ✅ Correct (server lib)
- `/src/lib/dataMigration.ts` ✅ Correct (server lib)
- `/src/lib/participant-metrics.ts` ✅ Correct (server lib)

### OAuth Configuration Status:
- ✅ Google Client ID configured
- ✅ Google Client Secret configured
- ⚠️ Redirect URIs need environment-specific validation

## Required Configuration Steps

### 1. Supabase Service Role Key Setup

**Get the Service Role Key:**
```bash
# 1. Go to Supabase Dashboard
# 2. Navigate to: Settings → API
# 3. Copy the "service_role" key (NOT anon key)
# 4. Set in your environment variables
```

**Current Status:** 🚨 PLACEHOLDER VALUES - MUST UPDATE

### 2. Google OAuth Configuration

**Development Environment:**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback/google
```

**Production Environment:**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback/google
```

### 3. Security Validation Checklist

#### Environment Files Security:
- [ ] Remove all secrets from committed files
- [ ] Use platform environment variables (Vercel/Railway/etc)
- [ ] Rotate all exposed keys
- [ ] Update .gitignore to exclude all env files

#### API Key Security:
- [ ] Service role key obtained and configured
- [ ] All API keys have usage limits set
- [ ] Monitoring/alerts configured for API usage
- [ ] Keys rotated regularly (quarterly)

#### OAuth Security:
- [ ] Redirect URIs match exactly
- [ ] HTTPS enforced in production
- [ ] State parameter validation enabled
- [ ] Proper scopes configured (minimal necessary)

## Environment-Specific Configuration

### Development (.env.local)
```env
# Core
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Features
NEXT_PUBLIC_FEATURE_RLS_ENABLED=false
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=true
NEXT_PUBLIC_RLS_STRICT_MODE=false

# OAuth
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback/google
```

### Staging (.env.staging)
```env
# Core
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_APP_URL=https://staging-6-sense-eight.vercel.app
NODE_ENV=production

# Features
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false
NEXT_PUBLIC_RLS_STRICT_MODE=false

# OAuth
GOOGLE_REDIRECT_URI=https://staging-6-sense-eight.vercel.app/api/auth/callback/google
```

### Production (.env.production)
```env
# Core
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://6-sense-eight.vercel.app
NODE_ENV=production

# Features
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false
NEXT_PUBLIC_RLS_STRICT_MODE=true
NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=false

# OAuth
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/callback/google
```

## Deployment Platform Configuration

### Vercel Environment Variables Setup:
```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_CLIENT_SECRET
# ... add all sensitive variables
```

### Environment Variable Validation:
```typescript
// Add to your API routes for validation
function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
```

## Monitoring & Alerting

### Cost Monitoring:
- Set up billing alerts for all AI services
- Monitor Supabase database usage
- Track API call volumes

### Security Monitoring:
- Monitor for unauthorized service role key usage
- Alert on suspicious authentication patterns
- Track API rate limit hits

### Health Checks:
```typescript
// Add environment health check endpoint
// GET /api/health/environment
export async function GET() {
  const health = {
    supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_CLIENT_SECRET,
    timestamp: new Date().toISOString()
  };

  return Response.json(health);
}
```

## Immediate Action Items

### 🚨 CRITICAL - Do Today:
1. Remove all secrets from committed files
2. Set up proper Supabase service role key
3. Configure environment variables in deployment platform
4. Validate OAuth redirect URIs

### ⚠️ HIGH PRIORITY - This Week:
1. Set up API usage monitoring
2. Implement environment validation
3. Create staging environment
4. Document key rotation procedures

### 📝 MEDIUM PRIORITY - This Month:
1. Set up comprehensive monitoring
2. Implement automated security scanning
3. Create incident response procedures
4. Set up key rotation automation

## Security Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Environment Separation**: Different keys for dev/staging/prod
3. **Regular Rotation**: Rotate keys quarterly or after incidents
4. **Monitoring**: Alert on unusual usage patterns
5. **Documentation**: Keep security procedures updated
6. **Incident Response**: Have procedures for key compromise

## Contact & Support

For security issues or questions:
- Create issue in repository (for non-sensitive topics)
- Direct message maintainers (for sensitive security matters)
- Follow responsible disclosure procedures

---
**Last Updated:** 2025-01-19
**Next Review:** 2025-02-19