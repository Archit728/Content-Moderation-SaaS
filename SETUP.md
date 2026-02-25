# ContentGuard SaaS - Local Setup Guide

A production-grade AI-powered content moderation SaaS platform with real-time toxicity detection and comprehensive analytics.

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm installed
- PostgreSQL database (local or remote)
- Git (optional)

### Installation Steps

#### 1. Clone & Install Dependencies

```bash
# If you have this as a repository
git clone <repository-url>
cd moderation-saas

# Install dependencies
pnpm install
# or
npm install
```

#### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

**Required environment variables:**

```env
# Database Connection String (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/contentguard

# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: HuggingFace API Token (for real model inference)
HF_TOKEN=your_huggingface_token_here
```

**Generating NEXTAUTH_SECRET:**

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) | Out-String
```

#### 3. PostgreSQL Database Setup

**Option A: Local PostgreSQL**

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@15

# Create database
createdb contentguard

# Update DATABASE_URL in .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/contentguard
```

**Option B: Use Neon (Cloud PostgreSQL)**

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in `.env.local`

**Option C: Docker PostgreSQL**

```bash
# Run PostgreSQL in Docker
docker run --name contentguard-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=contentguard \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/contentguard
```

#### 4. Database Migration & Seeding

```bash
# Run Prisma migrations
pnpm prisma:migrate
# or
npm run prisma:migrate

# Seed the database with demo data
pnpm prisma:seed
# or
npm run prisma:seed

# Or run both at once
pnpm db:setup
```

This creates:

- Database schema with all tables
- Demo user: `demo@example.com` / `demo@1234`
- Admin user: `admin@example.com` / `demo@1234`
- Sample moderation logs
- Default toxicity thresholds

#### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

### Demo Credentials

**User Account:**

- Email: `demo@example.com`
- Password: `demo@1234`

**Admin Account:**

- Email: `admin@example.com`
- Password: `demo@1234`

## Features Guide

### Single Text Moderation

1. Go to **Dashboard → Single Text** tab
2. Paste or type content (up to 5,000 characters)
3. Click "Analyze Content"
4. View results with:
   - Overall flagged status
   - Category-specific scores (0-100%)
   - Color-coded severity bars

### Batch CSV Processing

1. Go to **Dashboard → Batch CSV** tab
2. Drag and drop a CSV file or select from file picker
3. CSV format: First column contains text to moderate
4. Maximum: 1,000 rows per file
5. View processing progress and results

**Sample CSV format:**

```csv
text
This is a great product!
I hate this service
You are wonderful
```

### Analytics Dashboard

1. Go to **Dashboard → Analytics** tab
2. View:
   - Total scanned items and flagged count
   - 30-day trend line chart
   - Category distribution bar chart
   - Detailed statistics per label

### API Access

1. Go to **Dashboard → API Access** tab
2. Copy your API key (keep it secret!)
3. View usage limits and rate limits
4. Copy code examples for:
   - cURL requests
   - JavaScript/Node.js
   - Other languages

**Example API Call:**

```bash
curl -X POST http://localhost:3000/api/moderate \
  -H "Content-Type: application/json" \
  -d '{"text": "Your content here"}'
```

### Settings & Thresholds

1. Go to **Dashboard → Settings** tab
2. Adjust toxicity thresholds for each category:
   - 0% = Allow all content
   - 50% = Balanced approach
   - 100% = Block all content
3. Changes apply immediately to all future moderation

### Admin Panel

1. Sign in with admin account
2. Go to **Admin** (visible in top nav for admins)
3. View:
   - Platform-wide statistics
   - All users and their activity
   - System health metrics
   - 30-day activity trends

## Project Structure

```
moderation-saas/
├── app/
│   ├── api/
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── moderate/             # Single text moderation
│   │   ├── moderate-batch/       # Batch processing
│   │   ├── thresholds/           # Threshold management
│   │   ├── analytics/            # Analytics data
│   │   └── admin/                # Admin endpoints
│   ├── auth/                     # Auth pages (signin, signup)
│   ├── dashboard/                # Dashboard page
│   ├── admin/                    # Admin panel
│   ├── layout.tsx                # Root layout with theme
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── tabs/                     # Dashboard tab components
│   ├── ModerationCard.tsx        # Result display
│   ├── ThresholdSlider.tsx       # Threshold controls
│   ├── StatCard.tsx              # Statistics cards
│   └── Navbar.tsx                # Navigation header
├── lib/
│   ├── auth.ts                   # Auth utilities
│   ├── prisma.ts                 # Database client
│   ├── moderation.ts             # Moderation logic
│   ├── schemas.ts                # Zod validation schemas
│   └── utils.ts                  # Utility functions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── middleware.ts                 # Route protection
├── .env.example                  # Environment template
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/signout` - Sign out

### Moderation

- `POST /api/moderate` - Analyze single text
- `POST /api/moderate-batch` - Batch process texts
- `GET /api/thresholds` - Get user thresholds
- `POST /api/thresholds` - Update thresholds

### Analytics

- `GET /api/analytics` - Get user analytics

### Admin

- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Platform statistics

## Troubleshooting

### "Database connection failed"

- Check DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- Verify database name matches

### "NEXTAUTH_SECRET is not set"

- Generate a secret: `openssl rand -base64 32`
- Add to .env.local
- Restart dev server

### "Port 3000 already in use"

```bash
# Use different port
PORT=3001 pnpm dev
```

### "Prisma migrate failed"

```bash
# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Then seed again
pnpm prisma:seed
```

### No data after seeding

- Check seed output: `pnpm prisma:seed`
- Verify database is running
- Check DATABASE_URL is correct

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Create Vercel project connected to repo
3. Add environment variables in Vercel dashboard
4. Vercel automatically deploys on push

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Build for Production

```bash
# Build Next.js application
pnpm build

# Start production server
pnpm start
```

## Performance Tips

- Enable Vercel Caching for API routes
- Use database connection pooling
- Enable output caching for analytics
- Implement rate limiting (already configured)
- Use CDN for static assets

## Security Considerations

- API keys are hashed in database
- Passwords use bcrypt hashing
- NextAuth provides secure sessions
- All data is input-validated
- SQL injection protected via Prisma
- CSRF protection enabled by default

## Support & Documentation

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org
- **shadcn/ui**: https://ui.shadcn.com

## License

This project is provided as-is for educational and commercial use.

## Changelog

### v1.0.0 (Initial Release)

- Single text moderation
- Batch CSV processing
- Advanced analytics
- Custom thresholds
- Admin panel
- Dark/light theme support
- API access management
