# Deployment Guide

## Local Development

See [QUICKSTART.md](./QUICKSTART.md) for immediate setup.

## Deployment Options

### 1. Vercel (Recommended)

**Easiest option with zero-config database.**

#### Steps:

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import your GitHub repo
4. Vercel detects Next.js automatically
5. Add environment variables:
   - `DATABASE_URL`: Use Neon or another provider
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Vercel domain
6. Click Deploy

**Benefits:**

- Automatic deployments on push
- Free tier available
- No server management
- Global CDN included

#### Database for Vercel:

```bash
# Use Neon PostgreSQL (free tier available)
1. Go to neon.tech
2. Create new project
3. Copy connection string
4. Add as DATABASE_URL in Vercel dashboard
```

### 2. Docker

**For any hosting platform.**

#### Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build Next.js
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

#### Build & Run:

```bash
docker build -t contentguard .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e NEXTAUTH_SECRET=... \
  -e NEXTAUTH_URL=https://yourapp.com \
  contentguard
```

### 3. Cloud Platforms

#### Railway

```bash
# Connect GitHub repo to Railway
# Add PostgreSQL add-on
# Set environment variables
# Deploy on push
```

#### Render

```bash
# Connect GitHub repo
# Add PostgreSQL database
# Set environment variables
# Deploy
```

#### DigitalOcean App Platform

```bash
# Connect GitHub repo
# Configure as Node app
# Add PostgreSQL database
# Set environment variables
```

## Database Setup for Production

### Option A: Neon (Easiest)

```
1. Sign up at neon.tech
2. Create project
3. Get connection string
4. Add to DATABASE_URL
```

### Option B: AWS RDS

```
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Get connection string
4. Add to DATABASE_URL
```

### Option C: Supabase

```
1. Create account at supabase.com
2. Create new project
3. Get PostgreSQL connection string
4. Add to DATABASE_URL
```

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data loaded (for demo)
- [ ] Next.js build succeeds: `pnpm build`
- [ ] No console errors in production build
- [ ] All API endpoints tested
- [ ] Dark/light theme working
- [ ] Mobile responsive verified
- [ ] Auth flow tested

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=https://your-app.com

# Optional
HF_TOKEN=your_huggingface_token
NODE_ENV=production
```

## Running Migrations in Production

```bash
# Run before first deployment
pnpm prisma migrate deploy

# Never use in production:
# pnpm prisma migrate dev
# pnpm prisma migrate reset
```

## Post-Deployment

### Verify Deployment

```bash
# Test API endpoints
curl https://your-app.com/api/moderate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text": "Test content"}'

# Check health
curl https://your-app.com
```

### Enable Monitoring

1. Set up error tracking (Sentry, LogRocket)
2. Enable analytics
3. Set up uptime monitoring
4. Configure email notifications

### Security Hardening

```bash
# Enable security headers in next.config.mjs
# Use HTTPS only
# Rotate NEXTAUTH_SECRET regularly
# Enable rate limiting
```

## Scaling for Production

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_moderation_user_id ON "ModerationLog"("userId");
CREATE INDEX idx_moderation_created ON "ModerationLog"("createdAt");
CREATE INDEX idx_batch_status ON "BatchJob"("status");
```

### Caching Strategy

- Cache API responses (30 minutes)
- Cache analytics (1 hour)
- CDN for static assets
- Redis for session store (optional)

### Rate Limiting

Implement in API routes:

```typescript
const rateLimit = new RateLimiter({
  points: 100,
  duration: 60, // per minute
});
```

## Troubleshooting Deployment

### Issue: "Cannot connect to database"

**Solution:**

- Verify DATABASE_URL is correct
- Check database is running/accessible
- Verify security groups allow connection
- Test connection string locally first

### Issue: "NEXTAUTH_SECRET not set"

**Solution:**

- Generate: `openssl rand -base64 32`
- Add to environment variables
- Restart application

### Issue: "Build failing"

**Solution:**

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build

# Check for TypeScript errors
pnpm tsc --noEmit
```

### Issue: "Database migrations failed"

**Solution:**

```bash
# Check migration status
pnpm prisma migrate status

# If stuck, reset dev db (NOT production!)
pnpm prisma migrate reset
```

## CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint

      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Monitoring & Logging

### Essential Metrics

- Request latency
- Error rate
- Database connection pool
- Batch job success rate
- User signups
- API usage

### Recommended Tools

- Vercel Analytics (included)
- Sentry for error tracking
- LogRocket for debugging
- DataDog for infrastructure
- New Relic for APM

## Backup Strategy

```bash
# Backup PostgreSQL
pg_dump postgresql://... > backup.sql

# Restore from backup
psql postgresql://... < backup.sql

# Automated backups
# Configure in database provider dashboard
```

## Maintenance

### Regular Tasks

- Monitor error rates
- Review slow queries
- Clean old batch jobs
- Rotate secrets quarterly
- Update dependencies monthly
- Review access logs

### Database Maintenance

```sql
-- Run monthly
VACUUM ANALYZE;

-- Monitor connection pool
SELECT count(*) FROM pg_stat_activity;
```

## Performance Optimization

### Query Optimization

- Add database indexes
- Use pagination for lists
- Cache aggregations
- Optimize Prisma queries

### Frontend Optimization

- Next.js image optimization
- Code splitting enabled
- Minification enabled
- Gzip compression

### API Optimization

- Response caching headers
- Efficient JSON responses
- Database query optimization
- Connection pooling

## Cost Optimization

- **Compute**: Start on free tier, scale as needed
- **Database**: Use Neon free tier ($0-15/month)
- **Storage**: Minimal with Batch processing
- **Bandwidth**: Vercel optimizations reduce usage
- **Total Estimate**: $0-50/month starting

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
