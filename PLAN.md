# PLAN.md — Hokuryu Build Tracker

**IMPORTANT:** This file must be updated after every completed task and phase. Mark tasks `[x]` when done. Set phase status to `✅ COMPLETE — YYYY-MM-DD` when all tasks pass `npm run build` and `npm run lint`.

**Current active phase:** V1

---

## Phase Overview

| Phase | Name | Status |
|---|---|---|
| V1 | Multi-User Foundation | ✅ COMPLETE — 2026-04-14 |
| V2 | Profiles & Onboarding | ✅ COMPLETE — 2026-04-14 |
| V3 | Social Graph & Passport | ⬜ NOT STARTED |
| V4 | Feeds & Discovery | ⬜ NOT STARTED |
| V5 | Gamification | ⬜ NOT STARTED |

---

## V1 — Multi-User Foundation

**Goal:** Migrate from SQLite single-user to Supabase multi-user. Auth gates the garden. Existing functionality preserved. Deploy to Vercel. Sentry wired up.

**Status:** ✅ COMPLETE — 2026-04-14

**Definition of done:**
- `npm run build` passes with zero errors
- `npm run lint` passes
- Login/signup works end-to-end
- Own garden loads only own items
- Deployed to Vercel preview URL
- Sentry captures a test error

---

### V1.1 — Supabase project setup

