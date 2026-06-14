import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ads = await prisma.ad.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      type: true,
      imageUrl: true,
      linkUrl: true,
      htmlCode: true,
      position: true,
    },
  });
  return NextResponse.json(ads);
}

export const revalidate = 60;
