# Stride Running — Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in your credentials
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ELASTICSEARCH_URL` | Elasticsearch URL |
| `NEXT_PUBLIC_APP_URL` | Your domain (e.g. https://stride.run) |

---

## Production Deployment

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```
Set environment variables in Vercel dashboard.

### Option 2: Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t stride-running .
docker run -p 3000:3000 --env-file .env stride-running
```

### Option 3: PM2 (VPS)
```bash
npm run build
npx pm2 start npm --name "stride" -- start
npx pm2 save
npx pm2 startup
```

---

## Stripe Webhook Setup

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. In production, set webhook endpoint to: `https://yourdomain.com/api/stripe/webhook`
5. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`

---

## Database Schema

Run migrations after any schema changes:
```bash
npm run db:migrate
```

View database with Prisma Studio:
```bash
npm run db:studio
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── men/               # Men's category
│   ├── women/             # Women's category
│   ├── trail/             # Trail category
│   ├── apparel/           # Apparel
│   ├── accessories/       # Accessories
│   ├── brands/            # Brands listing
│   ├── best-sellers/      # Best sellers
│   ├── new-arrivals/      # New arrivals
│   ├── sale/              # Sale page
│   ├── blog/              # Blog
│   ├── find-my-shoe/      # Shoe finder
│   ├── checkout/          # Checkout flow
│   ├── account/           # User account
│   ├── support/           # Customer support
│   ├── faq/               # FAQ
│   ├── about/             # About page
│   ├── shipping-returns/  # Shipping & returns
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/
│   ├── layout/            # Header, Footer, Navigation
│   ├── home/              # Homepage sections
│   ├── product/           # Product components
│   ├── cart/              # Cart drawer
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities (prisma, stripe, utils)
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── hooks/                 # Custom hooks
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data
```

---

## Key Features Checklist

- [x] Responsive homepage with hero slider
- [x] Trust indicators
- [x] Featured categories grid
- [x] Best sellers with tab filter
- [x] Shoe finder quiz
- [x] Newsletter signup
- [x] Sticky header with mega menu
- [x] Mobile slide menu
- [x] Search modal
- [x] Cart drawer with upsells
- [x] Product listing with filters & sort
- [x] Product detail page with gallery
- [x] Multi-step checkout
- [x] User account dashboard
- [x] Blog/content pages
- [x] FAQ, About, Support pages
- [x] Admin panel
- [x] Stripe payment integration
- [x] PostgreSQL database schema
- [x] Full API routes
- [x] SEO metadata & schema markup
- [x] TypeScript throughout
- [x] TailwindCSS with custom design system
- [x] Framer Motion ready (package installed)
- [x] Zustand state management
- [x] Wishlist functionality
- [x] Responsive mobile-first design
```
