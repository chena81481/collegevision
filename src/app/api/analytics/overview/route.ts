import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@/lib/constants";

export async function GET() {
  try {
    // 1. Basic Stats
    const totalLeads = await prisma.lead.count();
    const wonLeads = await prisma.lead.count({ where: { status: LeadStatus.WON } });
    const activeLeads = await prisma.lead.count({ 
      where: { 
        status: { in: [LeadStatus.NEW_LEAD, LeadStatus.CONTACTED, LeadStatus.PROPOSAL] } 
      } 
    });

    // 2. Conversion Rate
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    // 3. Leads by Status
    const statusDistribution = await prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    // 4. Leads by Source
    const sourceDistribution = await prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
    });

    // 5. Recent Activity
    const recentActivities = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { name: true } },
        counselor: { select: { name: true } }
      }
    });

    return NextResponse.json({
      stats: {
        totalLeads,
        wonLeads,
        activeLeads,
        conversionRate: conversionRate.toFixed(1),
      },
      distribution: {
        status: statusDistribution,
        source: sourceDistribution,
      },
      recentActivities
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
