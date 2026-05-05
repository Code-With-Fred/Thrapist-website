# HealMate — Mental Health Therapy Marketplace

A full-stack therapy marketplace connecting clients with licensed therapists. Built with Next.js 14, Express, PostgreSQL, Socket.io, Stripe, and Daily.co.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Express, TypeScript, Drizzle ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Real-time | Socket.io |
| Payments | Stripe (PaymentIntents + Connect) |
| Video | Daily.co |
| Email | Resend |
| Storage | Cloudinary |
| Auth | JWT (access + refresh) + Google OAuth |
| Monorepo | Turborepo |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm 8+

## Quick Start

```bash
# Clone and install
cd healmate
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Generate and run database migrations
pnpm db:generate
pnpm db:migrate

# Seed the database (optional - creates demo data)
pnpm db:seed

# Start development servers
pnpm dev
```

Frontend runs at http://localhost:3000
API runs at http://localhost:4000

## Environment Variables

### API (`apps/api/.env`)

```env
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/healmate

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Daily.co
DAILY_API_KEY=your-daily-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@healmate.app
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
healmate/
├── apps/
│   ├── api/                    # Express backend
│   │   └── src/
│   │       ├── config/         # Environment config
│   │       ├── db/             # Drizzle schema, migrations, seed
│   │       ├── middleware/     # Auth, roles, validation, rate limiting
│   │       ├── routes/         # Express route handlers (18 route files)
│   │       ├── services/       # Business logic (auth, email, payments...)
│   │       └── socket/         # Socket.io chat + notifications
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/            # App Router pages
│           │   ├── (public)/   # Marketing pages + therapist listing
│           │   ├── (auth)/     # Login, signup, password reset
│           │   ├── (dashboard)/# Client + therapist dashboards
│           │   ├── (dating)/   # Dating/connection feature
│           │   ├── admin/      # Admin panel
│           │   └── session/    # Video session pages
│           ├── components/     # Reusable UI components
│           ├── lib/            # API client, utilities, socket
│           └── store/          # Zustand auth store
└── packages/
    └── shared/                 # Shared TypeScript types + constants
```

## API Reference

Base URL: `http://localhost:4000/api/v1`

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/signup | Register new user |
| POST | /auth/login | Login with email/password |
| POST | /auth/logout | Logout (clears refresh token) |
| POST | /auth/refresh | Refresh access token |
| GET | /auth/google | Initiate Google OAuth |
| GET | /auth/google/callback | Google OAuth callback |
| POST | /auth/verify-email | Verify email with token |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset with token |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | /users/me | Get current user |
| PUT | /users/me | Update profile |
| PUT | /users/me/password | Change password |
| DELETE | /users/me | Delete account |

### Therapists
| Method | Path | Description |
|--------|------|-------------|
| GET | /therapists | List therapists (with filters) |
| GET | /therapists/:id | Get therapist profile |
| GET | /therapists/:id/availability | Get available slots |
| GET | /therapists/:id/reviews | Get reviews |
| PUT | /therapists/me | Update own profile |
| PUT | /therapists/me/availability | Set availability |

### Bookings
| Method | Path | Description |
|--------|------|-------------|
| POST | /bookings | Create booking |
| GET | /bookings | List user bookings |
| GET | /bookings/:id | Get booking details |
| PUT | /bookings/:id/cancel | Cancel booking |
| PUT | /bookings/:id/confirm | Confirm (therapist) |

### Payments
| Method | Path | Description |
|--------|------|-------------|
| POST | /payments/intent | Create payment intent |
| POST | /payments/webhook | Stripe webhook |
| GET | /payments | List payments |

### Wallet
| Method | Path | Description |
|--------|------|-------------|
| GET | /wallet | Get wallet + balance |
| POST | /wallet/topup | Top up wallet |
| POST | /wallet/redeem-gift-card | Redeem gift card |
| GET | /wallet/transactions | Transaction history |

