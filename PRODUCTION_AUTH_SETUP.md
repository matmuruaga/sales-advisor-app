# 🚀 Production Authentication Setup Guide

## Current Status
✅ **Database Schema**: All tables exist with proper structure
✅ **RLS Policies**: Configured with organization-based access control
✅ **Test User**: exists in both auth.users and public.users with matching IDs
✅ **Supabase Client**: Enhanced with better error handling and production config
✅ **Auth Context**: Improved with detailed logging and error handling

## Environment Variables Required in Vercel

Make sure these environment variables are set in your Vercel project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bscgeritvbwvrlrsipbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzY2dlcml0dmJ3dnJscnNpcGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjIxNDksImV4cCI6MjA2OTc5ODE0OX0.b_My8wR21puz-uEqe9vhYSrYcn36M6IXZzT_zM6Uz5M
NEXT_PUBLIC_APP_NAME="Sales Advisor App"
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

## Supabase Dashboard Configuration

### 1. Authentication Settings
Go to **Authentication > Settings** in your Supabase dashboard:

- **Site URL**: Set to your production domain (e.g., `https://your-app.vercel.app`)
- **Redirect URLs**: Add these URLs:
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/login`
  - `https://your-app.vercel.app/`
- **Email Auth**: Enabled ✅
- **Confirm Email**: You can disable this for testing
- **Secure Email Change**: Enabled ✅

### 2. Email Templates
Configure email templates in **Authentication > Email Templates**:
- Customize the confirmation and reset password emails
- Make sure the action links point to your production domain

### 3. API Settings
In **Settings > API**:
- **Project URL**: Should match NEXT_PUBLIC_SUPABASE_URL
- **anon public**: Should match NEXT_PUBLIC_SUPABASE_ANON_KEY
- **service_role**: Keep this secret, only use server-side if needed

## Test Credentials

Use these credentials to test authentication:

**Email**: `matias@elevaitelabs.io`
**Password**: `Matias123`

This user exists in both `auth.users` and `public.users` tables with:
- Role: `admin`
- Organization: Properly linked
- Profile: Complete

## Debugging Authentication Issues

### 1. Use the Debug Page
Visit `/auth-debug` on your deployed site to run comprehensive tests:
- Environment variable verification
- Database connection test
- Authentication flow test
- User profile loading test

### 2. Browser Console Logs
The enhanced auth system now provides detailed console logs:
- 🚀 Initialization logs
- 🔐 Sign-in attempts
- 👤 Profile loading
- ✅ Success indicators
- ❌ Error messages

### 3. Network Tab
Check the Network tab in browser dev tools:
- Look for requests to `bscgeritvbwvrlrsipbj.supabase.co`
- Verify auth tokens in request headers
- Check for CORS errors

## Common Issues and Solutions

### Issue: "Network Error" or "Failed to fetch"
**Cause**: CORS configuration
**Solution**: 
1. Check Supabase > Settings > API > CORS
2. Ensure your production domain is in the allowed origins
3. Add `https://your-app.vercel.app` to allowed origins

### Issue: "Invalid login credentials"
**Cause**: User doesn't exist in auth.users table
**Solution**:
1. Create user via Supabase dashboard or use sign-up
2. Or use the test credentials provided above

### Issue: "Profile not found"
**Cause**: User exists in auth.users but not in public.users
**Solution**:
1. The app now handles this gracefully (returns user without profile)
2. Create corresponding profile in public.users table

### Issue: "Session not persisting"
**Cause**: localStorage/cookie issues
**Solution**:
1. Ensure HTTPS in production
2. Check browser security settings
3. Verify domain settings in Supabase

## Verification Checklist

Before going live, verify:

- [ ] Environment variables set in Vercel
- [ ] Supabase Site URL matches production domain
- [ ] Redirect URLs configured correctly
- [ ] Test user can log in on production
- [ ] Profile loads correctly after login
- [ ] Database queries work (check contacts, actions, etc.)
- [ ] RLS policies are working (users see only their org data)
- [ ] Session persists across page refreshes

## Auth Flow Overview

1. **User Login**: Email + Password → Supabase Auth
2. **Session Created**: JWT token stored in localStorage
3. **Profile Loading**: Query public.users table with auth.uid()
4. **Organization Loading**: Query organizations table
5. **Protected Routes**: Verify session exists
6. **Database Queries**: RLS policies enforce organization-based access

## Security Features

- ✅ Row Level Security (RLS) enabled on all sensitive tables
- ✅ Organization-based data isolation
- ✅ Secure auth flow with PKCE
- ✅ Automatic token refresh
- ✅ Session persistence across page loads
- ✅ Proper error handling and logging

## Next Steps

1. Deploy the updated code to Vercel
2. Set environment variables in Vercel dashboard
3. Configure Supabase authentication settings
4. Test login flow on production
5. Use `/auth-debug` page to troubleshoot any issues

## Support

If you encounter issues:
1. Check the `/auth-debug` page first
2. Look at browser console logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure Supabase dashboard configuration matches your domain