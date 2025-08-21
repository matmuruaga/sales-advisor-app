# Supabase Connection & Session Management Fix

## Problem Summary
The application was experiencing critical issues with Supabase connections:
1. **Session timeout**: After 1-2 minutes, the app would hang showing "Loading contacts from Supabase..."
2. **Infinite subscription loops**: Multiple real-time subscriptions were created causing performance issues
3. **No session refresh**: Tokens were expiring without automatic renewal
4. **Connection leaks**: Real-time channels were not being properly cleaned up

## Root Causes Identified

### 1. Database Trigger Issue
- **Problem**: The trigger function `link_meeting_participant_to_contact()` had an empty `search_path`
- **Error**: `relation "meeting_participants" does not exist`
- **Solution**: Fixed by setting `SET search_path TO 'public'` in the trigger function

### 2. Multiple Hook Instances
- **Problem**: `useSupabaseContacts()` was called inside components that rendered multiple times
- **Location**: `ParticipantCard` component (rendered once per participant)
- **Solution**: Moved the hook to the parent component and passed data as props

### 3. Missing Session Management
- **Problem**: No automatic token refresh or session validation
- **Impact**: Queries would fail silently after token expiration
- **Solution**: Implemented comprehensive session management

## Implementation Details

### 1. Enhanced Supabase Client Configuration
**File**: `src/lib/supabase.ts`

```typescript
// Added enhanced auth configuration
auth: {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  flowType: 'pkce',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  storageKey: 'sales-advisor-auth',
  autoRefreshBuffer: 60 // Refresh 60 seconds before expiry
}

// Added auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  // Log and handle auth events
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ Token refreshed successfully')
  }
})
```

### 2. Connection Health Monitoring
**File**: `src/hooks/useSupabaseHealth.ts`

- Performs health checks every 30 seconds
- Validates connection before queries
- Detects and reports connection issues
- Monitors auth state changes

### 3. Connection Manager
**File**: `src/lib/supabase-manager.ts`

- Tracks active real-time channels
- Prevents channel name conflicts (unique names)
- Cleans up stale connections every 5 minutes
- Limits maximum concurrent channels to 10
- Provides connection statistics

### 4. Enhanced Contact Hook
**File**: `src/hooks/useSupabaseContacts.ts`

Key improvements:
- Session validation before queries
- 30-second timeout protection
- Automatic retry on auth errors
- Debounced fetching (100ms)
- Proper cleanup of subscriptions
- Health check integration

### 5. Auth Middleware for API Routes
**File**: `src/lib/auth-middleware.ts`

- Automatic token refresh in API routes
- Proactive refresh when token expires soon
- Returns new tokens in response headers

### 6. Client-Side Session Hook
**File**: `src/hooks/useAuthSession.ts`

- Periodic session validation (every 5 minutes)
- Proactive refresh when <10 minutes remaining
- Handles tokens from API responses
- Provides session state to components

## What NOT to Do (Breaking Changes to Avoid)

### ❌ DON'T: Use Hooks in Loops or Mapped Components
```typescript
// WRONG - Creates multiple instances
participants.map(participant => {
  const { contacts } = useSupabaseContacts(); // ❌ Called multiple times
  return <ParticipantCard participant={participant} />
})

// CORRECT - Call once and pass as prop
const { contacts } = useSupabaseContacts(); // ✅ Called once
participants.map(participant => 
  <ParticipantCard participant={participant} contacts={contacts} />
)
```

### ❌ DON'T: Use Static Channel Names
```typescript
// WRONG - Causes conflicts
const subscription = supabase.channel('contacts_changes') // ❌ Static name

// CORRECT - Use unique names
const channelName = `contacts_changes_${Math.random().toString(36).substr(2, 9)}`
const subscription = supabase.channel(channelName) // ✅ Unique name
```

### ❌ DON'T: Forget to Clean Up Subscriptions
```typescript
// WRONG - Memory leak
useEffect(() => {
  const subscription = supabase.channel('test').subscribe()
  // ❌ No cleanup
}, [])

// CORRECT - Always cleanup
useEffect(() => {
  const subscription = supabase.channel('test').subscribe()
  return () => {
    subscription.unsubscribe() // ✅ Cleanup
    connectionManager.untrackChannel('test') // ✅ Untrack
  }
}, [])
```

