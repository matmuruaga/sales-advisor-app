-- Rollback script for meeting_participants schema changes
-- Execute this if issues arise with the column synchronization

-- 1. Drop synchronization triggers
DROP TRIGGER IF EXISTS sync_participant_names_trigger ON public.meeting_participants;
DROP TRIGGER IF EXISTS sync_participant_status_trigger ON public.meeting_participants;

-- 2. Drop synchronization functions
DROP FUNCTION IF EXISTS sync_meeting_participant_names();
DROP FUNCTION IF EXISTS sync_meeting_participant_status();

-- 3. Ensure old columns have all the data (copy from new to old if needed)
UPDATE public.meeting_participants
SET name = COALESCE(name, display_name)
WHERE display_name IS NOT NULL;

UPDATE public.meeting_participants
SET attendance_status = COALESCE(attendance_status, response_status)
WHERE response_status IS NOT NULL;

-- 4. Remove comments from deprecated columns
COMMENT ON COLUMN public.meeting_participants.name IS NULL;
COMMENT ON COLUMN public.meeting_participants.attendance_status IS NULL;
COMMENT ON COLUMN public.meeting_participants.display_name IS NULL;
COMMENT ON COLUMN public.meeting_participants.response_status IS NULL;

-- 5. Log the rollback
INSERT INTO system_logs (
    log_level,
    message,
    details,
    created_at
) VALUES (
    'WARNING',
    'Meeting participants schema rollback executed',
    jsonb_build_object(
        'action', 'rollback',
        'table', 'meeting_participants',
        'timestamp', now(),
        'affected_columns', ARRAY['name', 'display_name', 'attendance_status', 'response_status']
    ),
    now()
);

-- Validation: Check that old columns have data
DO $$
DECLARE
    v_count_nulls INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count_nulls
    FROM public.meeting_participants
    WHERE (display_name IS NOT NULL AND name IS NULL)
       OR (response_status IS NOT NULL AND attendance_status IS NULL);
    
    IF v_count_nulls > 0 THEN
        RAISE WARNING 'Found % records where old columns are NULL but new columns have data. Manual review recommended.', v_count_nulls;
    ELSE
        RAISE NOTICE 'Rollback completed successfully. All data preserved in original columns.';
    END IF;
END $$;