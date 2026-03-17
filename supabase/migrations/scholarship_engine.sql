-- ============================================================
-- Phase 5: Scholarship Intelligence Engine
-- ============================================================

-- 1. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    min_score DECIMAL(5, 2) NOT NULL, -- e.g. 75.00 for 75%
    discount_percentage INTEGER NOT NULL, -- e.g. 20 for 20% off
    max_discount_amount INTEGER, -- Optional cap in INR
    deadline TIMESTAMP WITH TIME ZONE,
    eligibility_criteria TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

-- Public Read for scholarships
CREATE POLICY "public_read_scholarships" ON scholarships
    FOR SELECT USING (true);

-- 2. SEED DATA (A few examples)
-- Assuming some IDs exist or will be matched by course name
-- This is a placeholder for actual university-partner scholarships
INSERT INTO scholarships (course_id, name, min_score, discount_percentage, eligibility_criteria)
SELECT id, 'Academic Excellence Scholarship', 85.00, 25, 'Requires minimum 85% in 12th/Graduation'
FROM courses 
WHERE name ILIKE '%MBA%' 
LIMIT 3;

INSERT INTO scholarships (course_id, name, min_score, discount_percentage, eligibility_criteria)
SELECT id, 'Merit-Based Early Bird', 75.00, 15, 'Requires minimum 75% in qualifying exam'
FROM courses 
WHERE name ILIKE '%BBA%' 
LIMIT 2;
