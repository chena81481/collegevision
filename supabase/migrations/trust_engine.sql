-- University Verification System Snapshot Table
CREATE TABLE IF NOT EXISTS university_data_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL,
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID, -- Staff member who verified (maps to auth.users)
    data_source VARCHAR, -- e.g., "UGC-DEB", "University Portal", "AICTE"
    verification_proof_url VARCHAR, -- URL to screenshot/PDF proof
    
    -- Verified Data Points
    ugc_deb_approved BOOLEAN DEFAULT FALSE,
    ugc_approval_date DATE,
    naac_grade VARCHAR,
    aicte_code VARCHAR,
    avg_placement_ctc DECIMAL,
    placement_data_year INT,
    total_fee DECIMAL,
    
    -- Auto-verification Status
    auto_verified BOOLEAN DEFAULT FALSE,
    manual_review_required BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Review Verification Table
CREATE TABLE IF NOT EXISTS verified_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID,
    university_id UUID NOT NULL,
    course_id UUID,
    review_text TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    verified_enrollment BOOLEAN DEFAULT FALSE, -- Checked against uni records
    enrollment_proof_url VARCHAR, -- Admission letter/ID upload
    review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by_system BOOLEAN DEFAULT FALSE,
    
    -- Anti-fraud metrics
    ip_address INET,
    device_fingerprint VARCHAR,
    duplicate_check_passed BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helper to update snapshots
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_university_data_snapshots_updated_at
    BEFORE UPDATE ON university_data_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign keys if tables exist (Assumption: universities table exists)
-- ALTER TABLE university_data_snapshots ADD CONSTRAINT fk_university FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;
