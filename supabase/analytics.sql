-- ============================================================
-- High-Scale Performance & Vector Search Migration
-- ============================================================

-- 1. Enable Vector Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add Embedding Column to Courses (Programs)
-- 1536 is the standard dimension for OpenAI/Gemini modern embeddings
ALTER TABLE courses ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create Program Analytics Materialized View
-- This pre-computes ROI and Wealth projections to eliminate on-the-fly math
CREATE MATERIALIZED VIEW IF NOT EXISTS program_analytics AS
SELECT 
    c.id as course_id,
    c.name as course_name,
    u.name as university_name,
    c.total_fee_inr,
    c.avg_ctc_inr,
    -- Break-even logic: Fee / (Avg CTC Annual - Baseline Entry Salary)
    -- Assuming a 3LPA baseline for a high-school/non-degree holder in India
    ROUND(c.total_fee_inr::numeric / NULLIF((c.avg_ctc_inr - 300000), 0)::numeric, 2) as break_even_years,
    -- 8-Year Wealth Projection: (Avg CTC * 8) - Total Fee + (Compound Interest/Hikes factored)
    -- Simplified for MVP view: (Avg CTC * 8) - Fee
    (c.avg_ctc_inr * 8) - c.total_fee_inr as eight_year_wealth_projection,
    c.has_zero_cost_emi,
    c.approvals,
    c.badge_label,
    u.is_premium
FROM courses c
JOIN universities u ON c.university_id = u.id;

-- Create index for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_program_analytics_course_id ON program_analytics (course_id);

-- 4. Create Vector Similarity RPC Function
-- This allows the Next.js Edge functions to perform high-speed matching
CREATE OR REPLACE FUNCTION match_programs (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  min_salary int DEFAULT 0,
  max_fee int DEFAULT 10000000
)
RETURNS TABLE (
  id uuid,
  name varchar,
  university_name varchar,
  total_fee_inr int,
  avg_ctc_inr int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    u.name as university_name,
    c.total_fee_inr,
    c.avg_ctc_inr,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM courses c
  JOIN universities u ON c.university_id = u.id
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
    AND c.avg_ctc_inr >= min_salary
    AND c.total_fee_inr <= max_fee
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. Helper Function to Refresh Analytics
CREATE OR REPLACE FUNCTION refresh_program_analytics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY program_analytics;
  RETURN NULL;
END;
$$;

-- 6. Trigger to Auto-Refresh View on Data Changes
DROP TRIGGER IF EXISTS trigger_refresh_analytics ON courses;
CREATE TRIGGER trigger_refresh_analytics
AFTER INSERT OR UPDATE OR DELETE ON courses
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_program_analytics();

-- 7. RLS for Materialized View (Public Read)
-- Note: Views don't have RLS, policy applies to base tables, but good to doc here.
-- Access is already public Select via courses/universities policies.
