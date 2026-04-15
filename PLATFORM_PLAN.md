# HOKURYU — Platform Plan
**Version:** MVP Planning Document  
**Date:** 2026-04-14  
**Status:** Active

---

## 1. Vision

Hokuryu is a digital garden platform where curiosity is the currency. Users curate content they consume — books, films, articles, music, videos, podcasts, and more — and share it with the world through their personal garden. The platform rewards people who consume, review, and share content by turning the act of learning and exploring into a social, gamified experience.

**Core thesis:** The best recommendation is not an algorithm — it's the taste of someone you trust. Hokuryu makes taste visible, shareable, and rewarding.

**Inspired by:**
- Letterboxd (content tracking + personal reviews across all media types)
- Substack (creator-style profiles, written takes)
- Reddit (karma, community, reputation)
- Duolingo (streaks, daily habit loop)
- GitHub (badges, contribution graphs, public profile as identity)
- Twitter/X (asymmetric follow, feed)

---

## 2. Core Concepts & Glossary

| Term | Meaning |
|---|---|
| **Garden** | A user's personal collection of all their seeds. Their public profile of taste. |
| **Seed** | A single piece of content saved to a garden (film, book, article, video, etc.) |
| **Plant** | The act of saving a seed to your garden (status: pending) |
| **Harvest** | The act of consuming content, giving it a rating AND a written review (status: consumed). Earns points. |
| **Souvenir** | A seed saved from someone else's garden into your own. Carries attribution. |
| **Passport** | Your personal collection of souvenirs — a visual record of every garden you've visited and saved from. |
| **Karma** | Public points total. Earned through harvesting, being saved by others, streaks, and badges. |
| **Streak** | Daily consecutive days of harvesting at least 1 seed. Like Duolingo. |
| **Badge** | A permanent achievement awarded for milestones. Shown publicly on profile. |
| **Feed** | The content discovery surface. Three modes: Following, For You, Adventure. |
| **Onboarding** | First-run category preferences that seed the For You feed. |

---

## 3. Tech Stack

### Core
| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Current stack, RSC + client hybrid |
| Auth | Supabase Auth | Email/password + OAuth, free tier generous |
| Database | Supabase Postgres | Replaces SQLite, needed for multi-user |
| ORM | Drizzle ORM | Type-safe, works with Postgres, keep existing patterns |
| Storage | Supabase Storage | Avatars, thumbnails — free tier 1GB |
| Realtime | Supabase Realtime | In-app notifications (no extra infra) |
| Hosting | Vercel | CI/CD, edge functions, free tier |
| Monitoring | Sentry | Error tracking, performance, free tier |
| Styling | Tailwind CSS | Keep current design system |
| Animation | Framer Motion | Keep current |
| Data fetching | TanStack Query v5 | Keep current |
| LLM | OpenRouter (perplexity/sonar-pro) | Keep current enrichment system |

### Key migration from current stack
- SQLite → Supabase Postgres (schema migration, same Drizzle patterns)
- No auth → Supabase Auth (JWT sessions, RLS policies on all tables)
- Single-user → Multi-user (all queries scoped by `user_id`)
- Local DB → Supabase hosted (connection string in env)

---

## 4. Database Schema

### `profiles` (extends Supabase `auth.users`)
```sql
id              uuid PRIMARY KEY REFERENCES auth.users(id)
username        text UNIQUE NOT NULL
display_name    text
bio             text          -- markdown
avatar_url      text
karma           integer DEFAULT 0
streak_count    integer DEFAULT 0
streak_last_date date
content_prefs   text[]        -- sourceType[] from onboarding
created_at      timestamptz DEFAULT now()
```

### `items` (seeds — now user-owned)
```sql
id              serial PRIMARY KEY
user_id         uuid NOT NULL REFERENCES profiles(id)
url             text
title           text NOT NULL
author          text
source_type     text NOT NULL
status          text DEFAULT 'pending'   -- 'pending' | 'consumed'
synopsis        text
genre           text
mood            text
ai_tags         text                     -- JSON array
keywords        text                     -- JSON array
thumbnail       text
duration        integer
notes           text
rating          integer
recommender     text
enriched        boolean DEFAULT false
llm_provider    text
created_at      timestamptz DEFAULT now()
consumed_at     timestamptz
-- origin tracking for souvenirs
original_item_id  integer REFERENCES items(id)   -- null if original, set if souvenir
original_user_id  uuid REFERENCES profiles(id)   -- whose garden it came from
```

