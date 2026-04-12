# DIGI HOKURYU — PROJECT SPEC v2.0
## 0. AGENT INSTRUCTIONS

- Read this entire file before writing any code.
- Implement strictly in the order defined in `## BUILD_ORDER`.
- Every file you create must match the paths in `## FILE_STRUCTURE` exactly.
- Every schema column must match `## DATABASE_SCHEMA` exactly — no additions, no omissions.
- Every API route must match `## API_ROUTES` exactly — method, path, request shape, response shape.
- Every Tailwind class used for color, spacing, or typography must derive from `## DESIGN_SYSTEM`.
- After completing each phase in `## BUILD_ORDER`, output a checklist of what was built before proceeding.
- If a dependency is not listed in `## DEPENDENCIES`, do not install it without flagging it first.
- Do not add placeholder UI, lorem ipsum, or mock data. Use the exact copy defined in `## COPY`.
- Dark mode is mandatory on every component. Use `dark:` Tailwind variants everywhere.
- LLM enrichment is optional infrastructure. The app must be fully functional with zero LLM config.
- Never block any user flow on LLM availability. Degrade silently to scraped metadata.
- Update this file checking the already implemented phases and tasks
---

## 1. PROJECT IDENTITY

```
name:        Digi Hokuryu
tagline:     things worth your time, planted by people who know you
type:        personal digital garden — content recommendation tracker
audience:    single user, self-hosted, local-first
metaphor:    seeds planted in a garden — pending = growing, consumed = harvested
```

---

## 2. STACK

```
framework:         Next.js 14 — App Router
language:          TypeScript (strict mode)
styling:           Tailwind CSS v3
animation:         Framer Motion
server state:      React Server Components (default)
client state:      TanStack Query v5 (mutations, optimistic updates, cache invalidation)
orm:               Drizzle ORM
database:          SQLite (via better-sqlite3)
auth:              next-auth v5 (credentials provider — username + password)
llm:               Provider-agnostic via LLMProvider interface
                   Shipped providers: Anthropic, OpenRouter, Ollama
                   LLM is OPTIONAL — app works fully without any LLM config
scraping:          got + cheerio (Open Graph), node-oembed, yt-dlp (CLI subprocess)
search-fallback:   SearXNG (self-hosted, runs as Docker sidecar)
file-parsing:      csv-parse, xlsx, pdf-parse, marked
uploads:           native Next.js API route + fs
containerize:      Docker + docker-compose (app + SearXNG as services)
package-manager:   npm
```

### Stack constraints
- No Prisma. Use Drizzle only.
- No separate Express backend. All API logic lives in Next.js route handlers under `app/api/`.
- TanStack Query used ONLY for client components needing optimistic updates or cache invalidation.
  Do not use it to replace server components. Server components fetch data directly.
- No UI component library (no shadcn, no MUI, no Radix). Build all components from scratch with Tailwind.
- Tailwind config must extend the default theme — do not replace it.
- Framer Motion: use `motion` components and `AnimatePresence`. No GSAP, no raw CSS @keyframes
  except for cases Framer Motion cannot handle.

---

## 3. DESIGN_SYSTEM

### 3.1 Philosophy
- Design-first. Every screen must feel like a complete, considered experience.
- Organic, minimal, unhurried. Use border-radius deliberately.
- The garden metaphor must be present in language, color, layout, and animation.
- Two modes: light (paper + moss) and dark (deep forest + dark paper). Both are first-class.
- Animations should feel alive but never distracting — like watching something grow.

### 3.2 Color tokens — extend in tailwind.config.ts

```ts
colors: {
  paper: {
    DEFAULT: '#F9F7F2',
    dark:    '#F1EFE8',
  },
  forest: {
    DEFAULT: '#141a0e',
    card:    '#1c2415',
    deep:    '#0e1109',
  },
  moss: {
    light:   '#EAF3DE',
    mid:     '#97C459',
    DEFAULT: '#3B6D11',
    dark:    '#27500A',
    ink:     '#173404',
  },
  ink: {
    faint:   '#D3D1C7',
    muted:   '#888780',
    DEFAULT: '#2C2C2A',
  },
  seed: {
    youtube:   '#E24B4A',
    spotify:   '#97C459',
    article:   '#5DCAA5',
    podcast:   '#7F77DD',
    film:      '#EF9F27',
    book:      '#D85A30',
    tiktok:    '#E24B4A',
    instagram: '#D4537E',
    concert:   '#D4537E',
    generic:   '#888780',
  }
}
```

