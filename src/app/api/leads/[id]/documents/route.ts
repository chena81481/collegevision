import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canAccessLead } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activeCounselorId = "c1"; // Placeholder
    
    if (!(await canAccessLead(activeCounselorId, id))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activeCounselorId = "c1";
    
    if (!(await canAccessLead(activeCounselorId, id))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, url } = body;

    const document = await prisma.document.create({
      data: {
        name,
        type,
        url,
        leadId: id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "UPDATED",
        description: `Uploaded document: ${name} (${type})`,
        leadId: id,
        counselorId: activeCounselorId
      }
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
