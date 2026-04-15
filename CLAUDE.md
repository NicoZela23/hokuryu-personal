# CLAUDE.md — Hokuryu Platform

This file governs how you operate in this codebase. Read it completely at the start of every session. It takes precedence over all defaults.

---

## What this project is

**Hokuryu** is a multi-user digital garden platform where curiosity is the currency. Users curate content they consume across all media types (books, films, music, articles, videos, podcasts, etc.), share their taste publicly, follow others, collect souvenirs from visited gardens, and earn karma through a gamified harvest loop.

**Core metaphor:** Plant a seed (save content) → Harvest it (consume + rate + review) → earn Karma. Visit other gardens, collect Souvenirs, build your Passport.

**Aesthetic:** Fallout ROBCO terminal — phosphor green on dark vault backgrounds, VT323 display font, Share Tech Mono body, CRT scanlines, Gruvbox-inspired warm palette for readability. Every UI element should feel like a terminal interface from a retro-futuristic vault.

**Reference documents (read in order of authority):**
1. `CLAUDE.md` — operating rules (this file)
2. `PLATFORM_PLAN.md` — full platform specification, schema, API routes, component inventory
3. `PLAN.md` — phase-by-phase task tracker (update after every completed phase)
4. `SPEC.md` — legacy single-user spec (valid only where PLATFORM_PLAN.md is silent)

**Stack:** Next.js 14 App Router · Supabase (Auth + Postgres + Storage + Realtime) · Drizzle ORM · TanStack Query v5 · Tailwind CSS · Framer Motion · Vercel · Sentry

---

## Operating rules

### Before writing any code
1. Read `PLAN.md` — check current phase status and which tasks are next.
2. Never skip phases. Phase N must be complete and verified before Phase N+1 starts.
3. Check `git status` and recent commits to understand what is already done.
4. If a task touches schema, re-read `PLATFORM_PLAN.md § 4` (Database Schema) first.
5. If a task touches a new route, re-read `PLATFORM_PLAN.md § 9` (API Routes) first.

### While writing code
- Match file paths exactly to `PLATFORM_PLAN.md § 11` (Component Inventory). No new files without justification.
- Match schema exactly to `PLATFORM_PLAN.md § 4`. No new columns without flagging.
- Match API shapes exactly to `PLATFORM_PLAN.md § 9`. No new routes without flagging.
- Every Tailwind color from `tailwind.config.ts` tokens only. No hardcoded hex in JSX. Ever.
- `'use client'` only when the component needs interactivity or browser APIs. Default to RSC.
- Auth is required on all write operations. All DB queries scoped by authenticated `user_id`.
- RLS policies are the last line of defense — but always scope queries in application code too.

### After completing a phase
1. Mark every completed task in `PLAN.md` with `[x]`.
2. Set the phase status to `✅ COMPLETE` with the completion date.
3. Output the file checklist and stop. Wait for confirmation before next phase.

---

## Design system — Fallout + Gruvbox terminal

This is the single most important UI constraint. Every component must feel like it belongs to a ROBCO Industries terminal.

### Fonts
- `font-display` → VT323 — all headings, labels, badges, buttons, UI chrome
- `font-mono` → Share Tech Mono — all body text, notes, synopses, prose content
- Never use system sans-serif for visible UI text

### Color tokens (from `tailwind.config.ts`)
```
vault       — background hierarchy (vault < panel < card < hover < active)
phosphor    — primary terminal green (bright / DEFAULT / mid / dim / faint)
cream       — readable body text (bright / DEFAULT / mid / dim / faint)
amber       — accent, warnings, recommender attribution
danger      — errors, delete actions
seed-*      — per-sourceType accent colors (youtube, book, film, etc.)
```

**Rule:** UI chrome (labels, borders, buttons) = phosphor. Body content (synopses, notes, bios, prose) = cream. Actions/highlights = amber. Never use phosphor for long-form readable text — that's what cream is for.

### Component aesthetic rules
- Borders: `border-vault-border` always. No rounded corners — everything is sharp/rectangular.
- Buttons: bordered rectangle style, `font-display tracking-widest`. Prefix with terminal symbols (`▸`, `◈`, `◎`, `■`, `◉`, `✕`).
- Section headers: `■ SECTION NAME` pattern, `font-display`, `text-phosphor-dim`, `tracking-widest`.
- Active/selected states: `bg-vault-active` + `text-phosphor-bright` + `.glow` class.
- Empty states: `> NO ENTRIES THIS PERIOD` style, monospace, phosphor-dim.
- Loading states: `◌` prefix + `.animate-blink` on the label.
- Error states: `✗ ERROR MESSAGE` in `text-danger`.
- Cards: `bg-vault-card border border-vault-border border-l-2 border-l-seed-[type]`.
- No drop shadows on cards — use `border-glow` CSS class for emphasis when needed.
- CRT scanlines + vignette controlled by `.crt` class on `<html>` (user toggle, persisted to localStorage).

