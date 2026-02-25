# ContentGuard - Quick Start Guide

Get up and running in 5 minutes.

## 1. Install Dependencies (1 minute)

```bash
pnpm install
# or: npm install
```

## 2. Setup Environment (2 minutes)

```bash
cp .env.example .env.local

```

NOTE- use .env file as Primsa takes its variables from .env so create that instead

Edit `.env.local` or `.env`:

```env
# Use a local PostgreSQL instance or Neon
DATABASE_URL=postgresql://user:password@localhost:5432/contentguard

# Generate with: openssl rand -base64 32 or node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your_secret_here

NEXTAUTH_URL=http://localhost:3000
```

## 3. Database Setup (1 minute)

```bash
# Run migrations and seed with demo data
pnpm db:setup
```

## 4. Start Development (1 minute)

```bash
pnpm dev
```

Visit: http://localhost:3000

## Demo Credentials

```
Email:    demo@example.com
Password: demo@1234
```

---

## First Steps in the App

### 1. Try Single Text Moderation

- Go to **Dashboard → Single Text**
- Paste any text
- Click "Analyze Content"
- See toxicity scores and flagged status

### 2. Upload a CSV for Batch Processing

- Go to **Dashboard → Batch CSV**
- Create a test.csv:
  ```csv
  text
  Great product!
  I hate this
  Amazing service
  ```
- Drag and drop the file
- See results immediately

### 3. Check Your Analytics

- Go to **Dashboard → Analytics**
- View trends over 30 days
- See category distribution
- Check platform statistics

### 4. Copy Your API Key

- Go to **Dashboard → API Access**
- Copy your API key
- Use provided examples to integrate

### 5. Adjust Detection Settings

- Go to **Dashboard → Settings**
- Slide thresholds to adjust sensitivity
- Changes apply instantly to new analyses

---

## API Quick Test

```bash
# Test the moderation API
curl -X POST http://localhost:3000/api/moderate \
  -H "Content-Type: application/json" \
  -d '{"text": "This is great!"}'
```

Response:

```json
{
  "probabilities": {
    "toxic": 0.02,
    "severe_toxic": 0.01,
    ...
  },
  "flagged": false,
  "maxLabel": "toxic",
  "maxScore": 0.02
}
```

---

## Common Issues & Fixes

### ❌ "Cannot connect to database"

**Fix:** Check DATABASE_URL in .env.local and ensure PostgreSQL is running

### ❌ "NEXTAUTH_SECRET not set"

**Fix:** Generate: `openssl rand -base64 32` and add to .env.local

### ❌ "Port 3000 already in use"

**Fix:** Use different port: `PORT=3001 pnpm dev`

### ❌ "No data after seed"

**Fix:** Check seed succeeded: `pnpm prisma:seed`

---

## Database Cheatsheet

```bash
# View all data
pnpm prisma studio

# Reset everything (careful!)
pnpm prisma migrate reset

# See what's in database
pnpm prisma db push

# Generate types
pnpm prisma generate
```

---

## File Structure Essentials

```
Key files to know:

app/page.tsx              ← Landing page
app/dashboard/page.tsx    ← Main dashboard
app/admin/page.tsx        ← Admin panel
app/api/moderate/         ← Moderation API
lib/moderation.ts         ← Core logic
prisma/schema.prisma      ← Database schema
```

---

## Next Steps

1. **Customize Thresholds** - Go to Settings and adjust for your use case
2. **Integrate API** - Use examples in API Access to add to your app
3. **Deploy** - Push to GitHub and deploy on Vercel
4. **Check Logs** - View detailed logs in Analytics tab

---

## Help & Documentation

- **Setup Issues?** → Read [SETUP.md](./SETUP.md)
- **Full Docs?** → Read [README.md](./README.md)
- **API Help?** → See Dashboard → API Access examples
- **Database Questions?** → Visit [prisma.io/docs](https://www.prisma.io/docs)

---

## Performance Tips

- Batch process files instead of individual texts when possible
- Adjust thresholds to reduce false positives
- Review analytics regularly to find patterns
- Use the admin panel to monitor all users

---

## What This Platform Does

✅ Analyzes text for toxicity, threats, insults, etc.
✅ Shows confidence scores for each category
✅ Tracks trends over time
✅ Handles batch uploads for bulk analysis
✅ Provides REST API for integration
✅ Stores all data securely in PostgreSQL

---

**Ready? Start with:** `pnpm dev` and visit http://localhost:3000

Good luck! 🚀
