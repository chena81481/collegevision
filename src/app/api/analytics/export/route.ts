import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getLeadFilters } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const activeCounselorId = "c1"; // Placeholder for actual session
    const rbacFilters = await getLeadFilters(activeCounselorId);

    const supabase = createAdminClient();
    let query = supabase
      .from('leads')
      .select(`
        *,
        university:universities ( name ),
        ownerCounselor:counselors ( name )
      `)
      .order('createdAt', { ascending: false });

    if (rbacFilters.ownerCounselorId && rbacFilters.ownerCounselorId !== 'none') {
      query = query.eq('ownerCounselorId', rbacFilters.ownerCounselorId);
    } else if (rbacFilters.ownerCounselorId === 'none') {
      return NextResponse.json([]); // No access
    }

    const { data: leads, error } = await query;

    if (error) throw error;

    // Generate CSV content
    const headers = [
      "ID", "Name", "Email", "Phone", "Status", "Priority", "Source", 
      "University", "Counselor", "Value", "Created At"
    ];
    
    const rows = (leads || []).map((lead: any) => [
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
      lead.createdAt ? new Date(lead.createdAt).toISOString() : "N/A"
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
