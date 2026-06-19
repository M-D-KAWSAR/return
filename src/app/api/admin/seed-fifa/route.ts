import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOGO = "https://assets.football-logos.cc/logos/tournaments/1500x1500/fifa-world-cup-2026--white.10e0b37b.png";

const CHANNELS = [
  { title: "Caze TV BR", streamUrl: "https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8" },
  { title: "Somoy", streamUrl: "https://live.thebosstv.com:30443/dwlive/Somoy-TV/chunks.m3u8" },
  { title: "Z Bangla sonar Low", streamUrl: "https://d1g8wgjurz8via.cloudfront.net/bpk-tv/ColorsHD/default/Zeebanglahd.m3u8" },
  { title: "Bein Sports 1 720p", streamUrl: "https://1nyaler.streamhostingcdn.top/stream/23/index.m3u8" },
  { title: "beIN SPORTS 1 UHD", streamUrl: "http://proxpanel.cc/h1wqD6CY/byxHYgX/707929" },
  { title: "beIN SPORTS MAX 1 4K", streamUrl: "http://proxpanel.cc/h1wqD6CY/byxHYgX/835130" },
  { title: "WIN Sports", streamUrl: "https://1nyaler.streamhostingcdn.top/stream/32/index.m3u8" },
  { title: "FOX", streamUrl: "http://84.17.50.102/fox/index.m3u8" },
  { title: "FS1", streamUrl: "http://41.223.30.230/FOXSPORTS1/index.m3u8" },
  { title: "FS2", streamUrl: "https://1nyaler.streamhostingcdn.top/stream/26/index.m3u8" },
  { title: "PTV", streamUrl: "http://198.195.239.50:8095/tsports/tracks-v1a1/mono.m3u8" },
  { title: "DAZN 1", streamUrl: "https://1nyaler.streamhostingcdn.top/stream/94/index.m3u8" },
  { title: "Telemundo", streamUrl: "https://nbculocallive.akamaized.net/hls/live/2037499/puertorico/stream1/master.m3u8" },
  { title: "ESPN S1", streamUrl: "https://1nyaler.streamhostingcdn.top/stream/97/index.m3u8" },
  { title: "ESPN S2", streamUrl: "http://186.33.40.97:8789/play/20" },
  { title: "D Sports", streamUrl: "https://1nyaler.streamhostingcdn.top/stream/106/index.m3u8" },
];

export const dynamic = "force-dynamic";

export async function GET() {
  let category = await prisma.category.findFirst({ where: { slug: "fifa-wc-2026" } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "FIFA WC 2026", slug: "fifa-wc-2026", sortOrder: 0 },
    });
  }

  const added: string[] = [];
  for (let i = 0; i < CHANNELS.length; i++) {
    const ch = CHANNELS[i];
    const slug = ch.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const existing = await prisma.channel.findFirst({ where: { slug } });
    if (!existing) {
      await prisma.channel.create({
        data: {
          title: ch.title,
          slug,
          streamUrl: ch.streamUrl,
          logoUrl: LOGO,
          categoryId: category.id,
          enabled: true,
          featured: false,
        },
      });
      added.push(ch.title);
    }
  }

  return NextResponse.json({ ok: true, added, total: added.length });
}
