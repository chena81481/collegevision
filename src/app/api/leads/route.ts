// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getLeadFilters } from "@/lib/auth";

// GET all leads
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const requestedCounselorId = searchParams.get("counselorId");
    
    // RBAC: Get filters based on the active session's counselor
    const activeCounselorId = "c1"; 
    const rbacFilters = await getLeadFilters(activeCounselorId);
    
    const supabase = createAdminClient();
    let query = supabase
      .from('leads')
      .select(`
        *,
        universities ( * ),
        counselors:ownerCounselorId ( * ),
        lead_programs (
          programs ( * )
        )
      `)
      .order('createdAt', { ascending: false });
    
    // Apply RBAC filters
    if (rbacFilters.ownerCounselorId && rbacFilters.ownerCounselorId !== 'none') {
      query = query.eq('ownerCounselorId', rbacFilters.ownerCounselorId);
    } else if (rbacFilters.ownerCounselorId === 'none') {
      return NextResponse.json([]); // No access
    }

    if (status) query = query.eq('status', status);
    
    if (requestedCounselorId) {
       // Only allow filtering by specific counselor if user is Admin (no rbacFilters) or requesting self
       if (Object.keys(rbacFilters).length === 0 || requestedCounselorId === activeCounselorId) {
         query = query.eq('ownerCounselorId', requestedCounselorId);
       }
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    const { data: leads, error } = await query;
    
    if (error) throw error;
    
    // Map to match the structure the frontend expects (merging Supabase's relational structure)
    const formattedLeads = (leads || []).map(lead => ({
      ...lead,
      university: lead.universities,
      ownerCounselor: lead.counselors,
      programs: (lead.lead_programs || []).map((lp: any) => ({
        program: lp.programs
      }))
    }));
    
    return NextResponse.json(formattedLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      source,
      priority,
      universityId,
      ownerCounselorId,
      programIds = [],
      notes: initialNotes,
    } = body;
    
    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();

    // Check for duplicate
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (existingLead) {
      return NextResponse.json(
        { error: "Lead with this email already exists" },
        { status: 409 }
      );
    }
    
    // Create lead
    const { data: lead, error: createError } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone,
        source,
        priority: priority || 'MEDIUM',
        universityId,
        ownerCounselorId,
      })
      .select(`
        *,
        universities ( * ),
        counselors:ownerCounselorId ( * )
      `)
      .single();
    
    if (createError) throw createError;

    // Supabase doesn't do nested creates easily for M2M, do it manually
    if (programIds.length > 0) {
      const leadPrograms = programIds.map((programId: string) => ({
        leadId: lead.id,
        programId
      }));
      await supabase.from('lead_programs').insert(leadPrograms);
    }
    
    // Log activity
    await supabase.from('activities').insert({
      type: "CREATED",
      description: `Lead created: ${name}`,
      leadId: lead.id,
      counselorId: ownerCounselorId,
    });
    
    // Add initial notes if provided
    if (initialNotes && ownerCounselorId) {
      await supabase.from('notes').insert({
        content: initialNotes,
        leadId: lead.id,
        counselorId: ownerCounselorId,
      });
    }

    // Format final object
    const finalLead = {
      ...lead,
      university: lead.universities,
      ownerCounselor: lead.counselors,
      programs: [] // We could fetch again but usually not needed for initial POST return if frontend only needs the core object
    };
    
    return NextResponse.json(finalLead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
