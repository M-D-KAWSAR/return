import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().nullable(),
  streamUrl: z.string().url(),
  categoryId: z.string().min(1),
  enabled: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categoryId = request.nextUrl.searchParams.get("categoryId");

  const channels = await prisma.channel.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { sortOrder: "asc" },
    include: { category: { select: { name: true } } },
  });

  return NextResponse.json(channels);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const slug = slugify(parsed.data.title);
  const existing = await prisma.channel.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Channel already exists" }, { status: 409 });
  }

  const maxOrder = await prisma.channel.aggregate({
    where: { categoryId: parsed.data.categoryId },
    _max: { sortOrder: true },
  });

  if (parsed.data.featured) {
    await prisma.channel.updateMany({
      where: { featured: true },
      data: { featured: false },
    });
  }

  const channel = await prisma.channel.create({
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      logoUrl: parsed.data.logoUrl,
      streamUrl: parsed.data.streamUrl,
      categoryId: parsed.data.categoryId,
      enabled: parsed.data.enabled ?? true,
      featured: parsed.data.featured ?? false,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(channel, { status: 201 });
}
