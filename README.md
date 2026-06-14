# Return Zero

A modern, production-ready IPTV streaming web application built with Next.js 14, featuring a dark premium UI, secure stream proxying, and a full admin dashboard.

![Return Zero](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

## Features

- **Premium streaming UI** — Dark glassmorphism design with purple/blue gradients
- **HLS.js player** — Autoplay, fullscreen, quality selector, seamless channel switching
- **Secure streaming** — m3u8 URLs stored server-side only, proxied through signed JWT tokens
- **Admin dashboard** — Full CRUD for categories & channels, logo upload, drag-and-drop sorting
- **Security** — JWT auth, rate limiting, domain restrictions, anti-hotlink protection
- **Live visitor counter** — Real-time online user tracking
- **SEO optimized** — Metadata, sitemap, robots.txt

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js
- HLS.js

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Clone & Install

```bash
cd return-zero
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/return_zero"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-min-32-chars"
STREAM_TOKEN_SECRET="another-random-secret-min-32-chars"
ALLOWED_DOMAINS="localhost,localhost:3000"
ADMIN_EMAIL="admin@returnzero.local"
ADMIN_PASSWORD="YourSecurePassword123!"
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup

```bash
npm run db:push
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the streaming site.

Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Deployment

### Vercel + PostgreSQL (Recommended)

1. Push to GitHub
2. Create a PostgreSQL database (Neon, Supabase, or Railway)
3. Import project in Vercel
4. Set all environment variables from `.env.example`
5. Update `ALLOWED_DOMAINS` with your production domain
6. Deploy

After deploy, run migrations and seed:

```bash
npx prisma db push
npm run db:seed
```

### Docker / VPS

```bash
npm run build
npm start
```

Ensure PostgreSQL is accessible and all env vars are set.

### Production Checklist

- [ ] Change default admin password
- [ ] Set strong `NEXTAUTH_SECRET` and `STREAM_TOKEN_SECRET`
- [ ] Configure `ALLOWED_DOMAINS` for your domain
- [ ] Set up PostgreSQL with backups
- [ ] Use HTTPS (required for secure cookies)
- [ ] Configure persistent storage for logo uploads (`/public/uploads/`)

## Project Structure

```
return-zero/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data & admin user
├── public/
│   ├── robots.txt
│   └── uploads/logos/     # Channel logo uploads
├── src/
│   ├── app/
│   │   ├── admin/         # Admin panel (protected)
│   │   ├── api/           # API routes
│   │   │   ├── stream/    # Secure stream proxy
│   │   │   └── admin/     # Admin CRUD APIs
│   │   └── page.tsx       # Homepage
│   ├── components/
│   │   ├── admin/         # Admin UI components
│   │   ├── home/          # Homepage components
│   │   ├── layout/        # Header, navbar
│   │   └── player/        # HLS video player
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── stream-token.ts # JWT stream tokens
│   │   ├── stream-proxy.ts # HLS manifest rewriting
│   │   ├── rate-limit.ts  # Rate limiting
│   │   └── domain-guard.ts # Domain & hotlink protection
│   └── middleware.ts      # Admin route protection
└── .env.example
```

## Security Architecture

```
Browser → /api/stream/token (channelId) → Signed JWT
Browser → /api/stream/proxy?token=JWT → Backend fetches m3u8
Backend → Upstream stream server (URL never sent to client)
```

- m3u8 URLs are **never** exposed in frontend source or API responses
- Stream tokens expire after 2 hours (configurable)
- Rate limiting on token and proxy endpoints
- Domain/referer validation prevents hotlinking
- Admin routes protected by NextAuth middleware

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/categories` | GET | Public | List enabled categories & channels |
| `/api/stream/token` | POST | Public | Get signed stream token |
| `/api/stream/proxy` | GET | Token | Proxy HLS manifest/segments |
| `/api/visitors` | POST/GET | Public | Visitor counter |
| `/api/admin/*` | * | Admin | CRUD operations |

## License

MIT
