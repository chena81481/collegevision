import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { LeadStatus } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Basic Stats
    const [{ count: totalLeads }, { count: wonLeads }, { count: activeLeads }] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', LeadStatus.WON),
      supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', [LeadStatus.NEW_LEAD, LeadStatus.CONTACTED, LeadStatus.PROPOSAL])
    ]);

    // 2. Conversion Rate
    const conversionRate = (totalLeads || 0) > 0 ? ((wonLeads || 0) / (totalLeads || 0)) * 100 : 0;

    // 3. Status & Source Distribution (JS aggregation as Supabase doesn't have direct groupBy)
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('status, source');

    if (leadsError) throw leadsError;

    const statusDistributionMap = (leadsData || []).reduce((acc: any, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusDistributionMap).map(([status, count]) => ({
      status,
      _count: { _all: count }
    }));

    const sourceDistributionMap = (leadsData || []).reduce((acc: any, lead: any) => {
      acc[lead.source || 'Unknown'] = (acc[lead.source || 'Unknown'] || 0) + 1;
      return acc;
    }, {});

    const sourceDistribution = Object.entries(sourceDistributionMap).map(([source, count]) => ({
      source,
      _count: { _all: count }
    }));

    // 5. Recent Activity
    const { data: recentActivities, error: activityError } = await supabase
      .from('activities')
      .select(`
        *,
        leads ( name ),
        counselors ( name )
      `)
      .order('createdAt', { ascending: false })
      .limit(5);

    if (activityError) throw activityError;

    // Map to match frontend expected structure from Prisma
    const formattedActivities = (recentActivities || []).map(act => ({
      ...act,
      lead: act.leads,
      counselor: act.counselors
    }));

    return NextResponse.json({
      stats: {
        totalLeads: totalLeads || 0,
        wonLeads: wonLeads || 0,
        activeLeads: activeLeads || 0,
        conversionRate: conversionRate.toFixed(1),
      },
      distribution: {
        status: statusDistribution,
        source: sourceDistribution,
      },
      recentActivities: formattedActivities
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
