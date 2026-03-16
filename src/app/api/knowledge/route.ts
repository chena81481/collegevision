import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const resources = await prisma.knowledgeBaseResource.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } }
            ]
          },
          category ? { category } : {}
        ]
      },
      include: {
        university: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("KnowledgeBase GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, universityId } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 });
    }

    const resource = await prisma.knowledgeBaseResource.create({
      data: {
        title,
        content,
        category,
        universityId: universityId || null
      }
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("KnowledgeBase POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