### `follows`
```sql
follower_id     uuid REFERENCES profiles(id)
following_id    uuid REFERENCES profiles(id)
created_at      timestamptz DEFAULT now()
PRIMARY KEY (follower_id, following_id)
```

### `reactions`
```sql
id              serial PRIMARY KEY
user_id         uuid NOT NULL REFERENCES profiles(id)
item_id         integer NOT NULL REFERENCES items(id)
type            text NOT NULL   -- 'like' | 'save'
created_at      timestamptz DEFAULT now()
UNIQUE(user_id, item_id, type)
```

### `notifications`
```sql
id              serial PRIMARY KEY
recipient_id    uuid NOT NULL REFERENCES profiles(id)
actor_id        uuid NOT NULL REFERENCES profiles(id)
type            text NOT NULL
  -- 'follow' | 'reaction' | 'souvenir' | 'harvest_milestone' | 'badge_awarded'
item_id         integer REFERENCES items(id)
read            boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

### `badges`
```sql
id              serial PRIMARY KEY
user_id         uuid NOT NULL REFERENCES profiles(id)
badge_type      text NOT NULL   -- see Badge Registry below
awarded_at      timestamptz DEFAULT now()
UNIQUE(user_id, badge_type)
```

### `onboarding_preferences`
```sql
user_id         uuid PRIMARY KEY REFERENCES profiles(id)
source_types    text[]    -- sourceType preferences
genres          text[]    -- genre preferences
completed       boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

---

## 5. Gamification System

### Points (Karma)

| Action | Points |
|---|---|
| Plant a seed (save content) | +1 |
| Harvest a seed (consume + rate + review) | +5 |
| Someone saves your seed as souvenir | +3 |
| Someone reacts (like) to your seed | +1 |
| Complete a 7-day streak | +10 bonus |
| Complete a 30-day streak | +50 bonus |
| Earn a badge | +25 bonus |

Karma is public on profile, like Reddit. No way to lose karma in MVP.

### Streaks

