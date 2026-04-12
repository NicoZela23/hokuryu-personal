# CLAUDE.md — Digi Hokuryu

This file governs how you operate within this codebase. Read it completely at the start of every session. It takes precedence over your defaults.

---

## What this project is

Digi Hokuryu is a personal digital garden — a self-hosted content recommendation tracker. Users drop links or enter content manually, the app scrapes metadata, and optionally enriches it via an LLM. Items live on a growing timeline, organized by month and season. The aesthetic is organic: moss, paper, ink.

Full specification is in `SPEC.md`. Read that file for all design decisions, schema, API shapes, and component inventory. Do not make decisions that contradict SPEC.md without flagging the conflict first.

---

## Your operating rules

### Before writing any code
1. Check which phase of `SPEC.md § BUILD_ORDER` is complete and which is next.
2. Never skip phases. Phase N must compile and run before Phase N+1 begins.
3. If you are resuming a session, ask: "Which phase was last completed?" before proceeding.

### While writing code
- Match file paths exactly to `SPEC.md § FILE_STRUCTURE`. No new files without justification.
- Match schema exactly to `SPEC.md § DATABASE_SCHEMA`. No new columns without flagging.
- Match API shapes exactly to `SPEC.md § API_ROUTES`. No new routes without flagging.
- Use copy strings exactly from `SPEC.md § COPY`. No paraphrasing.
- Every Tailwind color must be defined in `tailwind.config.ts § 3.2`. No hardcoded hex values in components.
- Dark mode on every component. Every color must have a `dark:` variant.
- `'use client'` only when the component requires interactivity or browser APIs. Default to server components.

### After completing a phase
Output a checklist of every file created, like this:
```
✅ PHASE 1 COMPLETE
- tailwind.config.ts
- next.config.ts
- lib/db/schema.ts
...
```
Then stop and wait for confirmation before proceeding to the next phase.

---

## Stack rules

### Next.js App Router
- All data fetching for initial renders: server components, direct DB calls via Drizzle.
- No `fetch('/api/...')` inside server components — query the DB directly.
- `'use client'` components use TanStack Query hooks for mutations and optimistic updates.
- No `getServerSideProps` or `getStaticProps` — those are Pages Router patterns.

### TypeScript
- `strict: true` in `tsconfig.json`. No exceptions.
- No `any`. Use `unknown` with type guards, or define proper types in `lib/utils/types.ts`.
- Zod schemas for all API inputs. Validate before touching the DB.
- Export types from `lib/utils/types.ts`. Do not scatter type definitions across files.

### Drizzle ORM
- All DB queries go through the Drizzle client in `lib/db/index.ts`.
- No raw SQL except inside migration files.
- The client is a singleton — do not instantiate it more than once.
- Schema lives in `lib/db/schema.ts` only.

### Tailwind CSS
- Colors from `tailwind.config.ts` custom tokens only. Never hardcode hex in JSX.
- `darkMode: 'class'` is set. Every component needs `dark:` variants for bg, text, border.
- No `@apply` in CSS files. Use Tailwind classes directly in JSX.
- No arbitrary values (e.g. `w-[347px]`) unless absolutely unavoidable.

### Framer Motion
- All animation variants defined in `lib/animations.ts`. Import from there — do not define inline variants.
- Every animated component checks `useReducedMotion()` and skips animation if true.
- `AnimatePresence` wraps every conditionally rendered component.
- No looping animations except the enrichment spinner.

### TanStack Query v5
- `QueryClient` singleton in `lib/query/client.ts`.
- Query keys from `lib/query/keys.ts` factory. Never write raw key arrays inline.
- Hooks in `lib/query/hooks/`. One file per domain (useItems, useIngest, useTags).
- Optimistic updates on all mutations that change visible UI state.
- Rollback on error — always pass `onError` with context rollback.

### LLM system
- The app must work with zero LLM configuration. Test this assumption frequently.
- Never call `enrichMetadata()` without first checking `getProvider() !== null`.
- Enrich button only renders if `GET /api/llm/status` returns `available: true`.
- LLM errors are caught in `lib/llm/enricher.ts` — they never propagate to the UI.
- Adding a new LLM provider = implement `LLMProvider` interface in `lib/llm/providers/` + register in `registry.ts`. Nothing else changes.

