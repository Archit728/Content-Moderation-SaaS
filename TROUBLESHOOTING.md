# Troubleshooting

## App Fails to Start

### Symptom

`npm run dev` fails.

### Checks

1. Ensure dependencies are installed:

```bash
npm install
```

2. Ensure required env values exist in `.env`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Database Connection Errors

### Symptom

Prisma reports unable to reach database.

### Checks

1. Verify connection string format.
2. Confirm DB server is running and reachable.
3. If using pooled providers, test both `DATABASE_URL` and `DIRECT_URL`.
4. Run:

```bash
npx prisma migrate status
```

## Migration Problems

### Symptom

Migration fails or is out of sync.

### Fixes

- local/dev reset:

```bash
npx prisma migrate reset
```

- production-safe deploy:

```bash
npx prisma migrate deploy
```

## Seed Did Not Create Accounts

### Symptom

Demo users missing after setup.

### Fixes

```bash
npm run prisma:seed
npx prisma studio
```

Check `User`, `Subscription`, and `ApiUsage` tables.

## Auth Issues

### Symptom

Unauthorized responses on dashboard APIs.

### Checks

1. Verify sign-in succeeded.
2. Confirm cookies/session are present.
3. Check middleware route matcher configuration in `middleware.ts`.

## Admin Page Access Denied

### Symptom

Signed in user cannot access `/admin`.

### Checks

1. Confirm user role is `ADMIN` in database.
2. Verify `session.user.role` is populated from NextAuth callbacks.

## Batch Processing Feels Stuck

### Notes

Batch currently processes inside API request lifecycle.

### Checks

1. Inspect server logs for `/api/moderate-batch` duration.
2. Validate `BatchJob` status in `batch-history` endpoints.
3. For heavy scale, move to worker queue architecture.

## Build Passes Despite Type Errors

### Reason

`next.config.mjs` currently sets:

- `typescript.ignoreBuildErrors = true`

### Recommendation

Turn this off in production-hardening phase and enforce type checks in CI.
