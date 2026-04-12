import { NextResponse } from "next/server";
import { getMatchesForQuery } from "@/lib/match-engine";
import { trackSearchEvent, trackRoiCalculation } from "@/lib/student-journey";
import { createClient } from "@/utils/supabase/server";
import { calculateROI } from "@/lib/roi-calculator";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, sessionId } = body;

    console.log("[/api/match] Route called", {
      hasQuery: Boolean(query),
      queryLength: query?.length || 0,
      sessionId,
    });

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

    const result = await getMatchesForQuery(query, authToken);
    const { matches, parsedIntent, source } = result;

    if (source === "gemini_unavailable" || matches.length === 0) {
      console.error("[/api/match] Gemini recommendations unavailable for query", { query });
      return NextResponse.json(
        { 
          error: "AI recommendations temporarily unavailable", 
          code: "GEMINI_DISCOVERY_FAILED",
          message: "Could not fetch AI results. This usually means the API key is missing or the quota has been exceeded."
        }, 
        { status: 502 }
      );
    }

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
      console.error("[/api/match] Tracking failed without blocking results:", safeError(trackingError));
    }

    return NextResponse.json({
      success: true,
      parsedIntent,
      matches,
      source,
    });
  } catch (error) {
    const info = safeError(error);
    console.error("[/api/match] Fatal error:", info);
    return NextResponse.json(
      { error: "Internal server error", code: "MATCH_ROUTE_FATAL", details: info.message }, 
      { status: 500 }
    );
  }
}
