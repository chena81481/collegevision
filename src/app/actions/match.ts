'use server'

import { MatcherSchema, MatcherInput } from '@/utils/matcher';

export const runtime = 'edge'; // Edge Runtime for sub-second responses

function safeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
    };
  }
  return { message: String(error) };
}

export async function findVectorMatches(rawInput: MatcherInput) {
  try {
    // 1. Validate Input
    const validatedInput = MatcherSchema.parse(rawInput);
    
    // 2. Direct AI Discovery
    const queryText = `Student with budget of ₹${validatedInput.budget}, interested in ${validatedInput.targetLevel || 'degrees'}, 
                      with focus on ${validatedInput.skills.join(', ')}. Career goal: ${validatedInput.statePreference || 'Better ROI'}`;
    
    console.log("[findVectorMatches] Action called", { queryLength: queryText.length });

    const { getMatchesForQuery } = await import('@/lib/match-engine');
    const result = await getMatchesForQuery(queryText);

    if (result.source === "gemini_unavailable" || result.matches.length === 0) {
      console.warn("[findVectorMatches] AI discovery returned no results");
      return { 
        success: false, 
        error: "AI recommendations unavailable",
        code: "AI_EMPTY_RESPONSE"
      };
    }

    return {
      success: true,
      matches: result.matches.map((m: any) => ({
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
    const info = safeError(err);
    console.error("[findVectorMatches] Action fatal error:", info);
    return { success: false, error: info.message, code: "ACTION_FATAL" };
  }
}
