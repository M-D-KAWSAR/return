import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = startOfToday();
  const ago7 = daysAgo(7);
  const ago30 = daysAgo(30);

  const [
    visitorsToday,
    visitors7d,
    visitors30d,
    viewsToday,
    views7d,
    views30d,
    topChannels,
    watchTimeResult,
  ] = await Promise.all([
    // Unique visitors (by sessionId seen today)
    prisma.visitorSession.count({ where: { lastSeen: { gte: todayStart } } }),
    prisma.visitorSession.count({ where: { lastSeen: { gte: ago7 } } }),
    prisma.visitorSession.count({ where: { lastSeen: { gte: ago30 } } }),

    // Channel views
    prisma.channelView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.channelView.count({ where: { createdAt: { gte: ago7 } } }),
    prisma.channelView.count({ where: { createdAt: { gte: ago30 } } }),

    // Top 10 channels by total views (all time)
    prisma.channelView.groupBy({
      by: ["channelId"],
      _count: { id: true },
      _sum: { watchSeconds: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),

    // Total watch time (all time)
    prisma.channelView.aggregate({ _sum: { watchSeconds: true } }),
  ]);

  // Resolve channel titles for top channels
  const channelIds = topChannels.map((r) => r.channelId);
  const channels = await prisma.channel.findMany({
    where: { id: { in: channelIds } },
    select: { id: true, title: true, logoUrl: true },
  });
  const channelMap = Object.fromEntries(channels.map((c) => [c.id, c]));

  const topChannelsData = topChannels.map((r) => ({
    channelId: r.channelId,
    title: channelMap[r.channelId]?.title ?? "Unknown",
    logoUrl: channelMap[r.channelId]?.logoUrl ?? null,
    views: r._count.id,
    watchSeconds: r._sum.watchSeconds ?? 0,
  }));

  return NextResponse.json({
    visitors: { today: visitorsToday, last7d: visitors7d, last30d: visitors30d },
    views: { today: viewsToday, last7d: views7d, last30d: views30d },
    topChannels: topChannelsData,
    totalWatchSeconds: watchTimeResult._sum.watchSeconds ?? 0,
  });
}