- **Definition:** At least 1 harvest per calendar day (user's local timezone)
- **Reset:** Missing a full day resets streak to 0
- **Grace period:** None in MVP (clean mechanic)
- **Display:** Shown on profile, flame icon like Duolingo
- **Milestone streaks:** 7, 30, 100, 365 days trigger badge + karma bonus

### Badge Registry

| Badge | Trigger |
|---|---|
| `first_seed` | Plant first seed |
| `first_harvest` | Harvest first seed |
| `curator_10` | 10 of your seeds saved as souvenirs by others |
| `curator_50` | 50 of your seeds saved as souvenirs |
| `explorer_5` | Visit 5 different gardens and save a souvenir from each |
| `explorer_25` | Visit 25 gardens |
| `streak_7` | 7-day harvest streak |
| `streak_30` | 30-day harvest streak |
| `streak_100` | 100-day harvest streak |
| `streak_365` | 365-day streak |
| `harvest_50` | 50 total harvests |
| `harvest_100` | 100 total harvests |
| `contributor_top` | Be in top 10 most-saved gardens this month |
| `genre_master` | Harvest 20+ items in the same genre |
| `well_traveled` | Souvenirs from 10+ different gardens in passport |

---

## 6. Passport Mechanic

The Passport is a visual page on every profile showing the gardens they've visited and souvenirs collected.

- When user saves a seed from someone else's garden, a **Souvenir** is created
- The souvenir carries: original creator, original garden, date collected, the seed data
- Passport page groups souvenirs by the garden they came from
- Each "garden stamp" shows: the garden owner's avatar, username, number of souvenirs collected from them
- Souvenir feed is private (you see your own full passport), but the summary (gardens visited count, unique gardens) is public on profile
- Original creator is always credited on the souvenir card with a link back

---

## 7. Feed System

Three feeds accessible from the main garden page:

### Following Feed
- Chronological
- Shows: seeds planted AND harvested by people you follow
- Sorted: newest first

### For You Feed
- Based on onboarding preferences (source_types + genres)
- Shows: public seeds from ALL users matching preferences
- Sorted: most recently harvested first (harvested content = quality signal)
- Excludes: content already in your garden

### Adventure Feed
- One button: "TAKE ME SOMEWHERE NEW"
- Randomly surfaces a seed from a genre/type you have NOT in your preferences
- Forces serendipitous discovery
- Single seed shown at a time, tap again for another

---

## 8. Profile Page

**Public sections:**
- Avatar, username, display name
- Bio (markdown rendered)
- Karma score + badge strip (top 5 badges)
- Current streak (with flame)
- Stats: Seeds planted / Harvested / Souvenirs given (saved by others)
- Passport summary: X gardens visited, X souvenirs collected
- Their garden (all public seeds, filterable by type/status)
- Activity feed (recent harvests, recent plants) — chronological

**Private (own profile only):**
- Full passport with all souvenirs
- Notification bell

---

## 9. API Routes (New/Changed)

```
POST   /api/auth/onboarding          Save category preferences post-signup
GET    /api/profile/[username]        Public profile data
PATCH  /api/profile                   Update own profile (bio, display_name, avatar)

GET    /api/feed/following            Seeds from followed users
GET    /api/feed/foryou               Seeds matching user preferences
GET    /api/feed/adventure            Random single seed outside preferences

GET    /api/garden/[username]         Public garden (items) for a user
POST   /api/garden/souvenir           Save someone else's seed to own garden
DELETE /api/garden/souvenir/[id]      Remove souvenir

POST   /api/follows                   Follow a user
DELETE /api/follows/[userId]          Unfollow

POST   /api/reactions                 Like or save a seed
DELETE /api/reactions/[itemId]        Remove reaction

GET    /api/notifications             Get own notifications (unread first)
PATCH  /api/notifications/read        Mark all as read
PATCH  /api/notifications/[id]/read   Mark single as read

GET    /api/passport                  Own passport (souvenirs grouped by garden)
GET    /api/leaderboard               Top karma users (global, weekly, monthly)

GET    /api/badges/[username]         Badges for a user
POST   /api/badges/check              Internal: check + award pending badges (called after harvest/save)
```

---

## 10. Page Routes

```
/                          Landing page (logged out) / redirect to /garden (logged in)
/login                     Auth page
/signup                    Auth page + triggers onboarding
/onboarding                Category selection (first-run only)

/garden                    Own garden (current app, adapted for multi-user)
/garden/[id]               Own seed detail

/@[username]               Public profile page
/@[username]/garden        Their garden (browsable)
/@[username]/passport      Their passport summary (public view)

/feed                      Main feed with 3 tabs (Following / For You / Adventure)
/explore                   Global discover page (trending seeds, top gardens, tag browse)
/leaderboard               Karma leaderboard
/notifications             Full notifications list
/settings                  Account settings, preferences, danger zone
/settings/profile          Edit profile (bio md editor, avatar, display name)
```

---

## 11. Component Inventory (New)

```
components/
  auth/
    LoginForm.tsx
    SignupForm.tsx
    OnboardingFlow.tsx          -- category picker
  profile/
    ProfileHeader.tsx           -- avatar, name, karma, streak, badges
    ProfileStats.tsx            -- seed/harvest/souvenir counts
    BioEditor.tsx               -- markdown editor (write) + renderer (read)
    BadgeStrip.tsx              -- top badges display
    StreakCounter.tsx           -- flame + count
  feed/
    FeedTabs.tsx                -- Following / For You / Adventure switcher
    AdventureButton.tsx         -- "TAKE ME SOMEWHERE" random trigger
    FeedItem.tsx                -- seed card adapted for feed context (shows author)
  social/
    FollowButton.tsx
    SouvenirButton.tsx          -- save to own garden
    ReactionBar.tsx             -- like + save counts
    UserCard.tsx                -- small user preview (avatar, username, karma)
    SuggestedUsers.tsx          -- people with similar taste
  passport/
    PassportPage.tsx            -- full passport view
    GardenStamp.tsx             -- stamp for one visited garden
    SouvenirCard.tsx            -- individual souvenir with attribution
  notifications/
    NotificationBell.tsx        -- icon + unread count
    NotificationList.tsx
    NotificationItem.tsx
  explore/
    ExploreGrid.tsx             -- trending seeds
    TagBrowser.tsx              -- genre/type filter
    TopGardens.tsx              -- most-saved gardens this week
  leaderboard/
    LeaderboardTable.tsx
    KarmaRank.tsx
  ui/
    MarkdownEditor.tsx          -- bio editor (codemirror or simple textarea + preview)
    MarkdownRenderer.tsx        -- safe markdown to HTML
    Avatar.tsx                  -- user avatar with fallback initials
    KarmaDisplay.tsx            -- karma number with icon
```

---

## 12. Build Versions

---

### V1 — Multi-User Foundation
**Goal:** Current single-user app migrated to Supabase, auth working, every seed owned by a user.

**Scope:**
- Supabase project setup (Postgres, Auth, Storage)
- Drizzle schema migration (SQLite → Postgres + new columns)
- Supabase Auth integration (login, signup, session, logout)
- All existing API routes scoped by authenticated user
- Profile table creation on signup
- Basic profile page (`/@[username]`) — static, no social features yet
- Own garden works exactly as before, just behind auth
- Vercel + Sentry setup

**New files:**
- `lib/supabase/client.ts` — browser Supabase client
- `lib/supabase/server.ts` — server Supabase client (RSC)
- `lib/db/schema.ts` — migrated Postgres schema
- `lib/db/migrate.ts` — updated for Postgres
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `middleware.ts` — protect `/garden` routes, redirect unauthenticated
- `components/auth/LoginForm.tsx`
- `components/auth/SignupForm.tsx`

**Milestone:** Existing functionality preserved. Auth gates the garden. Deploy to Vercel.

---

### V2 — Profiles & Onboarding
**Goal:** Every user has a public identity. New users go through onboarding.

**Scope:**
- Onboarding flow (category + sourceType preferences)
- Profile page (`/@[username]`) — bio, avatar, stats, garden preview
- Bio markdown editor + renderer
- Avatar upload (Supabase Storage)
- Settings page (edit profile)
- Profile page shows own seeds (public only)

**New files:**
- `app/onboarding/page.tsx`
- `app/(profile)/[username]/page.tsx`
- `app/settings/profile/page.tsx`
- `components/auth/OnboardingFlow.tsx`
- `components/profile/ProfileHeader.tsx`
- `components/profile/BioEditor.tsx`
- `components/profile/ProfileStats.tsx`
- `components/ui/Avatar.tsx`
- `components/ui/MarkdownEditor.tsx`
- `components/ui/MarkdownRenderer.tsx`
- `app/api/auth/onboarding/route.ts`
- `app/api/profile/route.ts`
- `app/api/profile/[username]/route.ts`

**Milestone:** Public profiles live. Shareable garden URLs. `hokuryu.app/@username`

---

### V3 — Social Graph
**Goal:** Users can follow each other, react to seeds, save souvenirs, see notifications.

**Scope:**
- Follow / Unfollow
- Reactions (like + save) on any public seed
- Souvenir mechanic (save to own garden with attribution, notify original creator)
- In-app notifications (Supabase Realtime)
- Notification bell in Nav
- Passport page (own view — souvenirs grouped by source garden)
- Passport public summary on profile
- Original creator credit on souvenir cards
- Suggested users (basic: users with overlapping content_prefs)

**New files:**
- `app/api/follows/route.ts`
- `app/api/reactions/route.ts`
- `app/api/garden/souvenir/route.ts`
- `app/api/notifications/route.ts`
- `app/notifications/page.tsx`
- `app/(profile)/[username]/passport/page.tsx`
- `components/social/FollowButton.tsx`
- `components/social/ReactionBar.tsx`
- `components/social/SouvenirButton.tsx`
- `components/social/UserCard.tsx`
- `components/social/SuggestedUsers.tsx`
- `components/notifications/NotificationBell.tsx`
- `components/notifications/NotificationList.tsx`
- `components/passport/PassportPage.tsx`
- `components/passport/GardenStamp.tsx`
- `components/passport/SouvenirCard.tsx`

**Milestone:** Platform feels social. Gardens are visitable. Souvenirs collectible.

---

### V4 — Feeds & Discovery
**Goal:** Users have a personalized home experience and can explore beyond their follow graph.

**Scope:**
- Feed page with 3 tabs: Following / For You / Adventure
- Explore page (trending seeds, tag browser, top gardens this week)
- Global chronological feed of public harvests
- Adventure button (random seed outside user preferences)
- Tag/genre browse

**New files:**
- `app/feed/page.tsx`
- `app/explore/page.tsx`
- `app/api/feed/following/route.ts`
- `app/api/feed/foryou/route.ts`
- `app/api/feed/adventure/route.ts`
- `components/feed/FeedTabs.tsx`
- `components/feed/FeedItem.tsx`
- `components/feed/AdventureButton.tsx`
- `components/explore/ExploreGrid.tsx`
- `components/explore/TagBrowser.tsx`
- `components/explore/TopGardens.tsx`

**Milestone:** Cold-start problem solved. New users see relevant content without following anyone.

---

### V5 — Gamification
**Goal:** Reward curiosity. Make the harvest loop visible and addictive.

**Scope:**
- Karma points (full system — harvest, souvenir, reaction, milestone bonuses)
- Daily streaks (track, display, reset logic)
- Badge system (full badge registry, auto-award on trigger events)
- Leaderboard (global, weekly, monthly)
- Karma display on profiles
- Badge strip on profiles
- Streak display (flame icon + count)
- `POST /api/badges/check` — runs after every harvest/souvenir action

**New files:**
- `lib/gamification/karma.ts` — point calculation logic
- `lib/gamification/streaks.ts` — streak check/update logic
- `lib/gamification/badges.ts` — badge registry + award logic
- `app/api/badges/check/route.ts`
- `app/api/leaderboard/route.ts`
- `app/leaderboard/page.tsx`
- `components/profile/BadgeStrip.tsx`
- `components/profile/StreakCounter.tsx`
- `components/ui/KarmaDisplay.tsx`
- `components/leaderboard/LeaderboardTable.tsx`

**Milestone:** Full gamification loop live. Plant → Harvest → Points → Badges → Leaderboard.

---

## 13. Non-MVP (Future Versions)

These are explicitly out of scope for MVP but should not be architected against:

| Feature | Notes |
|---|---|
| Paid gardens / subscriptions | Substack-style, monetize creators. Stripe integration. |
| Email notifications | After in-app is stable |
| Mobile app | Web-first, React Native or PWA later |
| Private/protected gardens | Removed from MVP to avoid gatekeeping |
| Comments on seeds | Start with reactions only, add comments later |
| 1:1 meetings between users | Post-MVP community feature |
| Group gardens / clubs | Collaborative curation spaces |
| Recommendation engine v2 | ML-based taste matching (post scale) |
| Export your garden | GDPR / data portability |
| Embeddable garden widget | Share your garden on a personal site |

---

## 14. Key Constraints & Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth provider | Supabase Auth | Free tier, built-in OAuth, integrates with Postgres RLS |
| Database | Supabase Postgres | Multi-user requires relational DB with proper FK + RLS |
| File storage | Supabase Storage | Avatars + thumbnails, free tier 1GB |
| Realtime notifications | Supabase Realtime | No extra infra, free tier sufficient for MVP |
| ORM | Drizzle (keep) | Type-safe, existing patterns, works with Postgres |
| Hosting | Vercel | Free tier, CI/CD from GitHub |
| Monitoring | Sentry | Error tracking, free tier, Vercel integration |
| Private gardens | No (MVP) | Platform philosophy: anti-gatekeeping |
| Comments | No (MVP) | Reactions only — reduces moderation complexity |
| Mobile | No (MVP) | Web-first |
| Markdown editor | Simple textarea + preview toggle | Keep it lean, upgrade later if needed |
| LLM enrichment | Keep OpenRouter | Already working, AI tags still valuable |

---

## 15. Environment Variables (Full List)

```bash
# Database
DATABASE_URL=postgresql://...supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...    # server-side only, never expose to client

# LLM
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=perplexity/sonar-pro   # optional override

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...            # for source maps upload

# App
NEXT_PUBLIC_APP_URL=https://hokuryu.app
```

---

## 16. Supabase RLS Policy Summary

Every table needs Row Level Security. Key policies:

| Table | Read | Write |
|---|---|---|
| `profiles` | Public (all) | Own row only |
| `items` | Public if `user_id` is public | Own rows only |
| `follows` | Public | Own `follower_id` only |
| `reactions` | Public (counts) | Own `user_id` only |
| `notifications` | Own `recipient_id` only | System (service role) only |
| `badges` | Public | System (service role) only |
| `passport_stamps` | Own `user_id` only | Own `user_id` only |
| `onboarding_preferences` | Own `user_id` only | Own `user_id` only |

---

*This document governs V1–V5 of Hokuryu. SPEC.md governs current single-user implementation. When conflict arises between the two, this document takes precedence for new features. The single-user SPEC.md remains valid for anything not covered here.*
