# ContentGuard - Enterprise Content Moderation SaaS

A production-grade AI-powered content moderation platform built with Next.js 16, React 19, and Prisma. Detect and manage toxic content in real-time with advanced analytics and customizable thresholds.

## Features

- **Real-Time AI Detection**: Multi-label toxicity detection using BERT-based models
- **Single & Batch Processing**: Analyze individual texts or bulk-process CSVs (up to 1,000 items)
- **Advanced Analytics**: 30-day trends, category distribution, and detailed insights
- **Custom Thresholds**: Fine-tune sensitivity for each toxicity category
- **API Access**: Full REST API with rate limiting and comprehensive documentation
- **Admin Dashboard**: Platform-wide statistics and user management
- **Dark/Light Theme**: Fully responsive design with theme switcher
- **Authentication**: Secure NextAuth-powered auth with role-based access
- **Beautiful UI**: Modern design inspired by Vercel/Linear

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions
- **Charts**: Recharts for data visualization
- **Validation**: Zod for type-safe validation
- **UI Library**: Radix UI primitives
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# Run migrations and seed database
pnpm db:setup

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo Credentials:**

- Email: `demo@example.com`
- Password: `demo@1234`

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Project Structure

```
app/
├── api/                    # API routes
├── auth/                   # Authentication pages
├── dashboard/              # User dashboard
├── admin/                  # Admin panel
└── page.tsx                # Landing page

components/
├── ui/                     # shadcn/ui components
├── tabs/                   # Dashboard tabs
├── ModerationCard.tsx      # Result display
├── Navbar.tsx              # Navigation
└── ...

lib/
├── auth.ts                 # Auth utilities
├── moderation.ts           # Moderation logic
├── prisma.ts               # Database client
└── schemas.ts              # Validation schemas

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Database seeding
```

## Key Components

### ModerationCard

Displays moderation results with probability bars for each toxicity category.

### ThresholdSlider

Interactive slider for adjusting toxicity thresholds (0-100%).

### StatCard

Reusable statistics card component for dashboards.

### Dashboard Tabs

- **Single Text**: Analyze individual content
- **Batch CSV**: Process CSV files
- **Analytics**: View trends and insights
- **API Access**: Manage API keys and docs
- **Settings**: Configure thresholds

## API Endpoints

### Moderation

```bash
POST /api/moderate
Content-Type: application/json

{
  "text": "Content to analyze"
}
```

### Batch Processing

```bash
POST /api/moderate-batch
Content-Type: application/json

{
  "texts": ["text1", "text2", ...]
}
```

### Get Thresholds

```bash
GET /api/thresholds
```

### Update Thresholds

```bash
POST /api/thresholds
Content-Type: application/json

{
  "thresholds": {
    "toxic": 0.5,
    "threat": 0.6,
    ...
  }
}
```

### Analytics

```bash
GET /api/analytics
```

## Database Schema

### User

- id (UUID)
- email (unique)
- password (hashed)
- role (USER|ADMIN)
- apiKey
- timestamps

### ModerationLog

- id (UUID)
- userId
- text
- probabilities (JSON)
- flagged (boolean)
- timestamp

### Threshold

- id (UUID)
- userId (nullable for global defaults)
- label
- value (0-1)
- timestamps

### BatchJob

- id (UUID)
- userId
- status (PENDING|PROCESSING|COMPLETED|FAILED)
- fileName
- totalRows / processedRows / flaggedCount
- results (JSON)
- timestamps

## Configuration

### Environment Variables

See `.env.example` for all available options.

**Essential:**

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT secret
- `NEXTAUTH_URL`: Callback URL (http://localhost:3000 for dev)

**Optional:**

- `HF_TOKEN`: HuggingFace API token for real model inference
- `NODE_ENV`: Development or production

## Authentication

Uses NextAuth.js with:

- Email/password provider
- JWT sessions
- Prisma adapter for database storage
- Role-based access control (USER/ADMIN)

Protected routes:

- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires ADMIN role

## Styling & Theme

- **Colors**: Custom design tokens in `globals.css`
- **Dark Mode**: Uses `next-themes` for seamless switching
- **Layout**: Flexbox-first with Tailwind CSS
- **Components**: Pre-built shadcn/ui components

### CSS Variables

All colors defined as CSS custom properties for easy theming:

- `--background`, `--foreground`
- `--primary`, `--accent`, `--destructive`
- `--border`, `--input`, `--ring`
- Per-label chart colors

## Performance Optimizations

- Next.js image optimization
- API route caching
- Database query optimization with Prisma
- Client-side state management with React hooks
- Lazy loading for heavy components
- Debounced inputs

## Accessibility

- Semantic HTML
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader optimized

## Error Handling

- Input validation with Zod
- API error responses with appropriate HTTP codes
- User-friendly error messages via Toast notifications
- Graceful fallbacks for failed requests

## Future Enhancements

- Real HuggingFace API integration
- Advanced filtering and exports in analytics
- Webhook notifications
- Team collaboration features
- Custom model fine-tuning
- Webhook event system
- Usage-based billing
- Custom branding for white-label

## Deployment

### Vercel (Recommended)

```bash
# Automatic deployment from GitHub
# Set environment variables in Vercel dashboard
```

### Docker

See `Dockerfile` in root directory.

### Build for Production

```bash
pnpm build
pnpm start
```

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Database migrations
pnpm prisma:migrate

# Seed database
pnpm prisma:seed

# Run both migrate and seed
pnpm db:setup
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues and questions:

- Check [SETUP.md](./SETUP.md) for detailed setup help
- Review API documentation in dashboard
- Check Next.js and Prisma official docs

## Changelog

### v1.0.0

- Initial release with full feature set
- Production-ready authentication
- Real-time analytics
- Admin panel
- Comprehensive API
