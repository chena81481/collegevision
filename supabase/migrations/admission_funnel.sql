-- ============================================================
-- Phase 6: Admission Funnel & Fee Waiver Schema
-- ============================================================

-- 1. APPLICATIONS TABLE (Structured for tracking)
-- If it already exists, we enhance it. If not, we create it.
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'START_APPLICATION', -- START_APPLICATION, DOCUMENTS_PENDING, UNDER_REVIEW, OFFER_RECEIVED, ENROLLED
    is_fee_waived BOOLEAN DEFAULT false,
    waiver_reason VARCHAR(255),
    total_fee_inr INTEGER,
    final_fee_inr INTEGER,
    scholarship_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, course_id)
);

-- 2. APPLICATION MILESTONES (Grandular Tracking)
CREATE TABLE IF NOT EXISTS application_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    milestone_name VARCHAR(100) NOT NULL, -- e.g., 'Fee Waiver Unlocked', 'Marksheet Verified'
    description TEXT,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_milestones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own milestones" ON application_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.id = application_milestones.application_id 
            AND applications.user_id = auth.uid()
        )
    );
