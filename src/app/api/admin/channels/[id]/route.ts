import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  streamUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  enabled: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (parsed.data.featured) {
    await prisma.channel.updateMany({
      where: { featured: true, NOT: { id: params.id } },
      data: { featured: false },
    });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.title) {
    data.slug = slugify(parsed.data.title);
  }

  const channel = await prisma.channel.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(channel);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.channel.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
