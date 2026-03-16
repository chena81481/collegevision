-- ============================================================
-- CollegeVision – Supabase MVP Schema
-- Paste this entire block into your Supabase SQL Editor
-- ============================================================

-- 1. UNIVERSITIES TABLE (The Core Data)
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    gradient_start VARCHAR(20) DEFAULT 'from-blue-50',
    gradient_end VARCHAR(20) DEFAULT 'to-white',
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. COURSES TABLE (What users actually search for)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,           -- e.g., "Online MBA Finance"
    degree_level VARCHAR(50) NOT NULL,    -- e.g., "Masters", "Bachelors"
    duration_months INTEGER NOT NULL,
    total_fee_inr INTEGER NOT NULL,
    avg_ctc_inr INTEGER,                  -- Average starting salary (annual, in INR)
    has_zero_cost_emi BOOLEAN DEFAULT false,
    approvals TEXT[],                     -- e.g., ['UGC-DEB', 'NAAC A+']
    badge_label VARCHAR(50),              -- e.g., "Top ROI", "High Placement"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. USER LEADS TABLE (Capturing the conversion!)
CREATE TABLE user_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),  -- Links to Supabase Auth if logged in
    phone_number VARCHAR(20),
    email VARCHAR(255),
    target_budget_inr INTEGER,
    target_degree VARCHAR(100),
    search_query TEXT,                        -- The raw text from the hero input
    status VARCHAR(50) DEFAULT 'New Lead',   -- e.g., 'Contacted', 'Enrolled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. SAVED MATCHES (For the Student Dashboard later)
CREATE TABLE saved_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, course_id)  -- Prevents saving the same course twice
);

-- ============================================================
-- Row-Level Security (RLS) – Enable after testing
-- ============================================================
ALTER TABLE user_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_matches ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own leads and saved matches
CREATE POLICY "users_own_leads" ON user_leads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_saved_matches" ON saved_matches
    FOR ALL USING (auth.uid() = user_id);

-- Universities and courses are public read
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_universities" ON universities
    FOR SELECT USING (true);

CREATE POLICY "public_read_courses" ON courses
    FOR SELECT USING (true);
