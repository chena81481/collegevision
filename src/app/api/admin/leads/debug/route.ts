import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function isDebugAuthorized(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const providedKey =
    request.headers.get("x-lead-debug-key") ||
    request.nextUrl.searchParams.get("key");

  return Boolean(
    process.env.LEAD_DEBUG_KEY &&
      providedKey &&
      providedKey === process.env.LEAD_DEBUG_KEY
  );
}

export async function GET(request: NextRequest) {
  if (!isDebugAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const limit = Math.min(Number(searchParams.get("limit") || 10), 25);

  try {
    let legacyQuery = supabase
      .from("user_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    let crmQuery = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (email) {
      legacyQuery = legacyQuery.eq("email", email);
      crmQuery = crmQuery.eq("email", email);
    }

    if (phone) {
      legacyQuery = legacyQuery.eq("phone_number", phone);
      crmQuery = crmQuery.eq("phone", phone);
    }

    const [legacyResult, crmResult] = await Promise.all([legacyQuery, crmQuery]);

    const crmLeadIds = (crmResult.data ?? []).map((lead) => lead.id).filter(Boolean);

    const activitiesResult =
      crmLeadIds.length > 0
        ? await supabase
            .from("lead_activities")
            .select("*")
            .in("lead_id", crmLeadIds)
            .order("created_at", { ascending: false })
            .limit(limit * 2)
        : { data: [], error: null };

    return NextResponse.json({
      filters: {
        email: email ?? null,
        phone: phone ?? null,
        limit,
      },
      storage: {
        legacy_leads: legacyResult.data ?? [],
        crm_leads: crmResult.data ?? [],
        lead_activities: activitiesResult.data ?? [],
      },
      errors: {
        legacy: legacyResult.error?.message ?? null,
        crm: crmResult.error?.message ?? null,
        activities: activitiesResult.error?.message ?? null,
      },
      summary: {
        legacy_count: legacyResult.data?.length ?? 0,
        crm_count: crmResult.data?.length ?? 0,
        activity_count: activitiesResult.data?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("[/api/admin/leads/debug] Error:", error);
    return NextResponse.json(
      { error: "Failed to inspect lead storage." },
      { status: 500 }
    );
  }
}
