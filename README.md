# Digi Hokuryu

A personal digital garden for tracking content you want to consume or have consumed — films, books, podcasts, articles, YouTube videos, and more. Drop a link, the app scrapes basic metadata and optionally enriches it with an AI-generated content profile: synopsis, facts, reception, genre, and mood tags. Everything lives on a growing timeline organized by month and season.

No accounts. No cloud sync. Runs entirely on your machine.

---

## Features

- **URL ingest** — paste any link to auto-scrape title, author, and thumbnail via OG tags
- **Manual entry** — add items without a URL (books, films, concerts, etc.)
- **AI enrichment** — one click generates a rich content profile using a configurable LLM
  - Synopsis (5–8 sentences)
  - Interesting facts / trivia
  - Public reception and community sentiment
  - Genre, mood tags, and AI-generated topic tags
- **Timeline** — items grouped by month and season with a seasonal aesthetic
- **Filtering** — filter by status (pending / consumed), content type, genre, mood, or free-text search
- **Dark mode** — full dark/light theme toggle
- **No auth required** — single-user, self-hosted

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | SQLite via Drizzle ORM + better-sqlite3 |
| Styling | Tailwind CSS v3 (custom token palette) |
| Animation | Framer Motion |
| Data fetching | TanStack Query v5 |
| LLM | OpenRouter / Anthropic / Ollama (pluggable) |
| Scraping | got + cheerio (OG tags only) |
| Validation | Zod |

---

## Prerequisites

- **Node.js 18+**
- **npm 9+**
- An LLM API key *(optional — the app works without one)*

---

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/digi-hokuryu.git
cd digi-hokuryu

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local — see Environment variables below

# 4. Create the database and run migrations
npm run db:migrate

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be taken directly to your garden.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values you need.

### Required

```env
DB_PATH=./data/garden.db
```

The SQLite database file. The `data/` directory is created automatically on first migration. You can change this path to point anywhere on your filesystem (useful for persisting data outside the project directory).

### LLM enrichment (all optional)

The app works without any LLM configured — items can still be ingested and managed manually. When a provider is configured, an **enrich with AI** button appears on each item during ingest and on the detail page.

Provider priority (first configured wins): **Anthropic → OpenRouter → Ollama**

#### OpenRouter (recommended)

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=perplexity/sonar-pro
```

Get a key at [openrouter.ai](https://openrouter.ai). The default model (`perplexity/sonar-pro`) has live web search built in, which significantly improves enrichment quality — it can look up real reviews, facts, and reception for any content.

You can swap the model for any OpenRouter-supported model via `OPENROUTER_MODEL`.

#### Anthropic

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
```

Get a key at [console.anthropic.com](https://console.anthropic.com). Without web search, enrichment quality depends on what the model was trained on. Works best for well-known content.

#### Ollama (local, no API key needed)

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

If neither `ANTHROPIC_API_KEY` nor `OPENROUTER_API_KEY` is set, Ollama is used as the fallback. Make sure Ollama is running and the model is pulled (`ollama pull llama3.2`) before starting the app.

---

## Database

The app uses SQLite. The database file is created automatically when you run migrations.

```bash
# Create / migrate the database
npm run db:migrate

# Open Drizzle Studio (visual database browser)
npm run db:studio

# Regenerate migration files after schema changes
npm run db:generate
```

The database file lives at `DB_PATH` (default `./data/garden.db`). It is excluded from git by `.gitignore`. Back it up by copying the file.

---

## Available scripts

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server (requires build first)
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio database browser
npm run db:generate  # Regenerate migration files after schema changes
npm run lint         # Run ESLint
```

---

## Project structure

```
app/
  garden/              # Main garden page (timeline + add bar)
    [id]/              # Item detail page
    layout.tsx         # Nav wrapper
    page.tsx           # Server component — fetches items from DB directly
  api/
    ingest/
      url/             # POST — scrape a URL
      enrich/          # POST — enrich metadata with LLM
      confirm/         # POST — save item to DB
    items/
      route.ts         # GET all items (with filters)
      [id]/route.ts    # GET / PATCH / DELETE single item
    llm/status/        # GET — check if a provider is configured
    tags/              # GET all tags

components/
  garden/              # Timeline, SeedCard, FilterBar, Nav, etc.
  ingest/              # AddBar, ConfirmCard, ManualEntryForm
  detail/              # ItemHero, ItemMeta, ItemActions, ItemNotes
  ui/                  # Shared primitives (Logo, Skeleton, TypeBadge, etc.)

lib/
  db/                  # Drizzle client, schema, migrations
  llm/                 # LLM interface, providers, enricher
  query/               # TanStack Query client, keys, hooks
  services/            # scraper.ts (OG tag extraction)
  utils/               # types.ts, format.ts, seasons.ts, contentType.ts
  animations.ts        # Framer Motion variants
```

---

## Adding a new LLM provider

1. Create `lib/llm/providers/yourprovider.ts` implementing the `LLMProvider` interface:

```ts
import type { LLMProvider, EnrichInput, EnrichOutput } from '../interface'
import { SYSTEM_PROMPT, buildUserMessage } from '../interface'

export class YourProvider implements LLMProvider {
  name = 'yourprovider'

  isAvailable(): boolean {
    return !!process.env.YOUR_API_KEY
  }

  async enrich(input: EnrichInput): Promise<EnrichOutput> {
    // Call your API, return parsed EnrichOutput
    // Always strip markdown fences before JSON.parse()
  }
}
```

2. Register it in `lib/llm/registry.ts`:

```ts
import { YourProvider } from './providers/yourprovider'

const providers: LLMProvider[] = [
  new AnthropicProvider(),
  new OpenRouterProvider(),
  new OllamaProvider(),
  new YourProvider(),   // add here
]
```

Nothing else changes. Provider detection is automatic.

---

## Content types

The app supports the following content types, selectable during ingest:

`youtube` · `spotify` · `tiktok` · `instagram` · `x` · `article` · `podcast` · `film` · `book` · `concert` · `generic`

---

## Notes

- **No authentication.** This app is designed to run locally or on a private server. Do not expose it to the public internet without adding your own access controls (e.g. a reverse proxy with HTTP basic auth).
- **Ollama fallback.** If neither `ANTHROPIC_API_KEY` nor `OPENROUTER_API_KEY` is set, the app will attempt to use Ollama. If Ollama is not running, enrichment calls will fail silently — the item is still saved, just without AI-generated content.
- **SQLite WAL mode.** The database runs with WAL journaling enabled for better concurrent read performance.

---

## License

MIT
