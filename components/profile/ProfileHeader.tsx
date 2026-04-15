import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import type { PublicProfile } from '@/lib/utils/types'

type Props = {
  profile:   PublicProfile
  isOwn?:    boolean
}

function ProfileHeader({ profile, isOwn = false }: Props) {
  const displayName = profile.displayName ?? profile.username

  return (
    <section className="border border-vault-border bg-vault-card p-6 space-y-4">
      {/* Header row */}
      <div className="flex items-start gap-4">
        <Avatar avatarUrl={profile.avatarUrl} username={profile.username} size={72} />

        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="font-display text-3xl text-phosphor-bright tracking-widest leading-none">
            {displayName.toUpperCase()}
          </h1>
          <p className="font-display text-lg text-phosphor-dim tracking-widest">
            @{profile.username}
          </p>

          {/* Karma */}
          <p className="font-display text-base text-amber tracking-widest">
            ◈ {profile.karma.toLocaleString()} KARMA
          </p>
        </div>

        {isOwn && (
          <Link
            href="/settings/profile"
            className="font-display text-base tracking-widest border border-vault-border text-phosphor-dim px-3 py-1 hover:border-phosphor hover:text-phosphor transition-colors shrink-0"
          >
            ◈ EDIT PROFILE
          </Link>
        )}
      </div>

      {/* Bio */}
      {profile.bio ? (
        <div className="border-t border-vault-border pt-4">
          <p className="font-display text-sm text-phosphor-dim tracking-widest mb-2">■ BIO</p>
          <div className="font-mono text-sm text-cream">
            <MarkdownRenderer content={profile.bio} />
          </div>
        </div>
      ) : isOwn ? (
        <div className="border-t border-vault-border pt-4">
          <Link
            href="/settings/profile"
            className="font-display text-sm text-phosphor-dim tracking-widest hover:text-phosphor transition-colors"
          >
            &gt; NO BIO SET — CLICK TO ADD ONE
          </Link>
        </div>
      ) : null}

      {/* Streak */}
      {profile.streakCount > 0 && (
        <p className="font-display text-base text-amber-bright tracking-widest">
          ◈ {profile.streakCount} DAY STREAK
        </p>
      )}
    </section>
  )
}

export { ProfileHeader }
