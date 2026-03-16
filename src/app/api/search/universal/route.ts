import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ leads: [], universities: [], knowledge: [] });
    }

    const [leads, universities, knowledge] = await Promise.all([
      (prisma as any).lead.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, status: true },
      }),
      (prisma as any).university.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, name: true, location: true, country: true },
      }),
      (prisma as any).knowledgeBaseResource.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, title: true, category: true },
      }),
    ]);

    return NextResponse.json({
      leads,
      universities,
      knowledge,
    });
  } catch (error) {
    console.error("Universal Search Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
