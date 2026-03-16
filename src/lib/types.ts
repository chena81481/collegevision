// ─── Shared Types ────────────────────────────────────────────────────────────
// These mirror the Supabase schema and are used across the API and frontend.

export interface CourseMatch {
  id: string;
  universityName: string;
  universitySlug: string;
  logoUrl: string | null;
  gradientStart: string;
  gradientEnd: string;
  courseName: string;
  degreeLevel: string;
  durationMonths: number;
  totalFeeInr: number;
  avgCtcInr: number | null;
  hasZeroCostEmi: boolean;
  approvals: string[];
  badgeLabel: string | null;
  roi: number | null;          // Calculated dynamically server-side
  category: string;             // e.g. "online-mba"
  matchScore: number;          // 0-100, higher = better match for the query
}

export interface MatchApiRequest {
  query: string;               // e.g. "MBA under 2 lakhs with EMI"
}

export interface MatchApiResponse {
  matches: CourseMatch[];
  parsedFilters: ParsedQuery;  // So the frontend can show "Showing results for…"
}

// What the NLP parser extracts from a natural-language query
export interface ParsedQuery {
  maxBudgetInr: number | null;
  degreeKeyword: string | null; // e.g. "MBA", "BBA", "MCA"
  requiresEmi: boolean;
  requiredApprovals: string[];  // e.g. ["UGC-DEB", "NAAC A+"]
  careerGoal: string | null;    // Added careerGoal
}