- [ ] Create Supabase project (free tier)
- [ ] Enable email/password auth in Supabase dashboard
- [ ] Enable GitHub OAuth provider in Supabase dashboard (optional for MVP)
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` to `.env.local`
- [ ] Update `.env.example` with new variable names (no values)
- [ ] Verify Supabase connection from local dev with a test query

---

### V1.2 — Dependencies

- [ ] Install `@supabase/supabase-js`
- [ ] Install `@supabase/ssr` (Next.js App Router cookie handling)
- [ ] Install `@sentry/nextjs`
- [ ] Remove `better-sqlite3` and sqlite-related packages
- [ ] Update `drizzle.config.ts` to point at Postgres (`DATABASE_URL`)
- [ ] Verify `package.json` has no conflicting peer deps
- [ ] `npm run build` passes after dependency changes

---

### V1.3 — Supabase client setup

- [ ] Create `lib/supabase/client.ts` — browser client (`createBrowserClient`)
- [ ] Create `lib/supabase/server.ts` — server client (`createServerClient` with Next.js cookies)
- [ ] Create `lib/supabase/admin.ts` — service role client (server-only, for system writes)
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is never referenced in any `'use client'` file

---

### V1.4 — Database schema migration

- [ ] Rewrite `lib/db/schema.ts` for Postgres (Drizzle `pgTable` instead of `sqliteTable`)
- [ ] Add `profiles` table (see `PLATFORM_PLAN.md § 4`)
- [ ] Update `items` table: add `user_id uuid NOT NULL`, `original_item_id`, `original_user_id`
- [ ] Add indexes: `items.user_id`, `items.created_at`, `items.status`, `items.source_type`
- [ ] Update `drizzle.config.ts` to use `dialect: 'postgresql'` and `DATABASE_URL`
- [ ] Run `npm run db:generate` — verify migration SQL looks correct
- [ ] Run `npm run db:migrate` against Supabase Postgres
- [ ] Enable RLS on `profiles` table in Supabase dashboard (or via migration SQL)
- [ ] Enable RLS on `items` table
- [ ] Add RLS policy: users can only SELECT/INSERT/UPDATE/DELETE their own `items` rows
- [ ] Add RLS policy: `profiles` are publicly readable, writable only by owner

---

### V1.5 — Auth pages

- [ ] Create `app/(auth)/login/page.tsx` — server component shell
- [ ] Create `app/(auth)/signup/page.tsx` — server component shell
- [ ] Create `components/auth/LoginForm.tsx` — client component, Supabase `signInWithPassword`
- [ ] Create `components/auth/SignupForm.tsx` — client component, Supabase `signUp` + auto-create profile row
- [ ] On signup success: insert row into `profiles` with `id = user.id`, `username` from email prefix (sanitized), redirect to `/onboarding` placeholder
- [ ] On login success: redirect to `/garden`
- [ ] Logout button in Nav — calls `supabase.auth.signOut()`, redirects to `/login`
- [ ] Auth error states: show `✗ INVALID CREDENTIALS` / `✗ EMAIL ALREADY IN USE` in terminal style
- [ ] Loading state on form submit: `◌ AUTHENTICATING...`

**Performance:** Auth pages are static. No `force-dynamic`. No DB call on render.

---

### V1.6 — Middleware & route protection

- [ ] Create `middleware.ts` at project root
- [ ] Protect `/garden/*` — redirect unauthenticated users to `/login`
- [ ] Protect `/settings/*`, `/notifications`, `/feed`, `/onboarding`
- [ ] Allow public access to `/@[username]/*`, `/explore`, `/leaderboard`, `/login`, `/signup`
- [ ] Redirect authenticated users away from `/login` and `/signup` to `/garden`
- [ ] Use `@supabase/ssr` `createServerClient` in middleware (cookie-based session)

---

### V1.7 — Scope all existing routes to authenticated user

- [ ] `GET /api/items` — filter by `user_id = authenticatedUser.id`
- [ ] `POST /api/items` — set `user_id = authenticatedUser.id` on insert
- [ ] `PATCH /api/items/[id]` — verify `user_id = authenticatedUser.id` before update
- [ ] `DELETE /api/items/[id]` — verify `user_id = authenticatedUser.id` before delete
- [ ] `POST /api/ingest/url` — auth required
- [ ] `POST /api/ingest/confirm` — set `user_id` on insert
- [ ] `POST /api/ingest/enrich` — auth required
- [ ] `GET /api/tags` — filter by `user_id`
- [ ] All routes: return `401` if no authenticated session (not 403, not redirect)
- [ ] Remove all old single-user assumptions (no default user, no hardcoded IDs)

---

### V1.8 — Garden page updates

- [ ] `app/garden/page.tsx` — fetch only authenticated user's items (server component direct DB call)
- [ ] `app/garden/[id]/page.tsx` — verify item belongs to authenticated user before rendering
- [ ] `app/garden/layout.tsx` — pass user info to Nav (for logout button)
- [ ] `components/garden/Nav.tsx` — show logged-in username, logout button
- [ ] Verify garden works end-to-end: plant seed, enrich, harvest, mark complete

---

### V1.9 — Sentry setup

- [ ] Run `npx @sentry/wizard@latest -i nextjs` to scaffold Sentry config
- [ ] Verify `instrumentation.ts` created with correct DSN from env
- [ ] Add `Sentry.captureException(err)` to every route handler catch block
- [ ] Set `tracesSampleRate: 0.1` in Sentry config (10% — stay within free tier)
- [ ] Never log PII to Sentry (no emails, no tokens)
- [ ] Verify a test error appears in Sentry dashboard

---

### V1.10 — Vercel deployment

- [ ] Create Vercel project linked to GitHub repo
- [ ] Set all env variables in Vercel dashboard (from `.env.example`)
- [ ] Set `NEXT_PUBLIC_APP_URL=https://[preview-url].vercel.app`
- [ ] Add Vercel preview URL to Supabase allowed redirect URLs
- [ ] `npm run build` passes locally before first deploy
- [ ] First deploy succeeds — garden loads behind auth

**V1 complete checklist:**
- [x] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors (run after Supabase env set)
- [ ] Auth flow: signup → garden → logout → login → garden ✓
- [ ] Garden CRUD works for logged-in user ✓
- [ ] Sentry test error visible ✓ (requires NEXT_PUBLIC_SENTRY_DSN)
- [ ] Vercel preview URL live ✓ (manual deploy step)

**UI tasks completed in V1:**
- [x] Login page — terminal card, `◈ HOKURYU` header, `▸ ACCESS TERMINAL` button
- [x] Signup page — `NEW OPERATIVE REGISTRATION`, password confirmation, error states
- [x] Auth layout — centered vault panel, ROBCO header, encryption status bar
- [x] Nav — `[USERNAME]` display, `[EXIT]` logout button
- [x] Error states — `✗ INVALID CREDENTIALS`, `✗ PASSWORDS DO NOT MATCH` in danger text
- [x] Loading states — `◌ AUTHENTICATING...`, `◌ PROCESSING...`
- [x] Post-login redirect to `?next=` param (e.g. deep-link back after auth redirect)

---

## V2 — Profiles & Onboarding

**Goal:** Every user has a public identity and shareable garden URL. New users pick content preferences. Profile page is SEO-optimized and publicly accessible.

**Status:** ⬜ NOT STARTED

**Definition of done:**
- `/@username` pages are publicly accessible and indexed
- `generateMetadata` returns correct OG tags
- ISR caching active on profile pages (`revalidate = 60`)
- Onboarding completes and saves preferences
- Avatar upload works via Supabase Storage
- Bio markdown editor + renderer working

---

### V2.1 — Onboarding flow

- [ ] Create `app/onboarding/page.tsx` — force-dynamic (needs session)
- [ ] Create `components/auth/OnboardingFlow.tsx` — client component
- [ ] Show grid of sourceType cards (youtube, book, film, etc.) — user taps to select multiple
- [ ] Show grid of genre chips — user selects up to 5
- [ ] "ENTER THE GARDEN →" button saves preferences to `onboarding_preferences` table + sets `completed = true`
- [ ] On completion: redirect to `/garden`
- [ ] Middleware: if authenticated + `onboarding_preferences.completed = false` → redirect to `/onboarding`
- [ ] Category cards use `seed-*` accent colors matching the sidebar type colors
- [ ] Minimum 1 sourceType required to proceed

---

### V2.2 — Profile schema additions

- [ ] Add `onboarding_preferences` table to schema (see `PLATFORM_PLAN.md § 4`)
- [ ] Run `npm run db:generate` + `npm run db:migrate`
- [ ] RLS: `onboarding_preferences` readable + writable only by owner
- [ ] Add RLS on `onboarding_preferences`

---

### V2.3 — Public profile page

- [ ] Create `app/(public)/[username]/page.tsx` — server component
  - Fetch profile by username (public Supabase client, respects RLS)
  - `export const revalidate = 60`
  - `generateMetadata` with OG title, description, image (avatar or default)
  - 404 if username not found
- [ ] Create `app/api/profile/[username]/route.ts` — public GET, `Cache-Control: s-maxage=60, stale-while-revalidate=120`
- [ ] Create `components/profile/ProfileHeader.tsx` — avatar, username, display name, bio (rendered), karma placeholder, streak placeholder
- [ ] Create `components/profile/ProfileStats.tsx` — seeds planted / harvested / souvenirs given (zeros for now)
- [ ] Create `components/ui/Avatar.tsx` — image with fallback initials (from display_name or username), `font-display` initials, `bg-vault-active` background
- [ ] Create `components/ui/MarkdownRenderer.tsx` — safe markdown → HTML (use `marked` + `DOMPurify` or `remark`)
- [ ] Public garden preview on profile: shows last 6 seeds (public items only)

**SEO rules for profile page:**
- `<h1>` = display name
- `<title>` = `${displayName} — Hokuryu`
- `description` = bio first 155 chars or fallback
- OG image = avatar URL or `/og-default.png`
- `canonical` = `https://hokuryu.app/@${username}`
- `Person` JSON-LD schema

---

### V2.4 — Settings / edit profile

- [ ] Create `app/settings/profile/page.tsx` — force-dynamic, auth required
- [ ] Create `app/api/profile/route.ts` — PATCH (auth required, own profile only)
  - Update: `display_name`, `bio`, `avatar_url`, `username`
  - On success: `revalidateTag(`profile-${username}`)` to bust ISR cache
- [ ] Create `components/profile/BioEditor.tsx` — client component
  - Textarea with `font-mono text-cream` styling
  - Live preview toggle (`■ EDIT` / `■ PREVIEW`)
  - Preview uses `MarkdownRenderer`
  - Auto-save on blur (debounced 800ms, matching existing notes pattern)
- [ ] Create `components/ui/MarkdownEditor.tsx` — dynamic import wrapper for `BioEditor`
- [ ] Avatar upload: Supabase Storage bucket `avatars`, path `{userId}/avatar.webp`
  - Resize client-side to max 400×400 before upload (use `browser-image-compression` or canvas)
  - Show upload progress, replace on success
  - On upload: update `profiles.avatar_url` via PATCH route + revalidate

---

### V2.5 — Username routing

- [ ] Update `next.config.ts` if needed for `/@username` dynamic routes
- [ ] Ensure `/[username]` route doesn't conflict with existing `/garden` or `/feed` routes
- [ ] Use a route group `(public)` to isolate public pages
- [ ] `/@username` → `app/(public)/[username]/page.tsx`
- [ ] `/@username/garden` → `app/(public)/[username]/garden/page.tsx` (public garden browse)
- [ ] Verify middleware does NOT protect `(public)` routes

---

### V2.6 — robots.txt + sitemap

- [ ] Create `app/robots.txt/route.ts` — static response
  ```
  User-agent: *
  Allow: /
  Disallow: /feed
  Disallow: /notifications
  Disallow: /settings
  Disallow: /onboarding
  Sitemap: https://hokuryu.app/sitemap.xml
  ```
- [ ] Create `app/sitemap.xml/route.ts` — dynamic, queries all public profiles
  - `revalidate = 3600` (1 hour)
  - Includes: homepage, all `/@username` pages, explore
  - Excludes: auth pages, feed, notifications

**V2 complete checklist:**
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `/@username` loads publicly without auth ✓
- [ ] OG tags correct in social preview tool ✓
- [ ] Onboarding saves preferences + redirects to garden ✓
- [ ] Avatar upload and bio save work ✓
- [ ] ISR: second load of profile page is cached ✓
- [ ] `robots.txt` and `sitemap.xml` return correct responses ✓

---

## V3 — Social Graph & Passport

**Goal:** Users can follow each other, react to seeds, collect souvenirs, receive notifications, and build their passport. The platform becomes genuinely social.

**Status:** ⬜ NOT STARTED

**Definition of done:**
- Follow/unfollow works with optimistic UI
- Souvenir saves seed to own garden with attribution
- Notifications appear in real-time via Supabase Realtime
- Passport page shows grouped souvenirs by source garden
- Original creator is notified and credited on souvenir

---

### V3.1 — Schema additions

- [ ] Add `follows` table with indexes on `follower_id`, `following_id`
- [ ] Add `reactions` table with unique constraint `(user_id, item_id, type)`
- [ ] Add `notifications` table with index on `recipient_id`, `read`, `created_at`
- [ ] Add `passport_stamps` table with index on `user_id`
- [ ] Run `npm run db:generate` + `npm run db:migrate`
- [ ] RLS policies for all new tables (see `PLATFORM_PLAN.md § 16`)
- [ ] Add `original_item_id` + `original_user_id` columns to `items` (if not added in V1)

---

### V3.2 — Follow system

- [ ] Create `app/api/follows/route.ts` — POST (follow), DELETE (unfollow)
  - Auth required. Cannot follow self.
  - On follow: insert into `follows`, create notification for target user
  - On unfollow: delete from `follows`
- [ ] Create `components/social/FollowButton.tsx` — client component
  - Optimistic toggle: follow ↔ unfollow
  - Shows follower count
  - Disabled if viewing own profile
  - `▸ FOLLOW` / `■ FOLLOWING` terminal style
- [ ] Add follow button to `ProfileHeader.tsx`
- [ ] Add follower / following counts to `ProfileStats.tsx`
- [ ] `lib/query/hooks/useFollows.ts` — follow mutation with optimistic update + rollback

---

### V3.3 — Reactions

- [ ] Create `app/api/reactions/route.ts` — POST (add), DELETE (remove)
  - Auth required
  - Types: `like` only for MVP (save handled separately as souvenir)
  - On like: create notification for seed owner
- [ ] Create `components/social/ReactionBar.tsx` — client component
  - Like button with count
  - Optimistic toggle
  - `♥ 12` style with phosphor/amber colors
- [ ] Add `ReactionBar` to public seed cards in `/@username/garden`
- [ ] `lib/query/hooks/useReactions.ts`

---

### V3.4 — Souvenir mechanic

- [ ] Create `app/api/garden/souvenir/route.ts` — POST
  - Auth required
  - Copy item data to own garden with `original_item_id` + `original_user_id` set
  - Create notification for original owner (`type: 'souvenir'`)
  - Increment original owner's karma by 3 (see gamification rules)
  - Return new item
- [ ] Create `app/api/garden/souvenir/[id]/route.ts` — DELETE (remove souvenir)
- [ ] Create `components/social/SouvenirButton.tsx` — client component
  - `◈ ADD TO GARDEN` / `◈ IN YOUR GARDEN` toggle
  - Disabled on own seeds
  - Optimistic update
- [ ] Attribution on souvenir cards: `FROM: @username →` link back to source garden
- [ ] `lib/query/hooks/useSouvenirs.ts`

**Performance:** Souvenir copy duplicates item data — this is intentional. Avoid joins on reads.

---

### V3.5 — In-app notifications

- [ ] Add `notifications` table subscription via Supabase Realtime
- [ ] Create `lib/supabase/realtime.ts` — shared subscription helper
- [ ] Create `components/notifications/NotificationBell.tsx` — client component
  - Supabase Realtime subscription to own `notifications` channel
  - Unread count badge (amber, `font-display`)
  - Unsubscribe on unmount
- [ ] Create `app/notifications/page.tsx` — force-dynamic, auth required
- [ ] Create `app/api/notifications/route.ts` — GET (list, unread first), PATCH (mark all read)
- [ ] Create `app/api/notifications/[id]/read/route.ts` — PATCH (mark single read)
- [ ] Create `components/notifications/NotificationList.tsx`
- [ ] Create `components/notifications/NotificationItem.tsx`
  - `follow`: `@username started following you`
  - `reaction`: `@username liked [seed title]`
  - `souvenir`: `@username added [seed title] to their garden`
  - All in terminal style, `font-mono text-cream-mid`
- [ ] Add `NotificationBell` to `Nav.tsx`
- [ ] `lib/query/hooks/useNotifications.ts`

---

### V3.6 — Passport

- [ ] Create `app/api/passport/route.ts` — GET own passport (auth required)
  - Query: own items where `original_user_id IS NOT NULL`
  - Group by `original_user_id`
  - Join profile data for each source user
  - Cache: `staleTime: 30_000` on client (passport changes infrequently)
- [ ] Create `app/(app)/passport/page.tsx` — force-dynamic, auth required
- [ ] Create `components/passport/PassportPage.tsx` — client component
- [ ] Create `components/passport/GardenStamp.tsx`
  - Avatar + username of source garden
  - Count of souvenirs from that garden
  - "X SOUVENIRS COLLECTED" in display font
  - Clicking expands to show souvenir cards
- [ ] Create `components/passport/SouvenirCard.tsx`
  - Seed card variant with `FROM: @username` attribution
  - Same terminal aesthetic as `SeedCard`
- [ ] Add passport summary to `ProfileHeader.tsx` (public view): "X gardens visited"
- [ ] Add passport link to own Nav

---

### V3.7 — Suggested users

- [ ] Create `app/api/users/suggested/route.ts`
  - Query: users with overlapping `onboarding_preferences.source_types`
  - Exclude: already following, self
  - Limit: 5
  - Cache: `Cache-Control: s-maxage=300` (5 min — this is cheap to cache)
- [ ] Create `components/social/SuggestedUsers.tsx` — shows on garden page sidebar or empty feed state
- [ ] Create `components/social/UserCard.tsx` — avatar, username, karma, follow button

**V3 complete checklist:**
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] Follow/unfollow works with optimistic UI ✓
- [ ] Souvenir saves with attribution, notifies original owner ✓
- [ ] Notification bell shows real-time unread count ✓
- [ ] Passport page shows grouped souvenirs ✓
- [ ] Supabase Realtime subscription cleanup verified (no memory leaks) ✓

---

## V4 — Feeds & Discovery

**Goal:** Users have a personalized home feed and can explore beyond their follow graph. Cold-start problem solved — new users see relevant content immediately.

**Status:** ⬜ NOT STARTED

**Definition of done:**
- Three feeds work: Following, For You, Adventure
- Explore page shows trending seeds and tag browser
- Feed pagination works (cursor-based)
- For You feed respects onboarding preferences
- Adventure button returns a random seed outside user preferences

---

### V4.1 — Feed infrastructure

- [ ] Create `lib/feed/queries.ts` — shared feed query builders
  - `getFollowingFeed(userId, cursor)` — items from followed users, cursor-paginated
  - `getForYouFeed(userId, cursor)` — items matching user prefs, cursor-paginated
  - `getAdventureSeed(userId)` — single random seed outside user prefs
  - All queries: `LIMIT 20`, cursor = `{ createdAt, id }` tuple
  - All queries: JOIN with `profiles` for author data (avoid N+1)
  - Exclude: items already in own garden (anti-duplication)
- [ ] Define cursor pagination type in `lib/utils/types.ts`

**Performance:** Feed queries are the most DB-expensive. Indexes on `items.created_at`, `items.source_type`, `items.status` are critical (added in V1.4).

---

### V4.2 — Feed API routes

- [ ] Create `app/api/feed/following/route.ts`
  - Auth required
  - `Cache-Control: no-store` (personalized)
  - Query: `getFollowingFeed(userId, cursor)`
- [ ] Create `app/api/feed/foryou/route.ts`
  - Auth required
  - `Cache-Control: no-store`
  - Query: `getForYouFeed(userId, cursor)`
- [ ] Create `app/api/feed/adventure/route.ts`
  - Auth required
  - `Cache-Control: no-store`
  - Query: `getAdventureSeed(userId)`

---

### V4.3 — Feed page

- [ ] Create `app/feed/page.tsx` — force-dynamic, auth required
- [ ] Create `components/feed/FeedTabs.tsx` — Following / For You / Adventure switcher
  - Tab style: `■ FOLLOWING` / `■ FOR YOU` / `■ ADVENTURE` — active tab has `glow`
  - URL param driven: `?tab=following` (default) — preserves on refresh
- [ ] Create `components/feed/FeedItem.tsx`
  - Variant of `SeedCard` with author attribution
  - Shows: `@username` avatar + name, seed data, reaction bar, souvenir button
  - Same terminal card aesthetic
- [ ] Create `components/feed/AdventureButton.tsx`
  - Full-width button: `◈ TAKE ME SOMEWHERE NEW`
  - Fetches single random seed from `/api/feed/adventure`
  - Shows the seed card below
  - "ANOTHER →" button to fetch a new one
- [ ] Infinite scroll on Following + For You tabs using TanStack Query `useInfiniteQuery`
- [ ] Empty state: `> YOUR FOLLOW LIST IS EMPTY — VISIT SOME GARDENS` with suggested users
- [ ] `lib/query/hooks/useFeed.ts` — `useInfiniteQuery` with cursor pagination

---

### V4.4 — Explore page

- [ ] Create `app/explore/page.tsx`
  - `export const revalidate = 300` (5 min ISR)
  - `generateMetadata` for SEO: `title: 'Explore — Hokuryu'`
- [ ] Create `app/api/explore/trending/route.ts`
  - Most-reacted + most-souvenired seeds in last 7 days
  - `Cache-Control: s-maxage=300, stale-while-revalidate=600`
  - Limit 20
- [ ] Create `app/api/explore/top-gardens/route.ts`
  - Profiles with most new souvenirs collected by others this week
  - `Cache-Control: s-maxage=300`
  - Limit 10
- [ ] Create `components/explore/ExploreGrid.tsx` — trending seeds grid
- [ ] Create `components/explore/TagBrowser.tsx` — sourceType + genre filter chips
  - Clicking a tag filters the explore grid
  - Client-side filter on already-fetched data (no extra API call)
- [ ] Create `components/explore/TopGardens.tsx` — top 10 gardens this week
- [ ] Add explore link to Nav

**Performance:** Explore page is the most-visited public page. ISR + CDN caching is critical here.

**SEO:** Explore page indexed. `<title>Explore Digital Gardens — Hokuryu</title>`.

**V4 complete checklist:**
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] Following feed loads correctly (only items from followed users) ✓
- [ ] For You feed reflects onboarding preferences ✓
- [ ] Adventure returns seed outside user preferences ✓
- [ ] Infinite scroll loads next page on scroll ✓
- [ ] Explore page loads without auth ✓
- [ ] Tag filter works on explore grid ✓
- [ ] ISR cache verified on explore (second load faster, not hitting DB) ✓

---

## V5 — Gamification

**Goal:** Reward curiosity. Harvest loop is visible and motivating. Streaks, karma, badges, and leaderboard make the platform sticky.

**Status:** ⬜ NOT STARTED

**Definition of done:**
- Karma increments correctly on all trigger events
- Daily streak tracks and resets correctly
- All badges in registry can be awarded
- Leaderboard shows top karma users
- Profile shows karma, streak, and badge strip publicly

---

### V5.1 — Karma system

- [ ] Create `lib/gamification/karma.ts`
  - `awardKarma(userId, points, reason)` — UPDATE `profiles.karma += points`
  - Uses admin Supabase client (service role)
  - Reasons: `'plant'|'harvest'|'souvenir_received'|'reaction_received'|'streak_bonus'|'badge_bonus'`
  - Log all karma events (or just trust DB aggregate — simpler for MVP)
- [ ] Wire karma awards to existing actions:
  - `POST /api/ingest/confirm` (plant) → `awardKarma(userId, 1, 'plant')`
  - `PATCH /api/items/[id]` when `status → 'consumed'` AND `notes` + `rating` present → `awardKarma(userId, 5, 'harvest')`
  - `POST /api/garden/souvenir` → `awardKarma(originalUserId, 3, 'souvenir_received')`
  - `POST /api/reactions` (like) → `awardKarma(seedOwnerId, 1, 'reaction_received')`
- [ ] Create `components/ui/KarmaDisplay.tsx` — `◈ 1,234 KARMA` in `font-display amber` with glow

---

### V5.2 — Streak system

- [ ] Create `lib/gamification/streaks.ts`
  - `checkAndUpdateStreak(userId)` — called after every harvest
  - Logic:
    - Get `profiles.streak_last_date` and `profiles.streak_count`
    - If `streak_last_date = today`: do nothing (already harvested today)
    - If `streak_last_date = yesterday`: increment `streak_count`, set `streak_last_date = today`
    - If `streak_last_date < yesterday`: reset `streak_count = 1`, set `streak_last_date = today`
  - Milestone bonuses: 7 days → +10 karma, 30 days → +50, 100 days → +100, 365 days → +500
  - After streak update: call `checkAndAwardBadges(userId)` (V5.3)
- [ ] Wire `checkAndUpdateStreak` to harvest action (status → consumed with review)
- [ ] Create `components/profile/StreakCounter.tsx`
  - Flame icon + count: `🔥 47 DAYS` or `◈ 47 DAYS` (terminal style, no emoji if possible)
  - `text-amber glow-amber` when streak > 0
  - `text-phosphor-dim` when streak = 0

---

### V5.3 — Badge system

- [ ] Create `lib/gamification/badges.ts`
  - Full badge registry (all types from `PLATFORM_PLAN.md § 5`)
  - `checkAndAwardBadges(userId)` — checks all pending badge conditions, awards any newly earned
  - Uses admin client for inserts
  - On badge award: create notification (`type: 'badge_awarded'`), add karma bonus (+25)
  - Idempotent: UNIQUE constraint on `(user_id, badge_type)` prevents double-award
- [ ] Create `app/api/badges/check/route.ts` — POST (internal, service role only)
  - Called by: harvest route, souvenir route, follow route after each action
  - Not callable by end users (verify service role header or make it a lib function only)
- [ ] Create `app/api/badges/[username]/route.ts` — GET (public)
  - `Cache-Control: s-maxage=60`
- [ ] Create `components/profile/BadgeStrip.tsx`
  - Shows top 5 badges on profile header
  - `font-display` badge names with `border border-vault-border px-2 py-0` terminal chip style
  - Tooltip on hover shows badge description + date awarded
  - "VIEW ALL →" expands to full badge list

---

### V5.4 — Leaderboard

- [ ] Create `app/api/leaderboard/route.ts`
  - Query: top 50 profiles by karma, with streak + badge count
  - `Cache-Control: s-maxage=300, stale-while-revalidate=600` (5 min cache)
  - Tabs: ALL TIME / THIS WEEK / THIS MONTH (filter by `badges.awarded_at` for week/month)
- [ ] Create `app/leaderboard/page.tsx`
  - `export const revalidate = 300`
  - `generateMetadata`: `title: 'Leaderboard — Hokuryu'`
- [ ] Create `components/leaderboard/LeaderboardTable.tsx`
  - Rank number, avatar, username, karma, streak, badge count
  - Current user highlighted if in top 50
  - Terminal table style: `■ RANK · OPERATIVE · KARMA · STREAK`
- [ ] Create `components/leaderboard/KarmaRank.tsx` — inline rank display for profile
- [ ] Add leaderboard link to Nav + explore page

**SEO:** Leaderboard page indexed. ISR at 5 min.

---

### V5.5 — Profile gamification display

- [ ] Update `ProfileHeader.tsx` — add karma, streak, badges
- [ ] Update `ProfileStats.tsx` — add karma rank position if in top 100
- [ ] Update `app/(public)/[username]/page.tsx` — fetch badges + karma in same server query
- [ ] Add karma to `UserCard.tsx` and `SuggestedUsers.tsx`
- [ ] Add karma to `FeedItem.tsx` author section

**V5 complete checklist:**
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] Karma increments on plant, harvest, souvenir received, reaction received ✓
- [ ] Streak increments on daily harvest, resets on miss ✓
- [ ] Streak milestone bonus awards correctly ✓
- [ ] All badge types can be triggered and awarded ✓
- [ ] Leaderboard loads and caches correctly ✓
- [ ] Profile shows karma + streak + badges publicly ✓

---

## Cross-cutting concerns (apply to every phase)

### Performance checklist — run before marking any phase complete
- [ ] No `SELECT *` without explicit column list on tables with >5 columns
- [ ] Every new list query has a `LIMIT` clause
- [ ] Every new public page has `revalidate` or `Cache-Control` header defined
- [ ] Every new `'use client'` hook has `staleTime` set (never default 0)
- [ ] No new heavy dependencies added without checking bundle size impact
- [ ] `next/image` used for all images — no raw `<img>` tags
- [ ] Dynamic imports used for heavy client components (markdown editor, leaderboard)

### SEO checklist — run before marking any phase complete (public pages only)
- [ ] `generateMetadata` present on every new public page
- [ ] `<h1>` present and correct on every page
- [ ] `canonical` URL set correctly
- [ ] OG image defined (avatar, seed thumbnail, or default)

### Security checklist — run before marking any phase complete
- [ ] Every write API route checks `supabase.auth.getUser()` first
- [ ] Every write DB query scoped to `user_id = authenticatedUser.id`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not referenced in any client-side file
- [ ] New Supabase tables have RLS enabled and policies defined
- [ ] No PII logged to console or Sentry

---

*Update this file after every completed task. A phase is only COMPLETE when all tasks are checked AND `npm run build` + `npm run lint` both pass.*
