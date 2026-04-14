# Content SaaS Moderation

AI-powered content moderation SaaS built with Next.js, Prisma, PostgreSQL, and NextAuth.

This project supports:

- single-text moderation
- batch CSV moderation
- per-user thresholds
- analytics and history
- admin dashboard
- subscription/usage limits

## Documentation

Start here depending on your goal:

- [DOCS_INDEX.md](./DOCS_INDEX.md): Full docs map
- [QUICKSTART.md](./QUICKSTART.md): Fast local run
- [SETUP.md](./SETUP.md): Complete setup details
- [API_REFERENCE.md](./API_REFERENCE.md): API endpoints and payloads
- [WORKFLOWS.md](./WORKFLOWS.md): Product and developer workflows
- [DEPLOYMENT.md](./DEPLOYMENT.md): Production deployment checklist
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md): Common issues and fixes

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui + Radix UI
- Prisma ORM + PostgreSQL
- NextAuth credentials provider (JWT sessions)
- Recharts for analytics
- Zod for request validation

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open `http://localhost:3000`.

Demo accounts seeded by default:

- user: `demo@example.com` / `demo@1234`
- admin: `admin@example.com` / `demo@1234`

## Environment Variables

Minimum required:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

Optional:

- `DIRECT_URL` (recommended for Prisma migration operations)
- `HF_TOKEN` (optional, if model integration is enabled)

See [SETUP.md](./SETUP.md) for exact examples.

## Project Structure

```text
app/
  api/
  auth/
  dashboard/
  admin/
components/
  tabs/
  ui/
lib/
prisma/
```

## Available Scripts

```bash
npm run dev            # Start development server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Lint the codebase
npm run prisma:migrate # Prisma dev migration
npm run prisma:seed    # Seed demo data
npm run db:setup       # Migrate + seed
```

## Notes

- Batch moderation currently processes within the API route. For larger scale, move to background workers/queues.
- `next.config.mjs` currently has `typescript.ignoreBuildErrors = true`. Consider enabling strict CI checks before production hardening.
