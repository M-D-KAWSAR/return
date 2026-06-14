import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { viewId, watchSeconds } = await request.json();
    if (!viewId || typeof watchSeconds !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await prisma.channelView.update({
      where: { id: viewId },
      data: { watchSeconds },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