### Animations
- All variants in `lib/animations.ts`. Never define inline variants.
- Every animated component checks `useReducedMotion()` — skip animation if true.
- `AnimatePresence` wraps every conditionally rendered element.
- No looping animations except: enrichment spinner, cursor blink.

---

## Performance rules — FREE TIER CONSTRAINTS

**Context:** Supabase free tier = 500MB DB, 1GB storage, 2GB bandwidth. Vercel free tier = 100GB bandwidth, 6h function timeout max. Every optimization matters.

### Caching strategy

#### Static pages (no auth required)
- Public profiles (`/@[username]`), public gardens, explore page, leaderboard
- Use Next.js `fetch` with `revalidate` for ISR — **revalidate: 60** seconds minimum
- Never use `force-dynamic` on public pages that can be cached
- Tag caches with `revalidateTag()` so mutations invalidate only relevant pages

```ts
// Public profile page — revalidate every 60s, invalidate on profile update
export const revalidate = 60
// On profile mutation: revalidateTag(`profile-${username}`)
```

#### Dynamic pages (auth required)
- Own garden, feed, notifications, settings
- `export const dynamic = 'force-dynamic'` — these must always be fresh
- Use TanStack Query for client-side caching with `staleTime: 30_000` minimum

#### API routes
- Read-only public routes (`/api/profile/[username]`, `/api/feed/foryou`): set `Cache-Control: s-maxage=30, stale-while-revalidate=60`
- Write routes: `Cache-Control: no-store` always
- LLM enrichment route: `Cache-Control: no-store` (expensive, never cache)

#### TanStack Query stale times
```ts
// Reference stale times by data type
profile:       staleTime: 60_000       // 1 min
feed:          staleTime: 30_000       // 30s
notifications: staleTime: 10_000       // 10s (use Realtime instead where possible)
items:         staleTime: 30_000       // 30s
leaderboard:   staleTime: 300_000      // 5 min
badges:        staleTime: 600_000      // 10 min (rarely change)
```

### Database performance
- Every foreign key column has an index. Define at schema creation time, not later.
- Pagination on ALL list queries — default page size 20, max 50. Never `SELECT *` without `LIMIT`.
- Use Supabase Postgres `count` hint for pagination metadata, not a separate COUNT query.
- Feed queries use cursor-based pagination (by `created_at` + `id`), not offset.
- Avoid N+1: always join or batch. Never query inside a loop.
- Drizzle `select` with explicit column lists — never `.select()` with no args on large tables.

```ts
// BAD — fetches every column, N+1 risk
const items = await db.select().from(items)

// GOOD — explicit columns, paginated
const items = await db
  .select({ id: items.id, title: items.title, sourceType: items.sourceType })
  .from(items)
  .where(eq(items.userId, userId))
  .orderBy(desc(items.createdAt))
  .limit(20)
  .offset(cursor)
```

