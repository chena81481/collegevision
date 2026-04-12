import { NextResponse } from "next/server";
import { getMatchesForQuery } from "@/lib/match-engine";
import { trackSearchEvent, trackRoiCalculation } from "@/lib/student-journey";
import { createClient } from "@/utils/supabase/server";
import { calculateROI } from "@/lib/roi-calculator";

export async function POST(request: Request) {
  try {
    const { query, sessionId } = await request.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const authToken = session?.access_token;

    const { matches, parsedIntent, source } = await getMatchesForQuery(query, authToken);
    const topMatchIds = matches.map((match) => match.id);

    try {
      await trackSearchEvent({
        user,
        sessionId,
        query,
        parsedIntent: parsedIntent as unknown as Record<string, unknown>,
        matchCourseIds: topMatchIds,
        resultCount: matches.length,
      });

      await Promise.all(
        matches.map((match) =>
          trackRoiCalculation({
            user,
            sessionId,
            universitySlug: match.universitySlug,
            courseId: match.generatedByAi ? null : match.id,
            roiInput: {
              totalFee: match.totalFeeInr,
              avgCTC: match.avgCtcInr ?? 0,
              currentSalary: 0,
              durationMonths: match.durationMonths,
              placementRate: Math.max(55, match.admissionProbability ?? 72),
              loanInterestRate: match.hasZeroCostEmi ? 0 : 9,
              isOnline: true,
            },
            roiOutput: calculateROI({
              totalFee: match.totalFeeInr,
              avgCTC: match.avgCtcInr ?? 0,
              currentSalary: 0,
              durationMonths: match.durationMonths,
              placementRate: Math.max(55, match.admissionProbability ?? 72),
              loanInterestRate: match.hasZeroCostEmi ? 0 : 9,
              isOnline: true,
            }),
          })
        )
      );
    } catch (trackingError) {
      console.error("[/api/match] Tracking failed without blocking Gemini results:", trackingError);
    }

    return NextResponse.json({
      success: true,
      parsedIntent,
      matches,
      source,
      message:
        source === "gemini_unavailable"
          ? "Gemini did not return AI recommendations. Check GEMINI_API_KEY in production."
          : undefined,
    });
  } catch (error) {
    console.error("[/api/match] Error:", error);
    return NextResponse.json({ error: "AI Matching Engine error" }, { status: 500 });
  }
}
