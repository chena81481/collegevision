-- ============================================================
-- Phase 8: Student Journey Backend & Analytics
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(120),
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(25),
  ADD COLUMN IF NOT EXISTS state VARCHAR(120),
  ADD COLUMN IF NOT EXISTS preferred_degree VARCHAR(120),
  ADD COLUMN IF NOT EXISTS target_budget_inr INTEGER,
  ADD COLUMN IF NOT EXISTS study_mode VARCHAR(50),
  ADD COLUMN IF NOT EXISTS current_salary_inr INTEGER,
  ADD COLUMN IF NOT EXISTS target_salary_inr INTEGER,
  ADD COLUMN IF NOT EXISTS career_goal TEXT,
  ADD COLUMN IF NOT EXISTS profile_source VARCHAR(80) DEFAULT 'AUTH',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

CREATE TABLE IF NOT EXISTS student_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type VARCHAR(80) NOT NULL,
  event_name VARCHAR(160) NOT NULL,
  source VARCHAR(80) DEFAULT 'web',
  page_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS student_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  raw_query TEXT NOT NULL,
  normalized_query TEXT,
  filters JSONB DEFAULT '{}'::jsonb,
  top_match_course_ids UUID[] DEFAULT ARRAY[]::UUID[],
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS university_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  primary_university_slug VARCHAR(255) NOT NULL,
  compared_university_slug VARCHAR(255) NOT NULL,
  query_context TEXT,
  compared_course_ids UUID[] DEFAULT ARRAY[]::UUID[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS roi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  university_slug VARCHAR(255),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  input_snapshot JSONB NOT NULL,
  output_snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_student_activity_events_user_time
  ON student_activity_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_activity_events_session_time
  ON student_activity_events (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_search_history_user_time
  ON student_search_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_search_history_query
  ON student_search_history USING GIN (to_tsvector('simple', coalesce(raw_query, '')));

CREATE INDEX IF NOT EXISTS idx_university_comparisons_user_time
  ON university_comparisons (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_user_time
  ON roi_calculations (user_id, created_at DESC);

ALTER TABLE student_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity events" ON student_activity_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own search history" ON student_search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own comparisons" ON university_comparisons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roi calculations" ON roi_calculations
  FOR SELECT USING (auth.uid() = user_id);
