import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const counselorId = searchParams.get("counselorId");

  if (!counselorId) return NextResponse.json({ error: "counselorId required" }, { status: 400 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { counselorId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
