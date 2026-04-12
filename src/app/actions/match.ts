'use server'

import { MatcherSchema, MatcherInput } from '@/utils/matcher';

export const runtime = 'edge'; // Edge Runtime for sub-second responses

export async function findVectorMatches(rawInput: MatcherInput) {
  try {
    // 1. Validate Input
    const validatedInput = MatcherSchema.parse(rawInput);
    
    // 2. Direct AI Discovery (Bypassing Supabase RPC & Vector Similarity)
    const queryText = `Student with budget of ₹${validatedInput.budget}, interested in ${validatedInput.targetLevel || 'degrees'}, 
                      with focus on ${validatedInput.skills.join(', ')}. Career goal: ${validatedInput.statePreference || 'Better ROI'}`;
    
    const { getMatchesForQuery } = await import('@/lib/match-engine');
    const result = await getMatchesForQuery(queryText);

    return {
      success: true,
      matches: (result.matches || []).map((m: any) => ({
        courseId: m.id,
        universityName: m.universityName,
        courseName: m.courseName,
        totalFee: m.totalFeeInr,
        avgCtc: m.avgCtcInr,
        roiScore: Number((m.roi / 100).toFixed(2)),
        matchScore: m.matchScore,
        matchInsights: m.matchReasons || []
      }))
    };

  } catch (err: any) {
    console.error("Vector match failed:", err);
    return { success: false, error: err.message };
  }
}