### 3.3 Typography
```
font-sans:  'Inter', system-ui, sans-serif   — all UI text
font-serif: 'Lora', Georgia, serif           — item titles on detail page only
font-mono:  'JetBrains Mono', monospace      — URLs, code
```
Load Inter and Lora from Google Fonts via next/font.

### 3.4 Spacing scale
Use Tailwind defaults. Key values:
- Page horizontal padding: `px-6 md:px-12 lg:px-20`
- Section vertical gap: `gap-8` or `space-y-8`
- Card internal padding: `p-4`
- Timeline stem width: `w-px` (1px)
- Seed connector width: `w-5` (20px)

### 3.5 Shadows
No box shadows except:
- Detail page thumbnail: `shadow-sm`
- Focus rings: `ring-2 ring-moss`

### 3.6 Borders
- Default: `border border-ink-faint dark:border-moss-ink/30`
- Card left accent: `border-l-2 border-seed-{type}`
- No border-radius on left side of accent cards
- General radius: `rounded-r-lg` for cards, `rounded-full` for pills/dots, `rounded` for buttons

### 3.7 Animation — Framer Motion

All animations use Framer Motion. Define variants in `lib/animations.ts`.

```ts
// lib/animations.ts — canonical animation variants

export const seedCardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' }
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
}

export const panelVariants = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.15 } }
}

export const confirmCardVariants = {
  hidden:  { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.15 } }
}

export const stemVariants = {
  hidden:  { scaleY: 0, originY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

export const pageVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
}

export const statusBgVariants = {
  pending:  { backgroundColor: '#F1EFE8' },
  consumed: { backgroundColor: '#EAF3DE', transition: { duration: 0.2 } }
}
```

Rules:
- `AnimatePresence` wraps all conditionally rendered components (SeedPanel, ConfirmCard, CandidateList)
- Wrap all Framer Motion with `useReducedMotion()` — return instant transitions when true
- No looping animations except enrichment loading spinner
- Detail page: ItemHero thumbnail: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`

### 3.8 Dark mode
```
strategy:  class-based (darkMode: 'class' in tailwind.config.ts)
toggle:    stored in localStorage, applied to <html> via ThemeToggle
default:   system preference on first visit, then localStorage persists

