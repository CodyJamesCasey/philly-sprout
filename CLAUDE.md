# CLAUDE.md

## Project Overview

Philly Sprout is a Next.js PWA that helps Philadelphia residents identify and submit viable street tree planting sites for the PHS TreeVitalize/Tree Tenders program. It uses Claude Vision API to pre-screen sites against eligibility criteria.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19, TypeScript 5.9 (strict)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (new-york style) + Radix UI
- **Auth/DB:** Supabase (Postgres) with @supabase/ssr for cookie-based sessions
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514) for vision analysis
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Project Structure

```
app/                    # Next.js App Router pages
  auth/                 # Login, sign-up, password flows
  (authenticated)/      # Session-protected routes (dashboard, submissions, map)
components/             # React components
  ui/                   # shadcn/ui primitives
  tutorial/             # Tutorial/educational components
lib/                    # Utilities
  supabase/             # Supabase client (server.ts, client.ts, proxy.ts, admin.ts)
  utils.ts              # cn() helper for Tailwind class merging
proxy.ts                # Middleware entry point (session refresh)
```

## Key Conventions

- **File naming:** lowercase-hyphenated (`submission-form.tsx`, `auth-button.tsx`)
- **Pages:** `page.tsx`, layouts: `layout.tsx`, route handlers: `route.ts`, server actions: `actions.ts`
- **Components:** PascalCase exports, `"use client"` directive only when needed
- **Imports:** Use `@/` path alias for all imports
- **Styling:** Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- **Forms:** `useActionState` + Server Actions pattern
- **Auth:** Server-side via `createClient()` from `@/lib/supabase/server`; middleware refreshes sessions

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## Database

Primary table: `tree_candidates` — stores submissions with GPS coords, photo URLs, site criteria (pass/fail/unclear enums), owner info, attestations, AI metadata, and submission status.

Secondary table: `tree_health_reports` — post-planting health tracking.

Roles table: `profiles` — one row per user (auto-created via trigger on sign-up). Contains `is_admin` boolean (default `false`). Admins (PHS staff) can delete any submission; regular users can only delete their own. Admin check helper: `isAdmin()` from `@/lib/supabase/admin`.

## Important Notes

- README.md is the authoritative project specification — read it before making architectural decisions
- Site criteria fields map directly to the official PHS TreeVitalize application PDF
- AI assessments are optional; uncertain results return "unclear" and the user always confirms
- Mobile-first design — camera and GPS APIs degrade gracefully
