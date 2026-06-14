import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/home/home-client";
import type { PublicCategory } from "@/types";

interface PublicAd {
  id: string;
  type: string;
  imageUrl: string | null;
  linkUrl: string | null;
  htmlCode: string | null;
  position: string;
}

async function getCategories(): Promise<PublicCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        channels: {
          where: { enabled: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            logoUrl: true,
            categoryId: true,
            featured: true,
          },
        },
      },
    });
    return categories;
  } catch {
    return [];
  }
}

async function getAds(): Promise<PublicAd[]> {
  try {
    return await prisma.ad.findMany({
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
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, ads] = await Promise.all([getCategories(), getAds()]);

  return <HomeClient initialCategories={categories} ads={ads} />;
}

export const dynamic = "force-dynamic";
