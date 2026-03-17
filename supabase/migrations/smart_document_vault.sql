-- ============================================================
-- Phase 4: Smart Document Vault Schema
-- ============================================================

-- 1. STUDENT PROFILES (Extracted & Verified Academic Data)
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    highest_degree VARCHAR(100),
    specialization VARCHAR(100),
    institution_name VARCHAR(255),
    passing_year INTEGER,
    score_percentage DECIMAL(5, 2),
    is_verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- 2. STUDENT DOCUMENTS (Metadata for Uploaded Marksheets/IDs)
CREATE TABLE IF NOT EXISTS student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50), -- e.g., 'Marksheet', 'ID', 'Graduation Certificate'
    verification_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Verified', 'Rejected'
    ocr_metadata JSONB, -- Stores the raw JSON from Gemini parsing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own documents" ON student_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents" ON student_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
