import { notFound } from 'next/navigation'
import { desc, eq, and, count } from 'drizzle-orm'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { profiles, items } from '@/lib/db/schema'
import { getOptionalUser } from '@/lib/utils/auth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileStats } from '@/components/profile/ProfileStats'
import type { PublicProfile, Item } from '@/lib/utils/types'

export const revalidate = 60

type Props = { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [profile] = await db
    .select({ displayName: profiles.displayName, username: profiles.username, bio: profiles.bio, avatarUrl: profiles.avatarUrl })
    .from(profiles)
    .where(eq(profiles.username, params.username))
    .limit(1)

  if (!profile) return { title: 'Not Found — Hokuryu' }

  const name = profile.displayName ?? profile.username
  const desc = profile.bio ? profile.bio.slice(0, 155) : `${profile.username}'s digital garden on Hokuryu`

  return {
    title:       `${name} — Hokuryu`,
    description: desc,
    openGraph: {
      title:       `${name}'s Garden — Hokuryu`,
      description: desc,
      images:      [profile.avatarUrl ?? '/og-default.png'],
      type:        'profile',
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/u/${profile.username}` },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const [currentUser, profileRow] = await Promise.all([
    getOptionalUser(),
    db
      .select()
      .from(profiles)
      .where(eq(profiles.username, params.username))
      .limit(1)
      .then(r => r[0] ?? null),
  ])

  if (!profileRow) notFound()

  const [{ seedCount }, { harvestCount }, recentItems] = await Promise.all([
    db.select({ seedCount: count() }).from(items).where(eq(items.userId, profileRow.id)).then(r => r[0]),
    db.select({ harvestCount: count() }).from(items).where(and(eq(items.userId, profileRow.id), eq(items.status, 'consumed'))).then(r => r[0]),
    db
      .select({
        id:         items.id,
        title:      items.title,
        sourceType: items.sourceType,
        status:     items.status,
        thumbnail:  items.thumbnail,
        author:     items.author,
        rating:     items.rating,
        createdAt:  items.createdAt,
      })
      .from(items)
      .where(eq(items.userId, profileRow.id))
      .orderBy(desc(items.createdAt))
      .limit(6),
  ])

  const publicProfile: PublicProfile = {
    id:                  profileRow.id,
    username:            profileRow.username,
    displayName:         profileRow.displayName,
    bio:                 profileRow.bio,
    avatarUrl:           profileRow.avatarUrl,
    karma:               profileRow.karma,
    streakCount:         profileRow.streakCount,
    contentPrefs:        profileRow.contentPrefs,
    onboardingCompleted: profileRow.onboardingCompleted,
    createdAt:           profileRow.createdAt,
    seedCount,
    harvestCount,
  }

  const isOwn = currentUser?.id === profileRow.id

  return (
    <main className="min-h-screen bg-vault">
      {/* Nav bar */}
      <nav className="bg-vault-panel border-b border-vault-border px-4 md:px-8 py-2 flex items-center justify-between">
        <p className="font-display text-sm text-phosphor-dim tracking-widest hidden md:block">
          HOKU INDUSTRIES UNIFIED OPERATING SYSTEM
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-lg text-phosphor tracking-widest hover:text-phosphor-bright transition-colors">
            ◈ HOKURYU
          </Link>
          {currentUser ? (
            <Link href="/garden" className="font-display text-base text-phosphor-dim tracking-widest hover:text-phosphor transition-colors">
              ▸ MY GARDEN
            </Link>
          ) : (
            <Link href="/login" className="font-display text-base text-phosphor-dim tracking-widest hover:text-phosphor transition-colors">
              ▸ LOGIN
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <ProfileHeader profile={publicProfile} isOwn={isOwn} />
        <ProfileStats profile={publicProfile} />

        {/* Recent seeds */}
        <section className="border border-vault-border bg-vault-card">
          <p className="font-display text-sm text-phosphor-dim tracking-widest px-4 py-2 border-b border-vault-border">
            ■ RECENT SEEDS
          </p>

          {recentItems.length === 0 ? (
            <p className="font-display text-base text-phosphor-dim tracking-widest px-4 py-6">
              &gt; NO SEEDS IN THIS GARDEN YET
            </p>
          ) : (
            <ul className="divide-y divide-vault-border">
              {recentItems.map((item) => (
                <li key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <span
                    className="font-display text-sm tracking-widest shrink-0"
                    style={{ color: `var(--tw-color-seed-${item.sourceType}, #7a7a6a)` }}
                  >
                    [{item.sourceType.toUpperCase()}]
                  </span>
                  <span className="font-mono text-sm text-cream flex-1 truncate">{item.title}</span>
                  {item.status === 'consumed' && item.rating && (
                    <span className="font-display text-sm text-amber tracking-widest shrink-0">
                      {'★'.repeat(item.rating)}
                    </span>
                  )}
                  {item.status === 'consumed' ? (
                    <span className="font-display text-xs text-phosphor-dim tracking-widest shrink-0">[HARVESTED]</span>
                  ) : (
                    <span className="font-display text-xs text-amber tracking-widest shrink-0">[PLANTED]</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* JSON-LD Person schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'Person',
              name:       publicProfile.displayName ?? publicProfile.username,
              url:        `${process.env.NEXT_PUBLIC_APP_URL}/u/${publicProfile.username}`,
              image:      publicProfile.avatarUrl ?? undefined,
              description: publicProfile.bio ?? undefined,
            }),
          }}
        />
      </div>
    </main>
  )
}
