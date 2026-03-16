import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCounselor, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const adminId = "c1"; // Mock admin session
    const user = await getCounselor(adminId);
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const counselors = await prisma.counselor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        leads: {
          select: {
            status: true,
            value: true,
          }
        },
        tasks: {
          where: { completed: false },
          select: { id: true }
        }
      }
    });

    const stats = counselors.map((c: any) => {
      const totalLeads = c.leads.length;
          const wonLeads = c.leads.filter((l: any) => l.status === "WON");
    const wonValue = wonLeads.reduce((sum: any, l: any) => sum + (l.value || 0), 0);      const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;
      const activeLeads = c.leads.filter((l: any) => !["WON", "LOST"].includes(l.status)).length;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        totalLeads,
        wonValue,
        conversionRate,
        activeLeads,
        pendingTasks: c.tasks.length
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Counselor Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch counselor statistics" }, { status: 500 });
  }
}
