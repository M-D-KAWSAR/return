import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ads = await prisma.ad.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(ads);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const count = await prisma.ad.count();

  const ad = await prisma.ad.create({
    data: {
      title: body.title,
      type: body.type ?? "image",
      imageUrl: body.imageUrl ?? null,
      linkUrl: body.linkUrl ?? null,
      htmlCode: body.htmlCode ?? null,
      position: body.position ?? "banner_top",
      enabled: body.enabled ?? true,
      sortOrder: count,
    },
  });

  return NextResponse.json(ad, { status: 201 });
}
