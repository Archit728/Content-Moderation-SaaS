# Project Overview

## Purpose

Content SaaS Moderation is a multi-user moderation platform where authenticated users can analyze text content, review moderation history, process batch CSV files, and monitor trends.

## High-Level Architecture

1. Frontend (Next.js App Router)

- dashboard UI in `app/dashboard/page.tsx`
- tabbed experience for moderation, batch, analytics, API access, and settings

2. API layer (`app/api/*`)

- validates payloads with Zod
- enforces auth/role via `lib/auth.ts`
- writes/read data through Prisma

3. Persistence (PostgreSQL)

- Prisma schema in `prisma/schema.prisma`
- core models: `User`, `ModerationLog`, `Threshold`, `BatchJob`, `Subscription`, `ApiUsage`

4. Auth and route protection

- NextAuth credentials provider
- middleware protects `/dashboard/*` and `/admin/*`

## Main Product Flows

- Single moderation:
  request -> `/api/moderate` -> model call -> `ModerationLog` insert -> usage increment

- Batch moderation:
  request -> `/api/moderate-batch` -> `BatchJob` create -> sequential item processing -> results saved on job completion

- Analytics:
  `/api/analytics` aggregates moderation logs over time and by label

- Threshold updates:
  `/api/thresholds` stores per-user threshold settings used by moderation requests

## Authorization Model

- `USER`: dashboard features and personal data
- `ADMIN`: all user features plus admin endpoints/pages

## Data Model Snapshot

- `User`: identity, role, apiKey, profile
- `ModerationLog`: moderated text + scores + flag
- `Threshold`: per-label per-user threshold
- `BatchJob`: batch lifecycle and final results
- `Subscription`: plan tier and monthly limits
- `ApiUsage`: current-month single and batch counters

## Key Operational Notes

- Batch route currently runs processing in request lifecycle.
- For heavy production usage, move batch execution to worker/queue infrastructure.
- `next.config.mjs` currently ignores TS build errors. Review before strict production CI.

## Related Docs

- [FEATURES.md](./FEATURES.md)
- [API_REFERENCE.md](./API_REFERENCE.md)
- [WORKFLOWS.md](./WORKFLOWS.md)
