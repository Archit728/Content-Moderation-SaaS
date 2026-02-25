# ContentGuard Documentation Index

Welcome to ContentGuard! Here's a guide to help you navigate the documentation.

## Quick Navigation

### I want to...

**Get started immediately** → [QUICKSTART.md](./QUICKSTART.md) (5 minutes)

**Set up locally** → [SETUP.md](./SETUP.md) (detailed setup guide)

**Understand the project** → [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

**Deploy to production** → [DEPLOYMENT.md](./DEPLOYMENT.md)

**Learn about the code** → [README.md](./README.md)

---

## Documentation Files

### 1. [QUICKSTART.md](./QUICKSTART.md)

**Start here!** Get up and running in 5 minutes.

- Installation (1 min)
- Environment setup (2 min)
- Database setup (1 min)
- Start dev server (1 min)
- Try features

**Best for:** First-time users who want immediate results

### 2. [SETUP.md](./SETUP.md)

Comprehensive setup guide with multiple options.

- Prerequisites
- 3 database setup options (local, Neon, Docker)
- Environment configuration
- Migration and seeding
- Feature usage guide
- Troubleshooting
- Project structure

**Best for:** Detailed setup, troubleshooting, understanding architecture

### 3. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

High-level overview of what was built.

- Feature list
- Tech stack
- Project structure
- API endpoints
- Database models
- Demo accounts

**Best for:** Understanding at a glance, project overview

### 4. [README.md](./README.md)

Full technical documentation.

- Features
- Tech stack
- Development commands
- Database schema
- API documentation
- Configuration
- Performance tips
- Contributing guidelines

**Best for:** Developers, technical reference, full documentation

### 5. [DEPLOYMENT.md](./DEPLOYMENT.md)

Production deployment guide.

- Deployment options (Vercel, Docker, etc.)
- Database setup for production
- Pre-deployment checklist
- Post-deployment verification
- Scaling strategies
- CI/CD setup
- Monitoring
- Security checklist

**Best for:** Deploying to production, DevOps

### 6. [BUILD_SUMMARY.md](./BUILD_SUMMARY.md) _Detailed overview_

Everything that was implemented.

- Features
- Architecture
- Tech stack
- File organization
- API examples
- Real user handling
- Design decisions

**Best for:** Code review, architecture understanding

---

## Feature Guides

### Using the Dashboard

**Single Text Moderation**

1. Go to Dashboard → Single Text
2. Paste content (max 5,000 chars)
3. Click "Analyze Content"
4. View toxicity scores

**Batch CSV Processing**

1. Go to Dashboard → Batch CSV
2. Prepare CSV with text in first column
3. Drag & drop or select file
4. Maximum 1,000 rows
5. View results instantly

**Analytics**

1. Go to Dashboard → Analytics
2. View 30-day trends
3. See category distribution
4. Check KPI cards

**API Access**

1. Go to Dashboard → API Access
2. Copy your API key
3. Use provided code examples
4. Check rate limits

**Settings**

1. Go to Dashboard → Settings
2. Adjust threshold sliders (0-100%)
3. Click "Save Changes"
4. Changes apply immediately

### Admin Features

1. Go to Admin panel (top nav, requires ADMIN role)
2. View platform-wide statistics
3. See all users and their activity
4. Monitor batch job success
5. Check system health

---

## Common Tasks

### Task: Run locally

→ Follow [QUICKSTART.md](./QUICKSTART.md) (5 minutes)

### Task: Add a new API endpoint

→ Check `app/api/` examples in [README.md](./README.md)

### Task: Customize colors

→ Edit `app/globals.css` CSS variables

### Task: Deploy to production

→ Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

### Task: Fix database issues

→ See troubleshooting in [SETUP.md](./SETUP.md)

### Task: Understand API

→ See API endpoints in [README.md](./README.md)

### Task: Scale for more users

→ See scaling section in [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Demo Credentials

All documentation uses these demo accounts:

**User Account:**

- Email: demo@example.com
- Password: demo@1234

**Admin Account:**

- Email: admin@example.com
- Password: demo@1234

These are created automatically when you run `pnpm db:setup`

---

## File Structure Reference

```
Root Files:
├── QUICKSTART.md           ← Start here! (5 min)
├── SETUP.md                ← Detailed setup
├── README.md               ← Full documentation
├── DEPLOYMENT.md           ← Production guide
├── PROJECT_OVERVIEW.md     ← At-a-glance overview
└── DOCS_INDEX.md           ← This file

Source Code:
├── app/                    ← Pages and API routes
├── components/             ← UI components
├── lib/                    ← Utilities
├── prisma/                 ← Database
└── middleware.ts           ← Route protection

Config Files:
├── .env.example            ← Copy to .env.local
├── package.json            ← Dependencies
├── tsconfig.json           ← TypeScript config
└── tailwind.config.ts      ← Tailwind config
```

---

## Technology Overview

| Area           | Technology                         |
| -------------- | ---------------------------------- |
| **UI**         | Next.js 16, React 19, Tailwind CSS |
| **Components** | shadcn/ui, Lucide icons            |
| **Database**   | PostgreSQL, Prisma                 |
| **Auth**       | NextAuth.js                        |
| **Validation** | Zod                                |
| **Charts**     | Recharts                           |
| **Language**   | TypeScript                         |

Learn more in [README.md](./README.md)

---

## Common Questions

**Q: How do I run this locally?**
A: See [QUICKSTART.md](./QUICKSTART.md)

**Q: What database do I need?**
A: PostgreSQL (local, Docker, or cloud). See [SETUP.md](./SETUP.md)

**Q: How do I deploy?**
A: See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Q: What are the demo credentials?**
A: demo@example.com / demo@1234 (see above)

**Q: Can I modify the AI model?**
A: Yes, replace mock logic in `lib/moderation.ts`

**Q: How do I change colors?**
A: Edit `app/globals.css` CSS variables

**Q: What's the rate limit?**
A: Infrastructure ready, adjust in API routes

**Q: Can I add more users?**
A: Yes, create accounts via signup page

---

## Learning Path

1. **First Time?**

   - Start: [QUICKSTART.md](./QUICKSTART.md)
   - Time: 5 minutes
   - Result: App running locally

2. **Understanding More?**

   - Read: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
   - Read: [README.md](./README.md)
   - Time: 20 minutes
   - Result: Full understanding

3. **Going to Production?**

   - Read: [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Follow deployment steps
   - Time: 30 minutes + deployment time
   - Result: Live application

4. **Deep Dive?**
   - Read: [SETUP.md](./SETUP.md) for architecture
   - Explore `app/api/` routes
   - Explore `components/` code
   - Time: 1-2 hours
   - Result: Developer expertise

---

## Troubleshooting

**Issue:** Can't connect to database
**Solution:** See "Database Issues" in [SETUP.md](./SETUP.md)

**Issue:** Port already in use
**Solution:** See "Common Issues" in [SETUP.md](./SETUP.md)

**Issue:** Build fails
**Solution:** See troubleshooting in [DEPLOYMENT.md](./DEPLOYMENT.md)

**Issue:** Missing dependencies
**Solution:** Run `pnpm install` and check [README.md](./README.md)

More help in respective documentation files.

---

## Next Steps

1. **Open** [QUICKSTART.md](./QUICKSTART.md)
2. **Follow** the 5-minute setup
3. **Explore** the dashboard
4. **Experiment** with features
5. **Read** [README.md](./README.md) for deeper understanding
6. **Deploy** when ready using [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Support Resources

- **Setup Issues** → [SETUP.md](./SETUP.md)
- **Technical Details** → [README.md](./README.md)
- **Deployment** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Code Examples** → `app/api/` directory
- **Component Examples** → `components/` directory

---

**Ready to start?** → Go to [QUICKSTART.md](./QUICKSTART.md)

Good luck! 🚀
