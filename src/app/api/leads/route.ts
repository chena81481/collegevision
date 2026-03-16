// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@/lib/constants";
import { getLeadFilters } from "@/lib/auth";

// GET all leads
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const requestedCounselorId = searchParams.get("counselorId");
    
    // RBAC: Get filters based on the active session's counselor
    // For now, we assume 'c1' is the logged-in counselor for demonstration
    const activeCounselorId = "c1"; 
    const rbacFilters = await getLeadFilters(activeCounselorId);
    
    const where: any = { ...rbacFilters };
    
    if (status) where.status = status;
    // Only allow filtering by specific counselor if user is Admin or requesting self
    if (requestedCounselorId) {
       if (Object.keys(rbacFilters).length === 0 || requestedCounselorId === activeCounselorId) {
         where.ownerCounselorId = requestedCounselorId;
       }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    
    const leads = await prisma.lead.findMany({
      where,
      include: {
        university: true,
        ownerCounselor: true,
        programs: {
          include: { program: true }
        },
        _count: {
          select: { notes: true, activities: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(leads);
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
    
    // Check for duplicate
    const existingLead = await prisma.lead.findFirst({
      where: { email }
    });
    
    if (existingLead) {
      return NextResponse.json(
        { error: "Lead with this email already exists" },
        { status: 409 }
      );
    }
    
    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source,
        priority,
        universityId,
        ownerCounselorId,
        programs: programIds.length > 0 ? {
          create: programIds.map((programId: string) => ({
            programId
          }))
        } : undefined,
      },
      include: {
        university: true,
        ownerCounselor: true,
        programs: { include: { program: true } }
      }
    });
    
    // Log activity
    await prisma.activity.create({
      data: {
        type: "CREATED",
        description: `Lead created: ${name}`,
        leadId: lead.id,
        counselorId: ownerCounselorId,
      }
    });
    
    // Add initial notes if provided
    if (initialNotes && ownerCounselorId) {
      await prisma.note.create({
        data: {
          content: initialNotes,
          leadId: lead.id,
          counselorId: ownerCounselorId,
        }
      });
    }
    
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
