import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@returnzero.local";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashed,
      name: "Admin",
      role: "ADMIN",
    },
  });

  const sports = await prisma.category.upsert({
    where: { slug: "sports" },
    update: {},
    create: {
      name: "Sports",
      slug: "sports",
      sortOrder: 0,
      enabled: true,
    },
  });

  const news = await prisma.category.upsert({
    where: { slug: "news" },
    update: {},
    create: {
      name: "News",
      slug: "news",
      sortOrder: 1,
      enabled: true,
    },
  });

  const entertainment = await prisma.category.upsert({
    where: { slug: "entertainment" },
    update: {},
    create: {
      name: "Entertainment",
      slug: "entertainment",
      sortOrder: 2,
      enabled: true,
    },
  });

  await prisma.channel.upsert({
    where: { slug: "demo-sports-hd" },
    update: {},
    create: {
      title: "Demo Sports HD",
      slug: "demo-sports-hd",
      description: "Sample sports channel for demonstration",
      logoUrl: null,
      streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      categoryId: sports.id,
      enabled: true,
      featured: true,
      sortOrder: 0,
    },
  });

  await prisma.channel.upsert({
    where: { slug: "demo-news-live" },
    update: {},
    create: {
      title: "Demo News Live",
      slug: "demo-news-live",
      description: "Sample news channel",
      logoUrl: null,
      streamUrl: "https://test-streams.mux.dev/test_001/stream.m3u8",
      categoryId: news.id,
      enabled: true,
      featured: false,
      sortOrder: 0,
    },
  });

  await prisma.channel.upsert({
    where: { slug: "demo-entertainment" },
    update: {},
    create: {
      title: "Demo Entertainment",
      slug: "demo-entertainment",
      description: "Sample entertainment channel",
      logoUrl: null,
      streamUrl: "https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8",
      categoryId: entertainment.id,
      enabled: true,
      featured: false,
      sortOrder: 0,
    },
  });

  console.log("Seed completed.");
  console.log(`Admin login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
