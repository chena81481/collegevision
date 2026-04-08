import { NextResponse } from "next/server";
import {
  syncStudentProfile,
  trackStudentActivity,
  trackUniversityComparison,
} from "@/lib/student-journey";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const sessionId =
      typeof body.sessionId === "string" && body.sessionId.trim() ? body.sessionId : null;

    if (body.type === "profile_sync") {
      await syncStudentProfile({
        user,
        source: body.source ?? "LOGIN",
        profile: body.profile ?? {},
      });

      return NextResponse.json({ success: true });
    }

    if (body.type === "comparison") {
      await trackUniversityComparison({
        user,
        sessionId,
        primaryUniversitySlug: body.primaryUniversitySlug,
        comparedUniversitySlug: body.comparedUniversitySlug,
        queryContext: body.queryContext ?? null,
        comparedCourseIds: body.comparedCourseIds ?? [],
        metadata: body.metadata ?? {},
      });

      return NextResponse.json({ success: true });
    }

    await trackStudentActivity({
      user,
      sessionId,
      eventType: body.eventType ?? "APP",
      eventName: body.eventName ?? "CLIENT_EVENT",
      pagePath: body.pagePath ?? null,
      metadata: body.metadata ?? {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/student/activity] Error:", error);
    return NextResponse.json({ error: "Unable to track activity" }, { status: 500 });
  }
}
