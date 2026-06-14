import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyStreamToken } from "@/lib/stream-token";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateAntiHotlink } from "@/lib/domain-guard";
import {
  decodeProxyUrl,
  rewriteManifest,
  getContentType,
  isSafeProxyUrl,
} from "@/lib/stream-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`stream-proxy:${ip}`, 120, 60000);

  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!validateAntiHotlink(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = request.nextUrl.searchParams.get("token");
  const encodedUrl = request.nextUrl.searchParams.get("url");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const payload = await verifyStreamToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const channel = await prisma.channel.findFirst({
    where: { id: payload.channelId, enabled: true },
    select: { streamUrl: true },
  });

  if (!channel) {
    return NextResponse.json({ error: "Channel unavailable" }, { status: 404 });
  }

  let upstreamUrl = channel.streamUrl;

  if (!isSafeProxyUrl(upstreamUrl)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (encodedUrl) {
    const decoded = decodeProxyUrl(encodedUrl);
    if (!decoded || !isSafeProxyUrl(decoded)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    upstreamUrl = decoded;
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "ReturnZero-StreamProxy/1.0",
        Accept: "*/*",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream stream unavailable" },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    const isManifest =
      upstreamUrl.includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("m3u8");

    if (isManifest) {
      const text = await upstream.text();
      const rewritten = rewriteManifest(text, upstreamUrl, token);
      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(upstreamUrl, contentType),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Stream proxy error" }, { status: 502 });
  }
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}
