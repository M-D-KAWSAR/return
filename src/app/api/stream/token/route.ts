import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStreamToken, getStreamTokenTtl } from "@/lib/stream-token";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isDomainAllowed, validateAntiHotlink } from "@/lib/domain-guard";
import { getBaseUrl } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  channelId: z.string().min(1),
  sessionId: z.string().min(1).max(64),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`stream-token:${ip}`, 30, 60000);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  if (!isDomainAllowed(request) || !validateAntiHotlink(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const channel = await prisma.channel.findFirst({
    where: { id: parsed.data.channelId, enabled: true },
    select: { id: true },
  });

  if (!channel) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const token = await createStreamToken({
    channelId: channel.id,
    sessionId: parsed.data.sessionId,
  });

  const baseUrl = getBaseUrl();
  const playbackUrl = `${baseUrl}/api/stream/proxy?token=${encodeURIComponent(token)}`;

  return NextResponse.json({
    token,
    expiresIn: getStreamTokenTtl(),
    playbackUrl,
  });
}