### Image optimization
- All `<Image>` components from `next/image` — never raw `<img>` for user content.
- Thumbnails from external URLs: use `unoptimized` prop (can't optimize third-party).
- User avatars from Supabase Storage: use `next/image` with `sizes` prop.
- Always set explicit `width`/`height` or `fill` — prevents layout shift (CLS).
- Lazy-load images below the fold with `loading="lazy"` (default for `next/image`).

### Bundle size
- Never import full lodash — use native JS or individual functions.
- Dynamic import heavy components: markdown editor, leaderboard table.
```ts
const MarkdownEditor = dynamic(() => import('@/components/ui/MarkdownEditor'), { ssr: false })
```
- Audit bundle with `@next/bundle-analyzer` before each phase deploy.
- No new UI library installs without checking bundle impact. Prefer custom components.

### Supabase bandwidth conservation
- Never fetch full item rows when only counts or IDs are needed.
- Aggregate counts in DB (karma, streak, badge count) — don't compute client-side from full lists.
- Realtime subscriptions: subscribe only to own notifications channel, unsubscribe on unmount.
- Storage: resize avatars client-side before upload (max 400×400px, WebP preferred).

---

## SEO rules

**Context:** Public profiles and gardens are the main SEO surface. Feed and notifications are auth-gated and not indexed.

### Every public page must have
```tsx
// app/(profile)/[username]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const profile = await getProfile(params.username)
  return {
    title: `${profile.displayName} — Hokuryu`,
    description: profile.bio ? profile.bio.slice(0, 155) : `${profile.username}'s digital garden on Hokuryu`,
    openGraph: {
      title: `${profile.displayName}'s Garden — Hokuryu`,
      description: ...,
      images: [profile.avatarUrl ?? '/og-default.png'],
      type: 'profile',
    },
    twitter: { card: 'summary_large_image', ... },
    alternates: { canonical: `https://hokuryu.app/@${profile.username}` },
  }
}
```

### Rules
- `generateMetadata` on every public page — not optional.
- Root layout sets `metadataBase: new URL('https://hokuryu.app')`.
- Seed detail pages: title = seed title, description = synopsis first 155 chars.
- OG image: use Next.js `og` route (`app/og/route.tsx`) for dynamic OG images — profiles, seeds.
- `robots.txt`: index public pages, noindex auth pages (`/feed`, `/notifications`, `/settings`, `/onboarding`).
- `sitemap.xml`: dynamic sitemap including all public profiles + seeds. Regenerate on ISR schedule.
- Semantic HTML: `<article>` for seeds, `<section>` for garden blocks, `<nav>` for navigation, `<main>` for page content.
- Every page has exactly one `<h1>`. No skipped heading levels.
- All `<a>` tags have descriptive text — no "click here".
- `<Image>` alt text: descriptive for content images, empty string for decorative.

### Structured data
- Profile pages: `Person` schema
- Seed/content pages: `Review` or `CreativeWork` schema based on sourceType
- Use `next-seo` or inline `<script type="application/ld+json">` — no external lib required

---

## Stack rules

### Next.js App Router
- RSC for all initial data fetching — direct Supabase server client calls, no `fetch('/api/...')`.
- `'use client'` components use TanStack Query for mutations and real-time state.
- Route groups: `(auth)` for login/signup, `(app)` for authenticated pages, `(public)` for public pages.
- `middleware.ts` handles auth redirect: unauthenticated → `/login`, authenticated + no onboarding → `/onboarding`.
- `export const dynamic = 'force-dynamic'` only on pages that must never be cached (feed, notifications).

### Supabase
- Browser client: `lib/supabase/client.ts` (singleton, `createBrowserClient`)
- Server client: `lib/supabase/server.ts` (per-request, `createServerClient` with cookies)
- Service role client: `lib/supabase/admin.ts` (server-only, for badge awards and system writes)
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Never.
- Always use the server client in RSC and route handlers — the browser client is for client components only.
- RLS must be enabled on every table. Application-level scoping is secondary, not a replacement.

### TypeScript
- `strict: true`. No exceptions.
- No `any`. Use `unknown` + type guards or define proper types.
- Zod schemas for all API route inputs. Validate before touching DB.
- Types exported from `lib/utils/types.ts` only. No scattered type definitions.

### Drizzle ORM
- All queries through `lib/db/index.ts` singleton.
- No raw SQL outside migration files.
- Schema in `lib/db/schema.ts` only.
- Every new table needs indexes defined in schema, not added manually.

### Tailwind CSS
- Custom tokens only. No hardcoded hex in JSX.
- No `@apply` in CSS files — Tailwind classes in JSX.
- No arbitrary values unless truly unavoidable (document why when used).
- Dark mode is forced always — terminal is always dark. No light mode variants needed.

### TanStack Query v5
- `QueryClient` singleton in `lib/query/client.ts`.
- Query keys from `lib/query/keys.ts` factory.
- Hooks in `lib/query/hooks/` — one file per domain.
- Optimistic updates on all mutations affecting visible UI.
- Always `onError` with rollback on optimistic mutations.
- Respect stale times from the caching strategy table above.

### LLM system
- App must work with zero LLM configuration. Test this always.
- Default: OpenRouter `perplexity/sonar-pro` (live web search).
- Never call `enrichMetadata()` without first checking `getProvider() !== null`.
- Enrich button only renders if `GET /api/llm/status` returns `{ available: true }`.
- LLM errors caught in `lib/llm/enricher.ts` — never propagate to UI.
- Always strip markdown fences before `JSON.parse()`. Extract `{...}` with regex as fallback.

### Scraping system
- OG-tag only: title, author, thumbnail, rawDescription via `got` + `cheerio`.
- `scraper.ts` never throws — always returns `ScrapedMetadata`, even if partially empty.
- No yt-dlp, SearXNG, oembed, file upload. Do not re-introduce.

### Sentry
- Initialize in `instrumentation.ts` (Next.js 14 pattern).
- Capture unhandled errors in route handlers with `Sentry.captureException(err)`.
- Do not log PII (user emails, tokens) to Sentry.
- Use `Sentry.setUser({ id: userId })` after auth — never include email.
- Performance monitoring: `tracesSampleRate: 0.1` (10%) to stay within free tier.

---

## API route conventions

```ts
// Standard shape — authenticated routes:
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse + validate body
  const body = await req.json()
  const result = MySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  // 3. Business logic (DB scoped to user.id)
  try {
    const data = await doSomething(result.data, user.id)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[route-name] action failed:', err)
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Component conventions

### Naming
- Components: PascalCase, named export, same name as file.
- Hooks: camelCase prefixed with `use`.
- Utilities: camelCase, named exports.
- Types: PascalCase in `lib/utils/types.ts`.

### File structure
```tsx
// 1. imports — React, next, lib, components, types
// 2. local type definitions (if any)
// 3. component function
// 4. named export at bottom
```

### Server vs client
```
onClick / onChange / event handlers?  → 'use client'
useState / useEffect?                 → 'use client'
TanStack Query hooks?                 → 'use client'
Framer Motion motion.*?               → 'use client'
Supabase Realtime subscription?       → 'use client'
Only renders data from props/server?  → server component
```

### Error handling
- Wrap page-level client trees in error boundaries.
- Never crash on missing thumbnail, synopsis, bio, avatar — always fallback UI.
- Empty avatar → initials component. Missing thumbnail → `[NO IMAGE DATA]` terminal placeholder.

### Accessibility
- All interactive elements: `focus:outline-none focus-visible:outline focus-visible:outline-phosphor`
- All images: `alt` attribute (empty string if decorative, descriptive if content)
- Semantic HTML: `<button>` actions, `<a>` navigation, `<nav>`, `<main>`, `<article>`, `<section>`
- No `div` with `onClick`

---

## Git conventions

- Commits: imperative mood, lowercase, no period. `add profile page`, `fix streak reset logic`
- One logical change per commit. Never bundle unrelated changes.
- Never commit: `.env.local`, `*.db`, `data/uploads/`, `.next/`, `node_modules/`
- Branch naming: `v1/supabase-migration`, `v2/profiles`, `v3/social` — one branch per version

---

## How to run

```bash
# Development
cp .env.example .env.local
npm install
npm run db:migrate
npm run dev

# Database
npm run db:migrate     # run pending migrations
npm run db:generate    # generate migration from schema changes
npm run db:studio      # Drizzle Studio (DB browser)

# Build check
npm run build          # must pass before marking any phase complete
npm run lint           # must pass before marking any phase complete
```

---

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never expose to client

# Database (Supabase Postgres connection string)
DATABASE_URL=

# LLM
OPENROUTER_API_KEY=
OPENROUTER_MODEL=perplexity/sonar-pro

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://hokuryu.app
```

---

## Common mistakes to avoid

| Mistake | Correct approach |
|---|---|
| `fetch('/api/...')` in RSC | Call DB/Supabase directly in server component |
| Inline animation variants | Import from `lib/animations.ts` |
| `any` type | `unknown` + type guard, or proper type in `types.ts` |
| Hardcoded hex in JSX | Tailwind token from `tailwind.config.ts` |
| `force-dynamic` on cacheable public pages | Use `revalidate = 60` + `revalidateTag()` |
| `SELECT *` without LIMIT | Always paginate. Always explicit columns on large tables. |
| N+1 queries | Join or batch. Never query inside a map/loop. |
| Raw `<img>` for user content | Always `next/image` |
| Supabase service role key in client code | Server-only. Use anon key on client. |
| Skip RLS policy on a new table | Every table needs RLS from day one |
| Missing `generateMetadata` on public page | Required on every public-facing page |
| Auth check missing on write route | Every POST/PATCH/DELETE needs `supabase.auth.getUser()` check |
| LLM call without provider check | `getProvider() !== null` first |
| Parsing LLM JSON without stripping fences | Strip fences, then regex-extract `{...}` as fallback |
| Throwing from `scraper.ts` / `enricher.ts` | Catch internally, return null/empty |
| Forgetting `useReducedMotion()` | Every Framer Motion component needs this check |
| `getServerSideProps` or `getStaticProps` | App Router only — async RSC with direct DB call |
| Skipping `npm run build` after phase | Build must pass before any phase is marked complete |

---

## When unsure

1. Check `PLATFORM_PLAN.md` — the answer is probably there.
2. Check `PLAN.md` — verify which phase you are in and what the exact task scope is.
3. If spec is silent, state assumption explicitly before implementing.
4. If two documents conflict, flag it — never resolve silently.
5. Performance tradeoff? Default to caching more aggressively. Free tier constraints are real.

---

*This file is law. PLATFORM_PLAN.md is the constitution. PLAN.md is the task board. When they conflict, flag it.*
