import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const slugs = ["worldcup", "t-sports", "t-sports-16", "t-sports-25"];
  const deleted = await prisma.channel.deleteMany({
    where: { slug: { in: slugs } },
  });
  return NextResponse.json({ ok: true, deleted: deleted.count });
}