### Scraping system
- `scraper.ts` never throws. It always returns a `ScrapedMetadata` object, even if partially empty.
- `ytdlp.ts` returns `null` on failure. `scraper.ts` handles null gracefully.
- `search.ts` returns `''` on failure. Never blocks the scrape pipeline.
- The three-tier pipeline order is: OG/oEmbed/yt-dlp → SearXNG fallback if thin → LLM (manual only).

---

## Component conventions

### Naming
- Components: PascalCase, named export, same name as file.
- Hooks: camelCase prefixed with `use`, e.g. `useUpdateItem`.
- Utilities: camelCase functions, named exports.
- Types: PascalCase interfaces/types in `lib/utils/types.ts`.

### Structure of a component file
```tsx
// 1. imports — React, then next, then lib, then components, then types
// 2. type definitions local to this file (if any)
// 3. component function
// 4. named export at bottom (not inline with function)
```

### Server vs client decision tree
```
Does this component:
  - Need onClick, onChange, or other event handlers?      → 'use client'
  - Use useState or useEffect?                            → 'use client'
  - Use TanStack Query hooks?                             → 'use client'
  - Use Framer Motion motion components?                  → 'use client'
  - Only render data passed as props or fetched on server? → server component (no directive)
```

### Error boundaries
- Wrap page-level client components in error boundaries where appropriate.
- Never let a missing `thumbnail`, `synopsis`, or `recommender` crash a component.
- Always provide fallback UI for null/undefined fields.

### Accessibility
- All interactive elements: `focus:ring-2 focus:ring-moss focus:outline-none`
- All images: `alt` attribute always present (empty string if decorative)
- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>` where appropriate
- No `div` with onClick — use `<button>` or `<a>`

---

## API route conventions

```ts
// Standard shape for every route handler:
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/config'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authConfig)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse + validate body
  const body = await req.json()
  const result = MySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })

  // 3. Business logic
  try {
    const data = await doSomething(result.data)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[route] description:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Git conventions

- Commits: imperative mood, lowercase, no period. E.g. `add seed card component`, `fix dark mode on detail page`
- One logical change per commit.
- Never commit `.env.local`, `data/*.db`, `data/uploads/`.
- `.gitignore` must include: `.env.local`, `data/*.db`, `data/uploads`, `.next`, `node_modules`

---

## How to run

```bash
# Development
cp .env.example .env.local   # fill in values
npm install
npm run db:migrate
npm run dev

# Docker (recommended)
cp .env.example .env.local   # fill in values
docker-compose up --build

# Database tools
npm run db:migrate            # run migrations
npm run db:studio             # open Drizzle Studio
```

---

## npm scripts (define in package.json)

```json
{
  "scripts": {
    "dev":          "next dev",
    "build":        "next build",
    "start":        "next start",
    "db:migrate":   "tsx lib/db/migrate.ts",
    "db:studio":    "drizzle-kit studio",
    "db:generate":  "drizzle-kit generate",
    "lint":         "next lint"
  }
}
```

---

## Common mistakes to avoid

| Mistake | Correct approach |
|---|---|
| Calling `fetch('/api/...')` in a server component | Import and call DB/service directly |
| Defining animation variants inline in a component | Import from `lib/animations.ts` |
| Using `any` type | Use `unknown` + type guard, or define a proper type |
| Hardcoding a color hex in JSX | Use a Tailwind token from `tailwind.config.ts` |
| Forgetting `dark:` variants | Every color class needs a dark mode counterpart |
| Making enrich button visible with no LLM configured | Check `/api/llm/status` first |
| Throwing from `scraper.ts` or `enricher.ts` | Catch internally, return null/empty |
| Creating a new file not in `SPEC.md § FILE_STRUCTURE` | Flag it and justify before creating |
| Using `getServerSideProps` | Use async server component with direct DB call |
| Forgetting `useReducedMotion()` check | Wrap every Framer Motion animation |

---

## When you are unsure

1. Check `SPEC.md` first — the answer is probably there.
2. If the spec is silent on something, state your assumption explicitly before implementing.
3. If two spec sections conflict, flag the conflict — do not resolve it silently.
4. If a required dependency is missing from `SPEC.md § DEPENDENCIES`, flag it before installing.

---

*This file is the law of the codebase. SPEC.md is the constitution. When they conflict, flag it.*