### Messages
| Method | Path | Description |
|--------|------|-------------|
| GET | /conversations | List conversations |
| POST | /conversations | Create conversation |
| GET | /conversations/:id/messages | Get messages |
| POST | /conversations/:id/messages | Send message |

### Dating
| Method | Path | Description |
|--------|------|-------------|
| GET | /dating/profile | Get own dating profile |
| POST | /dating/profile | Create dating profile |
| PUT | /dating/profile | Update dating profile |
| GET | /dating/browse | Browse potential matches |
| POST | /dating/like/:userId | Like a user |
| DELETE | /dating/profile | Delete dating profile |

## Database Schema

19 tables: `users`, `client_profiles`, `therapist_profiles`, `therapist_availability`, `bookings`, `payments`, `wallets`, `wallet_transactions`, `gift_cards`, `reviews`, `dating_profiles`, `dating_likes`, `dating_matches`, `conversations`, `messages`, `notifications`, `assessments`, `blog_posts`

Generate and run migrations:
```bash
pnpm db:generate   # generates SQL from schema
pnpm db:migrate    # applies migrations
pnpm db:seed       # populates demo data
```

### Seed Data (Password: `Password123!`)
- 2 admin accounts
- 10 therapists (all approved, ratings 4.6–4.93)
- 5 client accounts
- 20 sample bookings
- 8 reviews
- 5 dating profiles

## Real-time Features

Socket.io events:

| Event | Direction | Description |
|-------|-----------|-------------|
| join_conversation | Client → Server | Join a chat room |
| send_message | Client → Server | Send a message |
| new_message | Server → Client | Receive a message |
| typing_start | Client → Server | Typing indicator |
| typing_stop | Client → Server | Typing indicator |
| mark_read | Client → Server | Mark messages as read |
| messages_read | Server → Client | Confirm read status |
| new_notification | Server → Client | Push notification |

Authentication: pass JWT in `socket.handshake.auth.token`.

## Stripe Setup

1. Create a Stripe account at stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Set up webhook endpoint (local: use Stripe CLI)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:4000/api/v1/payments/webhook
```

Handled webhook events:
- `payment_intent.succeeded` → confirms booking, updates wallet
- `payment_intent.payment_failed` → marks payment failed
- `account.updated` → updates therapist Stripe Connect status

## Stripe Connect (Therapist Payouts)

Therapists onboard via Stripe Connect (Express accounts). Platform takes 15% fee; therapists receive 85%. Payouts trigger automatically when a session is completed.

## Video Sessions (Daily.co)

1. Create account at daily.co
2. Get API key from dashboard
3. Rooms are created automatically when a booking is confirmed
4. Rooms expire 1 hour after the scheduled session end time

## Email Templates (Resend)

Configure a sending domain in Resend dashboard. Templates included:
- Welcome email
- Email verification
- Password reset
- Booking confirmation (sent to both client and therapist)
- Session reminders (24h and 1h before, via cron)
- Booking cancellation
- New match notification (dating)
- Gift card delivery
- Wallet top-up confirmation

## Deployment

### API (Railway / Render / Fly.io)

```bash
pnpm build --filter=api
# Set all production environment variables
# Start: node apps/api/dist/index.js
```

### Web (Vercel)

```bash
# Connect GitHub repo to Vercel
# Set NEXT_PUBLIC_API_URL to your production API URL
# Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Database

Use managed PostgreSQL (Supabase, Railway, Neon, RDS). Run migrations:
```bash
DATABASE_URL=<production-url> pnpm db:migrate
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm check-types` | TypeScript type check |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed demo data |

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens expire in 15 minutes
- Refresh tokens stored in Redis, expire in 7 days
- httpOnly cookies for refresh tokens
- Rate limiting: 100 req/15min global, 5 req/15min on auth routes
- Helmet.js security headers
- CORS restricted to configured frontend URL
- SQL injection prevented by Drizzle ORM parameterized queries
- XSS prevented by React's default escaping + Zod input validation

## License

MIT
