import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { calculateROI, type ROIInput, type ROIResult } from "@/lib/roi-calculator";

type JsonRecord = Record<string, unknown>;

export interface JourneyIdentity {
  user?: User | null;
  sessionId?: string | null;
}

export interface SearchTrackingPayload extends JourneyIdentity {
  query: string;
  parsedIntent?: JsonRecord;
  matchCourseIds?: string[];
  resultCount?: number;
}

export interface ComparisonTrackingPayload extends JourneyIdentity {
  primaryUniversitySlug: string;
  comparedUniversitySlug: string;
  queryContext?: string | null;
  comparedCourseIds?: string[];
  metadata?: JsonRecord;
}

export interface RoiTrackingPayload extends JourneyIdentity {
  universitySlug?: string | null;
  courseId?: string | null;
  roiInput: ROIInput;
  roiOutput?: ROIResult;
}

export interface ProfileSyncPayload extends JourneyIdentity {
  profile?: JsonRecord;
  source: "AUTH_CALLBACK" | "LOGIN" | "REGISTER" | "LEAD_FORM" | "APPLICATION";
}

function getNames(user: User | null | undefined) {
  const fullName =
    user?.user_metadata?.full_name ||
    [user?.user_metadata?.first_name, user?.user_metadata?.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const firstName =
    user?.user_metadata?.first_name ||
    (fullName ? fullName.split(" ")[0] : null);
  const lastName =
    user?.user_metadata?.last_name ||
    (fullName ? fullName.split(" ").slice(1).join(" ") : null);

  return { fullName, firstName, lastName };
}

export async function syncStudentProfile({
  user,
  profile,
  source,
}: ProfileSyncPayload) {
  if (!user) {
    return;
  }

  const supabase = createAdminClient();
  const names = getNames(user);
  const payload = {
    user_id: user.id,
    email: user.email ?? null,
    full_name: names.fullName,
    first_name: names.firstName,
    last_name: names.lastName,
    preferred_degree: (profile?.preferred_degree as string | null) ?? null,
    target_budget_inr: Number(profile?.target_budget_inr ?? 0) || null,
    study_mode: (profile?.study_mode as string | null) ?? null,
    current_salary_inr: Number(profile?.current_salary_inr ?? 0) || null,
    target_salary_inr: Number(profile?.target_salary_inr ?? 0) || null,
    career_goal: (profile?.career_goal as string | null) ?? null,
    phone_number: (profile?.phone_number as string | null) ?? null,
    state: (profile?.state as string | null) ?? null,
    profile_source: source,
    last_active_at: new Date().toISOString(),
  };

  await supabase.from("student_profiles").upsert(payload, {
    onConflict: "user_id",
  });

  await trackStudentActivity({
    user,
    eventType: "AUTH",
    eventName: source,
    metadata: {
      profile_source: source,
    },
  });
}

export async function trackStudentActivity({
  user,
  sessionId,
  eventType,
  eventName,
  source = "web",
  pagePath,
  metadata,
}: JourneyIdentity & {
  eventType: string;
  eventName: string;
  source?: string;
  pagePath?: string | null;
  metadata?: JsonRecord;
}) {
  const supabase = createAdminClient();
  await supabase.from("student_activity_events").insert({
    user_id: user?.id ?? null,
    session_id: sessionId ?? null,
    event_type: eventType,
    event_name: eventName,
    source,
    page_path: pagePath ?? null,
    metadata: metadata ?? {},
  });
}

export async function trackSearchEvent({
  user,
  sessionId,
  query,
  parsedIntent,
  matchCourseIds,
  resultCount,
}: SearchTrackingPayload) {
  const supabase = createAdminClient();

  await Promise.all([
    supabase.from("student_search_history").insert({
      user_id: user?.id ?? null,
      session_id: sessionId ?? null,
      raw_query: query,
      normalized_query: query.trim().toLowerCase(),
      filters: parsedIntent ?? {},
      top_match_course_ids: matchCourseIds ?? [],
      result_count: resultCount ?? 0,
    }),
    trackStudentActivity({
      user,
      sessionId,
      eventType: "SEARCH",
      eventName: "ADVANCED_MATCH_SEARCH",
      pagePath: "/",
      metadata: {
        query,
        parsed_intent: parsedIntent ?? {},
        result_count: resultCount ?? 0,
      },
    }),
  ]);
}

export async function trackUniversityComparison({
  user,
  sessionId,
  primaryUniversitySlug,
  comparedUniversitySlug,
  queryContext,
  comparedCourseIds,
  metadata,
}: ComparisonTrackingPayload) {
  const supabase = createAdminClient();

  await Promise.all([
    supabase.from("university_comparisons").insert({
      user_id: user?.id ?? null,
      session_id: sessionId ?? null,
      primary_university_slug: primaryUniversitySlug,
      compared_university_slug: comparedUniversitySlug,
      query_context: queryContext ?? null,
      compared_course_ids: comparedCourseIds ?? [],
      metadata: metadata ?? {},
    }),
    trackStudentActivity({
      user,
      sessionId,
      eventType: "COMPARE",
      eventName: "UNIVERSITY_COMPARISON_VIEWED",
      pagePath: `/compare/${primaryUniversitySlug}-vs-${comparedUniversitySlug}`,
      metadata: {
        primary_university_slug: primaryUniversitySlug,
        compared_university_slug: comparedUniversitySlug,
      },
    }),
  ]);
}

export async function trackRoiCalculation({
  user,
  sessionId,
  universitySlug,
  courseId,
  roiInput,
  roiOutput,
}: RoiTrackingPayload) {
  const supabase = createAdminClient();
  const output = roiOutput ?? calculateROI(roiInput);

  await Promise.all([
    supabase.from("roi_calculations").insert({
      user_id: user?.id ?? null,
      session_id: sessionId ?? null,
      university_slug: universitySlug ?? null,
      course_id: courseId ?? null,
      input_snapshot: roiInput,
      output_snapshot: output,
    }),
    trackStudentActivity({
      user,
      sessionId,
      eventType: "ROI",
      eventName: "ROI_CALCULATED",
      pagePath: universitySlug ? `/universities/${universitySlug}` : null,
      metadata: {
        university_slug: universitySlug ?? null,
        course_id: courseId ?? null,
        payback_months: output.paybackMonths,
        break_even_year: output.breakEvenYear,
        roi_score: output.roiScore,
      },
    }),
  ]);

  return output;
}
