import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const ad = await prisma.ad.update({
    where: { id: params.id },
    data: {
      title: body.title,
      type: body.type,
      imageUrl: body.imageUrl ?? null,
      linkUrl: body.linkUrl ?? null,
      htmlCode: body.htmlCode ?? null,
      position: body.position,
      enabled: body.enabled,
    },
  });

  return NextResponse.json(ad);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.ad.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
