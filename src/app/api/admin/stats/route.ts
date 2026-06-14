import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [categories, channels, visitors] = await Promise.all([
    prisma.category.count(),
    prisma.channel.count(),
    prisma.visitorSession.count({
      where: {
        lastSeen: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({
    categories,
    channels,
    onlineVisitors: visitors,
  });
}
