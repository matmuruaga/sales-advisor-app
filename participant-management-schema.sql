-- Participant Management System Schema
-- This schema extends your existing Supabase database with participant management capabilities

-- Meeting Participants Table - stores calendar meeting attendees
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Meeting identification (from Google Calendar)
    meeting_id VARCHAR(255) NOT NULL, -- Google Calendar event ID
    meeting_title VARCHAR(500),
    meeting_date_time TIMESTAMPTZ NOT NULL,
    meeting_platform VARCHAR(50) DEFAULT 'google-meet', -- google-meet, teams, zoom
    
    -- Participant details from calendar
    email VARCHAR(320) NOT NULL, -- Primary matching key
    display_name VARCHAR(255), -- Name as shown in calendar
    response_status VARCHAR(20) DEFAULT 'needsAction', -- accepted, declined, tentative, needsAction
    is_organizer BOOLEAN DEFAULT false,
    is_optional BOOLEAN DEFAULT false,
    
    -- Enrichment status
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    enrichment_status VARCHAR(20) DEFAULT 'pending', -- pending, matched, enriched, unknown
    enrichment_source VARCHAR(50), -- manual, auto, api
    auto_match_confidence DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_in_meeting TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    UNIQUE(meeting_id, email),
    INDEX idx_meeting_participants_email (email),
    INDEX idx_meeting_participants_meeting_id (meeting_id),
    INDEX idx_meeting_participants_contact_id (contact_id),
    INDEX idx_meeting_participants_org_date (organization_id, meeting_date_time DESC)
);

-- Participant Enrichment History - track enrichment attempts and sources
CREATE TABLE IF NOT EXISTS participant_enrichment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Enrichment attempt details
    enrichment_type VARCHAR(50) NOT NULL, -- 'contact_match', 'api_lookup', 'manual_add'
    enrichment_source VARCHAR(100), -- 'clearbit', 'apollo', 'linkedin', 'manual'
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
    confidence_score DECIMAL(3,2),
    
    -- Data found
    data_found JSONB, -- Structured data from enrichment
    matched_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Audit
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    cost_cents INTEGER DEFAULT 0, -- Track API costs
    
    INDEX idx_participant_enrichment_participant (participant_id),
    INDEX idx_participant_enrichment_date (performed_at DESC)
);

-- Extend contacts table with participant tracking (if not already exists)
-- This tracks how many meetings a contact has participated in
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS meetings_count INTEGER DEFAULT 0;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_meeting_date TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS first_meeting_date TIMESTAMPTZ;

-- Meeting Summary Table - aggregated meeting data for analytics
CREATE TABLE IF NOT EXISTS meeting_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Meeting details
    meeting_id VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500),
    date_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    platform VARCHAR(50),
    meeting_type VARCHAR(50), -- opportunity, follow-up, weekly, demo
    
    -- Participant metrics
    total_participants INTEGER DEFAULT 0,
    known_contacts INTEGER DEFAULT 0, -- Participants in contacts table
    unknown_participants INTEGER DEFAULT 0, -- Not in contacts
    external_participants INTEGER DEFAULT 0, -- Outside organization
    
    -- Engagement metrics
    acceptance_rate DECIMAL(4,2), -- % who accepted
    attendance_rate DECIMAL(4,2), -- % who actually attended (if available)
    
    -- AI/Automation
    ai_summary TEXT,
    ai_action_items JSONB,
    ai_sentiment_analysis JSONB,
    auto_follow_ups_created INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_meeting_summaries_org_date (organization_id, date_time DESC),
    INDEX idx_meeting_summaries_type (meeting_type)
);

-- RLS Policies for security
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_enrichment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see participants from their organization
CREATE POLICY meeting_participants_org_policy ON meeting_participants
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY participant_enrichment_history_org_policy ON participant_enrichment_history
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY meeting_summaries_org_policy ON meeting_summaries
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_contact_meeting_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update contact meeting statistics when participant is linked
    IF NEW.contact_id IS NOT NULL AND (OLD.contact_id IS NULL OR OLD.contact_id != NEW.contact_id) THEN
        UPDATE contacts 
        SET 
            meetings_count = COALESCE(meetings_count, 0) + 1,
            last_meeting_date = GREATEST(COALESCE(last_meeting_date, '1900-01-01'::timestamptz), NEW.meeting_date_time),
            first_meeting_date = LEAST(COALESCE(first_meeting_date, '2100-01-01'::timestamptz), NEW.meeting_date_time),
            updated_at = NOW()
        WHERE id = NEW.contact_id;
    END IF;
    
    -- Decrease count if contact was unlinked
    IF OLD.contact_id IS NOT NULL AND (NEW.contact_id IS NULL OR OLD.contact_id != NEW.contact_id) THEN
        UPDATE contacts 
        SET 
            meetings_count = GREATEST(0, COALESCE(meetings_count, 0) - 1),
            updated_at = NOW()
        WHERE id = OLD.contact_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contact_meeting_stats
    AFTER INSERT OR UPDATE ON meeting_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_meeting_stats();

-- Function to automatically match participants with existing contacts
CREATE OR REPLACE FUNCTION auto_match_participant_with_contact()
RETURNS TRIGGER AS $$
DECLARE
    matched_contact contacts%ROWTYPE;
    confidence_score DECIMAL(3,2);
BEGIN
    -- Only auto-match if not already matched
    IF NEW.contact_id IS NULL AND NEW.email IS NOT NULL THEN
        -- Try exact email match first
        SELECT * INTO matched_contact 
        FROM contacts 
        WHERE 
            organization_id = NEW.organization_id 
            AND LOWER(email) = LOWER(NEW.email);
        
        IF FOUND THEN
            confidence_score := 1.00; -- Perfect match
        ELSE
            -- Try fuzzy matching on name + domain if no exact email match
            SELECT * INTO matched_contact
            FROM contacts 
            WHERE 
                organization_id = NEW.organization_id 
                AND email IS NOT NULL
                AND SPLIT_PART(LOWER(email), '@', 2) = SPLIT_PART(LOWER(NEW.email), '@', 2)
                AND similarity(LOWER(full_name), LOWER(NEW.display_name)) > 0.8;
            
            IF FOUND THEN
                confidence_score := 0.75; -- Good match but not perfect
            END IF;
        END IF;
        
        -- Update participant with matched contact
        IF FOUND THEN
            NEW.contact_id := matched_contact.id;
            NEW.enrichment_status := 'matched';
            NEW.enrichment_source := 'auto';
            NEW.auto_match_confidence := confidence_score;
            
            -- Log the enrichment
            INSERT INTO participant_enrichment_history (
                participant_id, organization_id, enrichment_type, enrichment_source,
                status, confidence_score, matched_contact_id, performed_at
            ) VALUES (
                NEW.id, NEW.organization_id, 'contact_match', 'auto',
                'success', confidence_score, matched_contact.id, NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_match_participant
    BEFORE INSERT ON meeting_participants
    FOR EACH ROW
    EXECUTE FUNCTION auto_match_participant_with_contact();