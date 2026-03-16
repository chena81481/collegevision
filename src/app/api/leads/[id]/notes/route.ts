import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, counselorId } = body;

    if (!content || !counselorId) {
      return NextResponse.json(
        { error: "Content and counselorId are required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        content,
        leadId: id,
        counselorId,
      },
      include: {
        counselor: true
      }
    });

    // Also log this as an activity
    await prisma.activity.create({
      data: {
        type: "NOTE_ADDED",
        description: "Added a new counselor note",
        leadId: id,
        counselorId,
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
