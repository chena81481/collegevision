-- ============================================================
-- Phase 7: CRM v2 Unification & High-Performance Logging
-- ============================================================

-- 1. UNIFIED ACTIVITIES TABLE
-- This table will store all interactions across different entities (Leads, Contacts, Students)
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    counselor_id VARCHAR(50), -- Using string ID for legacy counselor mapping compatibility
    type VARCHAR(50) NOT NULL, -- CALL, WHATSAPP, EMAIL, NOTE, STATUS_CHANGE, APPLICATION_EVENT
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. INDEXING FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- 3. ENABLE RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
-- Admin/Counselors can view all activities
CREATE POLICY "Admins can view lead activities" ON lead_activities
    FOR SELECT USING (true); -- Simplified for this admin-focused phase

CREATE POLICY "Admins can insert lead activities" ON lead_activities
    FOR INSERT WITH CHECK (true);

-- 5. TRIGGER FOR AUTO-LOGGING STATUS CHANGES
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO lead_activities (lead_id, type, description, metadata)
        VALUES (
            NEW.id, 
            'STATUS_CHANGE', 
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_lead_status_change ON leads;
CREATE TRIGGER trg_log_lead_status_change
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_status_change();
