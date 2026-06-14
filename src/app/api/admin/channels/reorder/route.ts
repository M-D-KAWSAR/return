import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
      categoryId: z.string().optional(),
    })
  ),
});

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.channel.update({
        where: { id: item.id },
        data: {
          sortOrder: item.sortOrder,
          ...(item.categoryId ? { categoryId: item.categoryId } : {}),
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
