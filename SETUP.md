# Setup Guide

This guide is for local development and first-time environment setup.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Create `.env` from template:

```bash
cp .env.example .env
```

Set required values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
NEXTAUTH_SECRET=replace_with_secure_random_string
NEXTAUTH_URL=http://localhost:3000
```

Optional but recommended when using pooled providers:

```env
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
```

## 3. Initialize Database

```bash
npm run db:setup
```

This runs:

1. `npm run prisma:migrate`
2. `npm run prisma:seed`

Seed creates:

- demo user account
- admin account
- default thresholds
- subscription and API usage rows
- sample moderation logs

## 4. Run Application

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Credentials

- user: `demo@example.com` / `demo@1234`
- admin: `admin@example.com` / `demo@1234`

## Important Runtime Notes

- Prisma schema uses `provider = "postgresql"`.
- `BatchJob.status` values: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
- App routes protected by middleware:
  - `/dashboard/*` requires auth
  - `/admin/*` requires admin role

## Local Verification Checklist

1. Sign in with demo user
2. Run one single moderation request
3. Upload one CSV in Batch tab
4. Confirm moderation history and analytics update
5. Sign in as admin and open `/admin`

## If Setup Fails

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
