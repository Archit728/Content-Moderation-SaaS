# Prisma Commands

This project uses Prisma with PostgreSQL.

## Most Common Commands

```bash
npm run prisma:migrate   # prisma migrate dev
npm run prisma:seed      # ts-node prisma/seed.ts
npm run db:setup         # migrate + seed
```

## Local Development Commands

```bash
npx prisma studio
npx prisma generate
npx prisma validate
npx prisma migrate status
```

## Safe Command Usage

Use in local development:

- `prisma migrate dev`
- `prisma migrate reset`

Use in production/staging release pipeline:

- `prisma migrate deploy`

Avoid in production:

- `prisma migrate reset`

## Fresh Local Reset

```bash
npx prisma migrate reset
npm run prisma:seed
```

## Environment Notes

- Prisma datasource uses:
  - `DATABASE_URL` (runtime)
  - `DIRECT_URL` (optional direct connection)

When using pooled providers, keep runtime on pooled `DATABASE_URL` and run migrations using `DIRECT_URL` where needed.

## Seed Behavior (Current)

`prisma/seed.ts` creates:

- demo user account
- admin account
- subscription and usage rows for both users
- default thresholds for demo user
- sample moderation logs

## Quick Verification

After setup, validate in Prisma Studio:

1. `User` has demo and admin accounts
2. `Subscription` has rows for both users
3. `ApiUsage` has rows for both users
4. `Threshold` has default labels for demo user
