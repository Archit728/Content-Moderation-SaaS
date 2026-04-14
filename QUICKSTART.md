# Quick Start

Use this if you just want the app running locally as fast as possible.

## 1. Install dependencies

```bash
npm install
```

## 2. Create environment file

```bash
cp .env.example .env
```

Update `.env` with at least:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
NEXTAUTH_SECRET=replace_with_secure_random_string
NEXTAUTH_URL=http://localhost:3000
```

If you use a pooled Postgres provider, also set `DIRECT_URL`.

## 3. Initialize database

```bash
npm run db:setup
```

This runs migration + seed.

## 4. Start app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

- user: `demo@example.com` / `demo@1234`
- admin: `admin@example.com` / `demo@1234`

## Smoke Test

1. Sign in with demo user
2. Open Dashboard
3. Run one single-text moderation
4. Upload one small CSV in Batch tab
5. Verify Analytics tab shows records

## Next Docs

- [SETUP.md](./SETUP.md)
- [API_REFERENCE.md](./API_REFERENCE.md)
- [WORKFLOWS.md](./WORKFLOWS.md)
