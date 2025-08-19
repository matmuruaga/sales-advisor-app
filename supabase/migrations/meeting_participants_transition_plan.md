# Meeting Participants Schema Transition Plan

## Current Status (2025-01-19)

### ✅ Completed
- Both old and new columns exist in the database
- All data (32 records) is already in the new columns (`display_name`, `response_status`)
- Synchronization triggers have been implemented
- Backward compatibility is maintained

### Column Mapping
| Old Column (Deprecated) | New Column (Active) | Status |
|------------------------|---------------------|---------|
| `name` | `display_name` | ✅ Migrated, synced via trigger |
| `attendance_status` | `response_status` | ✅ Migrated, synced via trigger |

## Transition Phases

### Phase 1: Coexistence (CURRENT - Completed)
**Timeline**: Now
**Status**: ✅ COMPLETED

- [x] Both column sets exist in database
- [x] Data migrated to new columns
- [x] Synchronization triggers active
- [x] Both old and new code can work

### Phase 2: Code Update (NEXT)
**Timeline**: With Task 2.2
**Status**: 🔄 PENDING

- [ ] Update TypeScript interfaces to use new column names
- [ ] Update all API routes to use `display_name` and `response_status`
- [ ] Update frontend components
- [ ] Run tests to ensure compatibility

### Phase 3: Deprecation Notice
**Timeline**: After 1 month of stable operation
**Status**: 📅 FUTURE

- [ ] Add deprecation warnings in logs when old columns are used
- [ ] Notify team about upcoming removal
- [ ] Update documentation

### Phase 4: Column Removal
**Timeline**: After 3 months of stable operation
**Status**: 📅 FUTURE

- [ ] Remove synchronization triggers
- [ ] Drop old columns (`name`, `attendance_status`)
- [ ] Clean up code references

## Current Implementation Details

### Synchronization Triggers
1. **`sync_participant_names_trigger`**: Keeps `name` ↔ `display_name` in sync
2. **`sync_participant_status_trigger`**: Keeps `attendance_status` ↔ `response_status` in sync

### Data Statistics
- Total records: 32
- Records with `display_name`: 32
- Records with `response_status`: 32
- Records needing migration: 0

## Rollback Plan

If issues arise, execute:
```bash
psql $DATABASE_URL < /supabase/migrations/rollback_meeting_participants.sql
```

This will:
1. Remove synchronization triggers
2. Restore original column usage
3. Migrate data back if needed

## Validation Queries

### Check data consistency:
```sql
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN display_name = name OR (display_name IS NULL AND name IS NULL) THEN 1 END) as names_synced,
    COUNT(CASE WHEN response_status = attendance_status OR (response_status IS NULL AND attendance_status IS NULL) THEN 1 END) as status_synced
FROM meeting_participants;
```

### Check trigger functionality:
```sql
-- Test name sync
UPDATE meeting_participants 
SET display_name = 'Test User' 
WHERE id = (SELECT id FROM meeting_participants LIMIT 1);

-- Verify name was also updated
SELECT display_name, name 
FROM meeting_participants 
WHERE display_name = 'Test User';
```

## Notes
- The transition maintains 100% backward compatibility
- No data loss risk due to synchronization triggers
- Code can be updated gradually without breaking existing functionality
- Performance impact of triggers is minimal for current data volume (32 records)