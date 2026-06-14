import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const VISITOR_TIMEOUT_MS = 5 * 60 * 1000;

const schema = z.object({
  sessionId: z.string().min(1).max(64),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`visitor:${ip}`, 10, 60000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const { sessionId } = parsed.data;

  await prisma.visitorSession.upsert({
    where: { sessionId },
    create: { sessionId },
    update: { lastSeen: new Date() },
  });

  const cutoff = new Date(Date.now() - VISITOR_TIMEOUT_MS);
  await prisma.visitorSession.deleteMany({
    where: { lastSeen: { lt: cutoff } },
  });

  const count = await prisma.visitorSession.count({
    where: { lastSeen: { gte: cutoff } },
  });

  return NextResponse.json({ count });
}

export async function GET() {
  const cutoff = new Date(Date.now() - VISITOR_TIMEOUT_MS);

  const count = await prisma.visitorSession.count({
    where: { lastSeen: { gte: cutoff } },
  });

  return NextResponse.json(
    { count },
    {
      headers: {
        "Cache-Control": "no-cache",
      },
    }
  );
}