### ❌ DON'T: Ignore Session Expiration
```typescript
// WRONG - No session check
const { data } = await supabase.from('contacts').select() // ❌ May fail silently

// CORRECT - Check session first
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  await supabase.auth.refreshSession() // ✅ Refresh if needed
}
const { data } = await supabase.from('contacts').select()
```

### ❌ DON'T: Use Infinite Timeouts
```typescript
// WRONG - Can hang forever
const { data } = await query // ❌ No timeout

// CORRECT - Add timeout protection
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 30000)
)
const { data } = await Promise.race([query, timeoutPromise]) // ✅ 30s timeout
```

### ❌ DON'T: Create Dependencies That Change Every Render
```typescript
// WRONG - Causes infinite re-renders
useCallback(async () => {
  // fetch logic
}, [JSON.stringify(filters)]) // ❌ Creates new value every render

// CORRECT - Stable dependencies
useCallback(async () => {
  // fetch logic
}, [filters?.id, filters?.name]) // ✅ Primitive values
```

### ❌ DON'T: Modify Database Triggers Without Setting search_path
```sql
-- WRONG - Will cause "relation does not exist" errors
CREATE OR REPLACE FUNCTION link_meeting_participant_to_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO '' -- ❌ Empty search_path

-- CORRECT
SET search_path TO 'public' -- ✅ Explicit search_path
```

## Monitoring & Debugging

### Development Mode Logging
To monitor connection health during development:

1. **Health Checks**: Look for `🏥 Checking Supabase health...` every 30 seconds
2. **Connection Stats**: `📊 Supabase connection stats:` shows every minute
3. **Channel Tracking**: `📡 Tracking channel:` and `🧹 Untracking channel:`
4. **Query Times**: `⏱️ Query completed in Xms`
5. **Auth Events**: `🔐 Auth event:` for session changes

### Key Metrics to Watch
- **Query time**: Should be <1000ms
- **Active channels**: Should stay between 0-5
- **Health check response**: Should be <1000ms
- **Token expiry**: Should refresh before reaching 0

### Production Considerations
1. Remove or conditionally disable verbose logging
2. Keep only error and warning logs
3. Consider using a proper logging service
4. Monitor Supabase dashboard for connection limits

## Testing the Fix

1. **Test Session Persistence**:
   - Open the app and navigate around
   - Wait 2-3 minutes
   - Verify data still loads without hanging

2. **Test Real-time Updates**:
   - Open two browser tabs
   - Make changes in one tab
   - Verify updates appear in the other

3. **Test Connection Recovery**:
   - Disconnect network briefly
   - Reconnect
   - Verify app recovers automatically

4. **Test Token Refresh**:
   - Set a short token expiry (for testing)
   - Monitor console for `TOKEN_REFRESHED` events
   - Verify seamless continuation

## Rollback Plan

If issues arise after deployment:

1. **Quick Fix**: Increase token expiry time in Supabase dashboard
2. **Revert Hooks**: Return to simpler implementations without health checks
3. **Disable Real-time**: Comment out subscription code temporarily
4. **Force Refresh**: Add manual refresh button as fallback

## Future Improvements

1. **Implement retry logic with exponential backoff**
2. **Add connection status indicator in UI**
3. **Implement offline mode with local caching**
4. **Add performance monitoring and alerting**
5. **Consider using Supabase connection pooling**
6. **Implement request deduplication**

## Related Files Modified

- `/src/lib/supabase.ts` - Client configuration
- `/src/hooks/useSupabaseContacts.ts` - Main data fetching hook
- `/src/hooks/useSupabaseHealth.ts` - Health monitoring
- `/src/lib/supabase-manager.ts` - Connection management
- `/src/lib/auth-middleware.ts` - API route auth
- `/src/hooks/useAuthSession.ts` - Client session management
- `/src/components/ParticipantCards.tsx` - Fixed hook usage
- `/src/app/api/participants/route.ts` - Fixed column references
- Database trigger: `link_meeting_participant_to_contact()` - Fixed search_path

## Conclusion

The connection issues were caused by a combination of:
1. Database configuration problems
2. Poor session management
3. Inefficient hook usage
4. Missing timeout protection

The fix implements a comprehensive solution with:
- Automatic session refresh
- Connection health monitoring
- Proper cleanup and resource management
- Timeout protection on all queries
- Centralized connection management

This ensures the application remains stable and responsive even during extended usage periods.