# HealMate — Claude Code Instructions

## Project Overview

HealMate is a full-stack mental health therapy marketplace built as a Turborepo monorepo.

- `apps/api` — Express + TypeScript backend
- `apps/web` — Next.js 14 (App Router) + TypeScript frontend
- `packages/shared` — Shared TypeScript types and constants

## Development Commands

```bash
pnpm dev          # start all dev servers (web on :3000, api on :3001)
pnpm build        # build all packages
pnpm lint         # lint all packages
pnpm check-types  # TypeScript type check all packages
pnpm db:generate  # generate Drizzle migration files from schema
pnpm db:migrate   # apply pending migrations to PostgreSQL
pnpm db:seed      # seed database with demo data
```

## Architecture

### API Routes

All routes are at `/api/v1/`. Route files in `apps/api/src/routes/` are thin — they handle HTTP layer only. Business logic lives in `apps/api/src/services/`.

Auth middleware (`authenticate`) is imported from `apps/api/src/middleware/auth.ts`. Role middleware (`requireClient`, `requireTherapist`, `requireAdmin`) from `apps/api/src/middleware/role.ts`.

### Frontend Patterns

- Route groups: `(public)` (marketing), `(auth)` (login/signup), `(dashboard)` (client/therapist portals), `(dating)` (connection feature), `admin` (admin panel)
- All API calls go through `apps/web/src/lib/api.ts` (Axios with auto token refresh)
- Auth state in Zustand store: `apps/web/src/store/authStore.ts`
- Socket.io singleton: `apps/web/src/lib/socket.ts`
- Monetary values stored in cents (integers); use `formatCurrency()` from `lib/utils.ts` to display

### Database

Schema is at `apps/api/src/db/schema.ts`. All amounts (session rates, wallet balances, payment amounts) are stored in cents.

When adding a new table, update the schema and run `pnpm db:generate` then `pnpm db:migrate`.

### Environment

See `README.md` for all required environment variables.

## Code Conventions

- TypeScript strict mode throughout
- Zod validation on all API inputs via `validate()` middleware
- Errors thrown as `AppError` subclasses (see `apps/api/src/utils/errors.ts`)
- All API responses use `successResponse()` / `errorResponse()` from `apps/api/src/utils/response.ts`
- CSS via Tailwind custom utilities defined in `apps/web/src/app/globals.css`: `btn-primary`, `btn-outline`, `input-field`, `card`, `section-padding`, `container-max`
- UI components in `apps/web/src/components/ui/` — use these before creating new ones

## Seed Accounts

All seed passwords: `Password123!`

- Admin: admin@healmate.app
- Therapists: therapist1@example.com through therapist10@example.com  
- Clients: client1@example.com through client5@example.com
