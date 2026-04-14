# Workflows

This document explains key end-to-end flows for users and developers.

## User Workflow: Single Text Moderation

1. User signs in.
2. Frontend sends `POST /api/moderate` with text.
3. API validates payload and checks usage limits.
4. Thresholds are loaded for the user.
5. Moderation runs and result is persisted in `ModerationLog`.
6. Usage counter increments in `ApiUsage`.
7. Frontend renders scores and flagged status.

## User Workflow: Batch CSV Moderation

1. User uploads CSV in Batch tab.
2. Frontend parses rows and sends `POST /api/moderate-batch`.
3. API validates payload and subscription row limits.
4. `BatchJob` created with `PROCESSING` state.
5. Items are processed and persisted to `ModerationLog`.
6. Job updated to `COMPLETED` with `results` payload.
7. Frontend reads job/results from history endpoints.

## User Workflow: Threshold Management

1. Dashboard Settings loads via `GET /api/thresholds`.
2. User adjusts slider values.
3. Frontend sends `POST /api/thresholds`.
4. API upserts per-label values for current user.

## User Workflow: Profile Management

1. Profile tab loads from `GET /api/profile`.
2. Profile edits sent with `PUT /api/profile`.
3. Password change uses `POST /api/profile/change-password`.

## Admin Workflow

1. Admin signs in with `ADMIN` role.
2. Visits admin page.
3. Frontend calls:
   - `GET /api/admin/stats`
   - `GET /api/admin/users`
4. APIs enforce role via `requireRole(Role.ADMIN)`.

## Developer Workflow: Local Setup

1. `npm install`
2. Create `.env` from `.env.example`
3. `npm run db:setup`
4. `npm run dev`

See [SETUP.md](./SETUP.md) for details.

## Developer Workflow: Schema Change

1. Edit `prisma/schema.prisma`.
2. Run `npm run prisma:migrate`.
3. If needed, run `npm run prisma:seed`.
4. Validate in Prisma Studio.

## Developer Workflow: Add API Endpoint

1. Add route in `app/api/.../route.ts`.
2. Validate input with Zod schema.
3. Enforce auth/role where needed.
4. Add endpoint docs to [API_REFERENCE.md](./API_REFERENCE.md).
5. Add smoke test steps in [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if applicable.
