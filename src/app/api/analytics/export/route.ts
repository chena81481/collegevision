import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLeadFilters, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const activeCounselorId = "c1"; // Placeholder for actual session
    const isUserAdmin = await isAdmin(activeCounselorId);
    const rbacFilters = await getLeadFilters(activeCounselorId);

    const leads = await prisma.lead.findMany({
      where: rbacFilters,
      include: {
        university: true,
        ownerCounselor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV content
    const headers = [
      "ID", "Name", "Email", "Phone", "Status", "Priority", "Source", 
      "University", "Counselor", "Value", "Created At"
    ];
    
    const rows = leads.map((lead: any) => [
      lead.id,
      lead.name,
      lead.email,
      lead.phone,
      lead.status,
      lead.priority,
      lead.source,
      lead.university?.name || "N/A",
      lead.ownerCounselor?.name || "Unassigned",
      lead.value || 0,
      lead.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=leads_export_${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
