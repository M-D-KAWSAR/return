import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { channelId, sessionId } = await request.json();
    if (!channelId || !sessionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const view = await prisma.channelView.create({
      data: { channelId, sessionId },
    });

    return NextResponse.json({ viewId: view.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