dark bg:     bg-forest (#141a0e)
dark card:   bg-forest-card (#1c2415)
dark text:   text-paper (#F9F7F2)
dark muted:  text-ink-muted
dark border: border-moss-ink/30
```

---

## 4. FILE_STRUCTURE

```
digi-hokuryu/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── garden/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── items/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── ingest/
│       │   ├── url/route.ts
│       │   ├── enrich/route.ts
│       │   ├── confirm/route.ts
│       │   └── file/route.ts
│       ├── tags/
│       │   └── route.ts
│       └── llm/
│           └── status/
│               └── route.ts
├── components/
│   ├── garden/
│   │   ├── Timeline.tsx
│   │   ├── MonthBlock.tsx
│   │   ├── SeasonDivider.tsx
│   │   ├── SeedCard.tsx
│   │   ├── SeedPanel.tsx
│   │   └── FilterBar.tsx
│   ├── ingest/
│   │   ├── AddBar.tsx
│   │   ├── ManualEntryForm.tsx
│   │   ├── ConfirmCard.tsx
│   │   ├── FileUpload.tsx
│   │   └── CandidateList.tsx
│   ├── detail/
│   │   ├── ItemHero.tsx
│   │   ├── ItemMeta.tsx
│   │   ├── ItemNotes.tsx
│   │   └── ItemActions.tsx
│   └── ui/
│       ├── ThemeToggle.tsx
│       ├── RatingDots.tsx
│       ├── TypeBadge.tsx
│       ├── StatusBadge.tsx
│       ├── Skeleton.tsx
│       ├── Logo.tsx
│       └── LLMStatusIndicator.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── migrate.ts
│   ├── auth/
│   │   └── config.ts
│   ├── llm/
│   │   ├── interface.ts
│   │   ├── registry.ts
│   │   ├── enricher.ts
│   │   └── providers/
│   │       ├── anthropic.ts
│   │       ├── openrouter.ts
│   │       └── ollama.ts
│   ├── services/
│   │   ├── scraper.ts
│   │   ├── search.ts
│   │   ├── parser.ts
│   │   └── ytdlp.ts
│   ├── query/
│   │   ├── client.ts
│   │   ├── keys.ts
│   │   └── hooks/
│   │       ├── useItems.ts
│   │       ├── useIngest.ts
│   │       └── useTags.ts
│   ├── animations.ts
│   └── utils/
│       ├── contentType.ts
│       ├── seasons.ts
│       ├── format.ts
│       └── types.ts
├── public/
│   └── favicon.svg
├── data/
│   └── .gitkeep
├── searxng/                               # SearXNG config volume
│   └── settings.yml
├── .env.example
├── .env.local
├── .gitignore
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 5. DATABASE_SCHEMA

### 5.1 Drizzle schema — lib/db/schema.ts

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  username:     text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const items = sqliteTable('items', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  url:         text('url').unique(),
  title:       text('title').notNull(),
  author:      text('author'),
  sourceType:  text('source_type').notNull(),
  genre:       text('genre'),
  mood:        text('mood'),               // comma-separated
  synopsis:    text('synopsis'),
  thumbnail:   text('thumbnail'),
  duration:    text('duration'),
  recommender: text('recommender'),
  status:      text('status').default('pending'),
  notes:       text('notes'),
  rating:      integer('rating'),          // 1-5, nullable
  aiTags:      text('ai_tags'),            // JSON array string
  enriched:    integer('enriched', { mode: 'boolean' }).default(false),
  llmProvider: text('llm_provider'),       // which provider enriched this
  createdAt:   text('created_at').default(sql`CURRENT_TIMESTAMP`),
  consumedAt:  text('consumed_at'),
})

export const tags = sqliteTable('tags', {
  id:    integer('id').primaryKey({ autoIncrement: true }),
  label: text('label').notNull().unique(),
})

export const itemTags = sqliteTable('item_tags', {
  itemId: integer('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
  tagId:  integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})
```

### 5.2 Source type enum — lib/utils/types.ts

```ts
export const SOURCE_TYPES = [
  'youtube', 'spotify', 'tiktok', 'instagram',
  'x', 'article', 'podcast', 'film', 'book',
  'concert', 'generic'
] as const
export type SourceType = typeof SOURCE_TYPES[number]
```

---

## 6. LLM_SYSTEM

### 6.1 Core principle
LLM enrichment is OPTIONAL. The app runs fully without any LLM env var set.
- No provider configured → enrich button hidden, LLMStatusIndicator shows "enrichment unavailable"
- Provider configured but call fails → return null, log error, never surface to user
- Provider detection: runtime, in registry.ts

### 6.2 LLMProvider interface — lib/llm/interface.ts

```ts
export interface LLMProvider {
  name: string
  isAvailable(): boolean
  enrich(input: EnrichInput): Promise<EnrichOutput>
}

export interface EnrichInput {
  url:             string
  title:           string
  author?:         string
  sourceType:      string
  rawDescription?: string
}

export interface EnrichOutput {
  title:      string
  synopsis:   string
  mood:       string[]
  genre:      string
  sourceType: string
  aiTags:     string[]
}
```

### 6.3 Provider registry — lib/llm/registry.ts

```ts
// Detection order: Anthropic → OpenRouter → Ollama
// Returns first available provider, or null
export function getProvider(): LLMProvider | null

// Returns all configured providers (for status UI)
export function getAvailableProviders(): LLMProvider[]
```

### 6.4 Providers

**Anthropic — lib/llm/providers/anthropic.ts**
```
env:            ANTHROPIC_API_KEY
default model:  claude-haiku-4-5-20251001
env override:   ANTHROPIC_MODEL
sdk:            @anthropic-ai/sdk
isAvailable():  !!process.env.ANTHROPIC_API_KEY
```

**OpenRouter — lib/llm/providers/openrouter.ts**
```
env:            OPENROUTER_API_KEY
default model:  mistralai/mistral-7b-instruct
env override:   OPENROUTER_MODEL
sdk:            openai (OpenAI-compatible, baseURL: https://openrouter.ai/api/v1)
isAvailable():  !!process.env.OPENROUTER_API_KEY
extra headers:  HTTP-Referer: 'http://localhost:3000', X-Title: 'Digi Hokuryu'
```

**Ollama — lib/llm/providers/ollama.ts**
```
env:            none required (fully offline capable)
env optional:   OLLAMA_HOST (default: http://localhost:11434)
                OLLAMA_MODEL (default: llama3.2)
sdk:            openai (Ollama is OpenAI-compatible, baseURL: {OLLAMA_HOST}/v1)
isAvailable():  always true — ping lazily, fail gracefully on actual call
note:           enables fully offline LLM enrichment with no API keys
```

### 6.5 System prompt (all providers)

```
You are a metadata enrichment assistant for a personal content recommendation tracker called Digi Hokuryu.
Given raw scraped metadata about a piece of content, return ONLY a valid JSON object.
No markdown, no explanation, no code fences — raw JSON only.

Return this exact shape:
{
  "title":      "cleaned readable title, max 80 chars",
  "synopsis":   "2-3 sentences describing what this is and why someone might enjoy it",
  "mood":       ["tag1", "tag2"],
  "genre":      "single genre string, lowercase",
  "sourceType": "one of: youtube|spotify|tiktok|instagram|x|article|podcast|film|book|concert|generic",
  "aiTags":     ["tag1", "tag2", "tag3"]
}

Allowed mood values (pick 1-3):
chill, energetic, melancholic, uplifting, intense, introspective, fun, dark, romantic, inspiring
```

### 6.6 Failure handling — lib/llm/enricher.ts

```ts
export async function enrichMetadata(input: EnrichInput): Promise<EnrichOutput | null> {
  const provider = getProvider()
  if (!provider) return null
  try {
    const result = await provider.enrich(input)
    return result
  } catch (err) {
    console.error(`[enricher] ${provider.name} failed:`, err)
    return null
  }
}
```

---

## 7. SCRAPING_SYSTEM

### 7.1 Three-tier pipeline

```
Tier 1 — Direct scrape (always runs)
  OG tags (got + cheerio) + oEmbed + yt-dlp if video type
  → ScrapedMetadata

Tier 2 — Search fallback (runs if Tier 1 produces thin metadata)
  Thin = title empty, title < 4 chars, or rawDescription < 20 chars
  SearXNG query: "{title} {author} {sourceType}"
  → augments rawDescription from top 3 search result snippets

Tier 3 — LLM enrichment (manual trigger only)
  Takes ScrapedMetadata → enricher.ts → EnrichedMetadata
  → user confirms/edits in ConfirmCard before saving
```

### 7.2 contentType.ts — URL detection

```ts
// First match wins
youtube:   includes 'youtube.com' or 'youtu.be'
spotify:   includes 'spotify.com'
tiktok:    includes 'tiktok.com'
instagram: includes 'instagram.com'
x:         includes 'twitter.com' or 'x.com'
podcast:   includes 'anchor.fm', 'podcasts.apple.com', 'open.spotify.com/episode', 'pocketcasts.com'
// fallback: 'generic'
// film / book / concert / article: set by user or LLM
```

### 7.3 scraper.ts — orchestration

```
1. OG: got GET {url} timeout 8000ms, cheerio parse og:title/og:description/og:image/article:author
   on error: empty object, continue

2. oEmbed: node-oembed
   extract: title, author_name, thumbnail_url
   on error: continue

3. yt-dlp: if sourceType youtube or tiktok
   extract: title, uploader, thumbnail, duration, description
   on error: continue

4. merge: yt-dlp > oEmbed > OG (priority)

5. if isThin(result): run search.ts fallback, augment rawDescription

6. return ScrapedMetadata — never throw
```

### 7.4 search.ts — SearXNG fallback

```ts
// env: SEARXNG_URL (default: http://searxng:8080)

export async function searchFallback(query: string): Promise<string>
// GET {SEARXNG_URL}/search?q={query}&format=json&categories=general
// concat result[0..2].title + ': ' + result[0..2].content
// timeout: 5000ms, on any error: return ''

export function isThin(meta: Partial<ScrapedMetadata>): boolean
// true if: !title || title.length < 4 || (!synopsis && !rawDescription) || rawDescription.length < 20
```

### 7.5 ytdlp.ts

```ts
// spawn yt-dlp --dump-json --no-playlist {url}
// env: YTDLP_PATH (default: 'yt-dlp')
// timeout: 15000ms — kill on exceed
// on error/timeout: return null
```

---

## 8. OFFLINE_MODE

### 8.1 AddBar modes

```
Mode A: URL mode (default)
  placeholder: "drop a link, plant a seed..."
  on submit: POST /api/ingest/url → ConfirmCard

Mode B: manual mode
  renders ManualEntryForm inline
  zero network required — works offline
  optional URL field enables enrich button if LLM available
```

### 8.2 ManualEntryForm

```
Required fields:  title (text), sourceType (dropdown)
Optional fields:  recommender, url, genre, notes (textarea), rating (RatingDots)
behavior:
  POST /api/ingest/confirm directly (no scrape step)
  if url provided + LLM available: show "enrich after saving" checkbox
    → if checked: save first, then background enrich, PATCH item with result
  on save: item animates into top of timeline
```

### 8.3 Offline-safe rules
- ManualEntryForm: zero external fetches during submit
- /api/ingest/confirm and /api/items/[id]: work without SearXNG or LLM
- SearXNG and LLM failures never block saving

---

## 9. API_ROUTES

All routes: `application/json`. All except `/api/auth/*` require valid session (401 otherwise).
All request bodies validated with Zod.

### 9.1 Items

```
GET /api/items
  query: status?, type?, mood?, genre?, recommender?, q?
  response: { items: Item[] }
  order: createdAt DESC

POST /api/items
  body: Omit<Item, 'id'|'createdAt'|'consumedAt'|'enriched'|'llmProvider'>
  response: { item: Item }
  dedup: url exists → return existing item HTTP 200

GET /api/items/[id]
  response: { item: Item & { tags: Tag[] } }

PATCH /api/items/[id]
  body: Partial<Item>
  response: { item: Item }
  side-effects:
    status → 'consumed': consumedAt = now()
    status → 'pending':  consumedAt = null

DELETE /api/items/[id]
  response: { success: true }
```

### 9.2 Ingestion

```
POST /api/ingest/url
  body: { url: string }
  response new:       { metadata: ScrapedMetadata }
  response duplicate: { duplicate: true, item: Item }

POST /api/ingest/enrich
  body: { metadata: ScrapedMetadata }
  response success:     { enriched: EnrichedMetadata, provider: string }
  response unavailable: { unavailable: true }
  response error:       { error: true, metadata: ScrapedMetadata }

POST /api/ingest/confirm
  body: { metadata: ConfirmedItem }
  response: { item: Item }
  dedup: same as POST /api/items

POST /api/ingest/file
  body: FormData — field: 'file', accepts: .csv .xlsx .md .txt .pdf
  response: { candidates: CandidateItem[] }
  error: 413 if file exceeds MAX_UPLOAD_MB
```

### 9.3 Tags + LLM status

```
GET /api/tags
  response: { tags: Tag[] }

GET /api/llm/status
  response: { available: boolean, providers: string[], active: string | null }
```

---

## 10. TANSTACK_QUERY

### 10.1 Setup — lib/query/client.ts

```ts
import { QueryClient } from '@tanstack/react-query'
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } }
})
```

Wrap garden layout in `<QueryClientProvider client={queryClient}>`.

### 10.2 Query keys — lib/query/keys.ts

```ts
export const keys = {
  items: (filters?: ItemFilters) => ['items', filters] as const,
  item:  (id: number)            => ['items', id] as const,
  tags:  ()                      => ['tags'] as const,
  llm:   ()                      => ['llm', 'status'] as const,
}
```

### 10.3 When to use TanStack Query vs server components

```
Server components:    initial page load data, data without optimistic updates
TanStack Query:       status toggle, rating update, notes save, delete, enrich call, file upload
```

### 10.4 Optimistic update pattern

```ts
// useUpdateItem — optimistic status/rating/notes updates
onMutate: async ({ id, patch }) => {
  await queryClient.cancelQueries({ queryKey: keys.items() })
  const prev = queryClient.getQueryData(keys.items())
  queryClient.setQueryData(keys.items(), (old: Item[]) =>
    old.map(item => item.id === id ? { ...item, ...patch } : item)
  )
  return { prev }
},
onError: (_, __, ctx) => queryClient.setQueryData(keys.items(), ctx?.prev),
onSettled: () => queryClient.invalidateQueries({ queryKey: keys.items() })
```

---

## 11. AUTH

### 11.1 next-auth config
```
provider:   CredentialsProvider — username + password
session:    JWT strategy
callbacks:  user.id in token + session
verify:     query users by username, bcrypt.compare
```

### 11.2 First-run
```
On startup (lib/db/migrate.ts):
  run drizzle migrations
  if users empty:
    read GARDEN_ADMIN_USER + GARDEN_ADMIN_PASS from env
    bcrypt hash rounds: 12
    insert user
    log: "Garden initialized. First user created: {username}"
```

### 11.3 Login page
```
layout:     centered card, full viewport height
bg:         bg-paper dark:bg-forest
card:       bg-paper-dark dark:bg-forest-card, border, rounded-xl, p-8, max-w-sm mx-auto
logo:       Logo component, moss color, centered, mb-8
fields:     username + password inputs
button:     "enter the garden", full width, bg-moss text-white hover:bg-moss-dark
error:      inline below button, text-red-500 text-sm
animation:  card fades in with confirmCardVariants on mount
```

---

## 12. UI_SCREENS

### 12.1 Garden layout

```
Nav:
  left:    Logo
  center:  filter chips (All / Pending / Consumed)
  right:   LLMStatusIndicator + ThemeToggle + username initial
  height:  h-14
  border:  border-b border-ink-faint dark:border-moss-ink/20
  bg:      bg-paper/80 dark:bg-forest/80 backdrop-blur-sm
  sticky:  top-0 z-10
```

### 12.2 Timeline view

```
AddBar:
  mode tabs: "url" | "manual" (small tabs, inline)
  URL mode: input "drop a link, plant a seed..." → skeleton → ConfirmCard (AnimatePresence)
  Manual mode: ManualEntryForm inline (AnimatePresence)
  duplicate: "already in your garden" inline

ConfirmCard (AnimatePresence, confirmCardVariants):
  fields: thumbnail, title (editable), author, sourceType (dropdown), recommender
  enrich button: visible only if /api/llm/status available=true
  enriching: animate-pulse skeleton on synopsis/mood/genre, then fill
  "plant this seed": confirm → card exits → item animates into top of timeline
  "discard": AnimatePresence exit

Timeline (motion.div, pageVariants):
  newest month first
  season dividers between season changes
  MonthBlock per month:
    stem: motion.div with stemVariants (grows on mount)
    month label: rotated 90deg vertical, text-ink-muted text-xs tracking-widest uppercase
    seeds: AnimatePresence — each SeedCard with seedCardVariants custom={index}

SeedCard:
  bg:       bg-paper-dark dark:bg-forest-card
  border:   border border-ink-faint dark:border-moss-ink/20 rounded-r-lg
  accent:   border-l-2 border-seed-{sourceType}
  consumed: opacity-60
  top row:  title + TypeBadge
  meta row: recommender (text-moss font-medium) · genre · StatusBadge if pending
  notes:    first 60 chars italic text-ink-muted (if notes exist)
  rating:   RatingDots (if rating set)
  click:    toggle SeedPanel (AnimatePresence)

SeedPanel (AnimatePresence, panelVariants):
  synopsis, thumbnail, external link button
  status toggle: useUpdateItem optimistic
  "open full page": Link /garden/[id]
```

### 12.3 Detail page

```
Wrap page: motion.div pageVariants
Back link: "← back to garden" text-moss text-sm mb-6

ItemHero:
  thumbnail: motion img fade-in, full width max-h-64 object-cover rounded-lg shadow-sm
  no thumbnail: bg-seed-{type}/20 block same dimensions
  title: font-serif text-3xl mt-4
  author: text-ink-muted text-sm

ItemMeta: key/value grid, text-sm
  TypeBadge, genre, mood pills (bg-moss-light text-moss-dark),
  recommender (text-moss), added date, duration, AI tags, llmProvider (muted)

Synopsis: text-base leading-relaxed max-w-prose font-sans

ItemNotes:
  textarea: auto-resize, border-b border-ink-faint, bg-transparent
  RatingDots: interactive, useUpdateItem on click
  debounced save: 800ms useUpdateItem

ItemActions:
  status toggle: moss outlined button, useUpdateItem
  "open original": moss outlined, target="_blank"
  "remove from garden": text-red-500, confirm before DELETE
```

### 12.4 File upload flow

```
Trigger: "or upload a file" below AddBar
FileUpload: drag-drop zone, accepts .csv .xlsx .md .txt .pdf
  on file: POST /api/ingest/file → CandidateList (AnimatePresence)

CandidateList:
  checkbox list + title + url (truncated) + recommender (inline editable)
  "select all" / "deselect all"
  "plant selected seeds": sequential POST /api/ingest/confirm per item
  progress: "planting {n} of {total} seeds..." + moss progress bar
```

---

## 13. COPY

Exact strings. Do not paraphrase.

```
app name:           "digi hokuryu"
tagline:            "things worth your time, planted by people who know you"
add bar url:        "drop a link, plant a seed..."
add bar tab url:    "url"
add bar tab manual: "manual"
login button:       "enter the garden"
save button:        "plant this seed"
discard button:     "discard"
enrich button:      "enrich with AI"
enrich loading:     "enriching..."
consumed on:        "mark as consumed"
consumed off:       "mark as pending"
delete button:      "remove from garden"
delete confirm:     "are you sure? this seed will be lost."
duplicate:          "already in your garden"
empty state:        "your garden is empty. drop a link above to plant your first seed."
back link:          "← back to garden"
open original:      "open original"
upload trigger:     "or upload a file"
plant selected:     "plant selected seeds"
stats planted:      "seeds planted"
stats consumed:     "consumed"
stats growing:      "still growing"
llm unavailable:    "enrichment unavailable"
llm active:         "enrichment on"
manual title:       "add manually"
enrich after save:  "enrich after saving"
upload progress:    "planting {n} of {total} seeds..."
```

---

## 14. DEPENDENCIES

```json
{
  "dependencies": {
    "next":                    "14.x",
    "react":                   "18.x",
    "react-dom":               "18.x",
    "typescript":              "5.x",
    "tailwindcss":             "3.x",
    "autoprefixer":            "latest",
    "postcss":                 "latest",
    "framer-motion":           "latest",
    "@tanstack/react-query":   "5.x",
    "drizzle-orm":             "latest",
    "better-sqlite3":          "latest",
    "next-auth":               "5.x",
    "bcryptjs":                "latest",
    "@anthropic-ai/sdk":       "latest",
    "openai":                  "latest",
    "got":                     "14.x",
    "cheerio":                 "latest",
    "node-oembed":             "latest",
    "csv-parse":               "latest",
    "xlsx":                    "latest",
    "pdf-parse":               "latest",
    "marked":                  "latest",
    "zod":                     "latest"
  },
  "devDependencies": {
    "@types/node":             "latest",
    "@types/react":            "latest",
    "@types/react-dom":        "latest",
    "@types/bcryptjs":         "latest",
    "@types/better-sqlite3":   "latest",
    "@types/pdf-parse":        "latest",
    "drizzle-kit":             "latest",
    "eslint":                  "latest",
    "eslint-config-next":      "latest"
  }
}
```

---

## 15. ENVIRONMENT

```env
# Server
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-to-a-long-random-string-min-32-chars

# Database
DB_PATH=./data/garden.db

# First user
GARDEN_ADMIN_USER=admin
GARDEN_ADMIN_PASS=change-this-password

# LLM — all optional, app works without these
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001

OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=mistralai/mistral-7b-instruct

OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Search fallback (auto-configured in docker-compose)
SEARXNG_URL=http://searxng:8080

# Scraping
YTDLP_PATH=yt-dlp
MAX_UPLOAD_MB=20
```

---

## 16. DOCKER

### Dockerfile

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
RUN apk add --no-cache python3 py3-pip
RUN pip3 install yt-dlp --break-system-packages
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  garden:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env.local
    environment:
      - SEARXNG_URL=http://searxng:8080
    depends_on:
      - searxng
    restart: unless-stopped

  searxng:
    image: searxng/searxng:latest
    volumes:
      - ./searxng:/etc/searxng
    restart: unless-stopped
```

### searxng/settings.yml (minimal)

```yaml
use_default_settings: true
server:
  secret_key: "digi-hokuryu-searxng"
  base_url: false
search:
  formats:
    - html
    - json
```

### next.config.ts

```ts
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'pdf-parse'],
  },
}
export default nextConfig
```

---

## 17. BUILD_ORDER

Complete each phase fully before starting the next. Output a checklist after each phase.

```
PHASE 1 — foundation
  [ ] tailwind.config.ts — color system §3.2, darkMode: 'class'
  [ ] next.config.ts
  [ ] tsconfig.json — strict mode
  [ ] lib/utils/types.ts — SOURCE_TYPES + shared types + Zod schemas
  [ ] lib/animations.ts — all Framer Motion variants §3.7
  [ ] lib/db/schema.ts
  [ ] drizzle.config.ts
  [ ] lib/db/index.ts — Drizzle singleton
  [ ] lib/db/migrate.ts — migrations + first user
  [ ] lib/auth/config.ts
  [ ] lib/query/client.ts + lib/query/keys.ts
  [ ] app/api/auth/[...nextauth]/route.ts
  [ ] app/layout.tsx — fonts, QueryClientProvider, dark mode init
  [ ] app/(auth)/login/page.tsx
  [ ] .env.example
  [ ] .gitignore
  [ ] searxng/settings.yml
  [ ] Dockerfile + docker-compose.yml

PHASE 2 — LLM system
  [ ] lib/llm/interface.ts
  [ ] lib/llm/providers/anthropic.ts
  [ ] lib/llm/providers/openrouter.ts
  [ ] lib/llm/providers/ollama.ts
  [ ] lib/llm/registry.ts
  [ ] lib/llm/enricher.ts
  [ ] app/api/llm/status/route.ts

PHASE 3 — scraping + ingestion backend
  [ ] lib/utils/contentType.ts
  [ ] lib/services/ytdlp.ts
  [ ] lib/services/search.ts — SearXNG + isThin
  [ ] lib/services/scraper.ts — full 3-tier pipeline
  [ ] lib/services/parser.ts
  [ ] app/api/ingest/url/route.ts
  [ ] app/api/ingest/enrich/route.ts
  [ ] app/api/ingest/confirm/route.ts
  [ ] app/api/ingest/file/route.ts

PHASE 4 — items API
  [ ] app/api/items/route.ts
  [ ] app/api/items/[id]/route.ts
  [ ] app/api/tags/route.ts
  [ ] lib/utils/seasons.ts
  [ ] lib/utils/format.ts

PHASE 5 — TanStack Query hooks
  [ ] lib/query/hooks/useItems.ts
  [ ] lib/query/hooks/useIngest.ts
  [ ] lib/query/hooks/useTags.ts

PHASE 6 — UI components
  [ ] components/ui/Logo.tsx
  [ ] components/ui/ThemeToggle.tsx
  [ ] components/ui/RatingDots.tsx
  [ ] components/ui/TypeBadge.tsx
  [ ] components/ui/StatusBadge.tsx
  [ ] components/ui/Skeleton.tsx
  [ ] components/ui/LLMStatusIndicator.tsx
  [ ] components/garden/SeasonDivider.tsx
  [ ] components/garden/SeedCard.tsx
  [ ] components/garden/SeedPanel.tsx
  [ ] components/garden/MonthBlock.tsx
  [ ] components/garden/Timeline.tsx
  [ ] components/garden/FilterBar.tsx
  [ ] components/ingest/AddBar.tsx
  [ ] components/ingest/ManualEntryForm.tsx
  [ ] components/ingest/ConfirmCard.tsx
  [ ] components/ingest/FileUpload.tsx
  [ ] components/ingest/CandidateList.tsx
  [ ] components/detail/ItemHero.tsx
  [ ] components/detail/ItemMeta.tsx
  [ ] components/detail/ItemNotes.tsx
  [ ] components/detail/ItemActions.tsx

PHASE 7 — pages
  [ ] app/garden/layout.tsx
  [ ] app/garden/page.tsx
  [ ] app/garden/[id]/page.tsx
  [ ] app/page.tsx

PHASE 8 — polish + ship
  [ ] public/favicon.svg — leaf/seed SVG
  [ ] README.md
  [ ] verify: dark mode every screen
  [ ] verify: all COPY strings match §13
  [ ] verify: app works with zero LLM env vars
  [ ] verify: manual entry works offline
  [ ] verify: SearXNG failure degrades gracefully
  [ ] verify: useReducedMotion() applied to all animations
  [ ] docker build + docker-compose up test
```

---

## 18. CONSTRAINTS

```
TypeScript:
  strict mode — no `any`, use `unknown` + type guards
  all DB queries through Drizzle
  all API inputs validated with Zod

Error handling:
  no console.log in production paths
  console.error for caught errors only
  yt-dlp failure → degrade to OG, never throw
  LLM failure → return null, never surface
  SearXNG failure → return '', never block
  URL dedup → HTTP 200 existing item, never error

Images: next/image, always provide fallback for missing thumbnails
Components: server components by default, 'use client' only when needed
Accessibility: focus rings on all interactive elements (ring-2 ring-moss)
Animations: all wrapped in useReducedMotion() check
Data: data/ never committed, .env.local never committed
Upload: MAX_UPLOAD_MB enforced, 413 on exceed
Session: required on all /api/* except /api/auth/*
```

---

*end of spec — digi hokuryu v2.0 MVP*
