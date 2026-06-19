import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseM3U(text: string) {
  const lines = text.split(/\r?\n/);
  const entries: { title: string; logoUrl: string | null; category: string; streamUrl: string }[] = [];
  let current: { title: string; logoUrl: string | null; category: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "#EXTM3U") continue;
    if (trimmed.startsWith("#EXTINF")) {
      const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/);
      const groupMatch = trimmed.match(/group-title="([^"]*)"/);
      const nameMatch = trimmed.match(/tvg-name="([^"]*)"/);
      const displayMatch = trimmed.match(/,(.+)$/);
      const title = (displayMatch?.[1]?.trim() || nameMatch?.[1] || "").trim();
      current = {
        title,
        logoUrl: logoMatch?.[1] || null,
        category: groupMatch?.[1]?.trim() || "General",
      };
    } else if (trimmed.startsWith("#")) {
      continue;
    } else if (current && (trimmed.startsWith("http") || trimmed.startsWith("rtmp"))) {
      entries.push({ ...current, streamUrl: trimmed });
      current = null;
    }
  }
  return entries;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let text: string;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    text = await file.text();
  } else {
    text = await req.text();
  }

  const entries = parseM3U(text);
  const categoryCache = new Map<string, string>();
  const added: string[] = [];
  const skipped: string[] = [];

  for (const entry of entries) {
    if (!entry.streamUrl || !entry.title) continue;

    // Skip duplicate URLs
    const existing = await prisma.channel.findFirst({ where: { streamUrl: entry.streamUrl } });
    if (existing) { skipped.push(entry.title); continue; }

    // Find or create category
    const catName = entry.category;
    let catId = categoryCache.get(catName);
    if (!catId) {
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      let cat = await prisma.category.findFirst({ where: { slug: catSlug } });
      if (!cat) {
        cat = await prisma.category.create({ data: { name: catName, slug: catSlug } });
      }
      catId = cat.id;
      categoryCache.set(catName, catId);
    }

    // Generate unique slug
    const baseSlug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.channel.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    await prisma.channel.create({
      data: {
        title: entry.title,
        slug,
        streamUrl: entry.streamUrl,
        logoUrl: entry.logoUrl || null,
        categoryId: catId,
        enabled: true,
        featured: false,
      },
    });
    added.push(entry.title);
  }

  return NextResponse.json({ ok: true, added: added.length, skipped: skipped.length, addedList: added });
}
