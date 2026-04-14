# Deployment Guide

## Recommended Target

Vercel + PostgreSQL (Neon/Supabase/RDS) is the simplest production path.

## Required Environment Variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
NEXTAUTH_SECRET=replace_with_secure_random_string
NEXTAUTH_URL=https://your-domain.example
```

Optional:

```env
DIRECT_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
HF_TOKEN=optional
```

## Pre-Deploy Checklist

- `npm install` succeeds
- `npm run lint` succeeds
- `npm run build` succeeds
- Production env vars configured
- Database reachable from deployment target
- Prisma migration plan reviewed

## Database Migration in Production

Use deploy migrations, not dev/reset commands:

```bash
npx prisma migrate deploy
```

Do not run in production:

- `prisma migrate dev`
- `prisma migrate reset`

## Vercel Steps

1. Push repository to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Run migrations against production DB

## Post-Deploy Verification

1. Open sign-in page
2. Authenticate with a valid account
3. Execute one single moderation request
4. Execute one batch request
5. Confirm analytics and history are updating

## Operational Notes

- Batch processing currently executes in request lifecycle; large payloads may require queue workers for reliability and latency control.
- `next.config.mjs` currently ignores TypeScript build errors; treat this as a temporary setting and enforce TS checks in CI.

## Suggested CI Steps

1. install
2. lint
3. build
4. prisma migrate deploy (release step)

## Rollback Plan

1. Revert app deployment to previous healthy version
2. If DB migration introduced incompatible changes, apply a tested rollback migration or restore backup
3. Re-run smoke checks

## Disaster Recovery

### Backup Plan

1. Daily automated database backups
2. Code backup in GitHub
3. Configuration backup
4. Test restores quarterly

### Recovery Procedure

1. Provision new database
2. Restore from latest backup
3. Deploy new instance
4. Verify functionality
5. Switch DNS/domain

## Security Checklist

- [ ] HTTPS enforced
- [ ] Secrets not in code
- [ ] Database connection secured
- [ ] API keys rotated
- [ ] SQL injection protected (Prisma)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak info
- [ ] Logging doesn't log sensitive data

## Next Steps

1. Choose hosting platform
2. Set up database
3. Configure environment variables
4. Deploy
5. Monitor and optimize
6. Set up CI/CD pipeline
7. Regular maintenance

For questions, see [SETUP.md](./SETUP.md) or [README.md](./README.md).
