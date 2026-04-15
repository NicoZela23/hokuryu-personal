import type { PublicProfile } from '@/lib/utils/types'

type Props = { profile: PublicProfile }

function ProfileStats({ profile }: Props) {
  const stats = [
    { label: 'SEEDS PLANTED',   value: profile.seedCount },
    { label: 'SEEDS HARVESTED', value: profile.harvestCount },
  ]

  return (
    <section className="border border-vault-border bg-vault-card">
      <p className="font-display text-sm text-phosphor-dim tracking-widest px-4 py-2 border-b border-vault-border">
        ■ GARDEN STATS
      </p>
      <div className="grid grid-cols-2 divide-x divide-vault-border">
        {stats.map(({ label, value }) => (
          <div key={label} className="px-4 py-4 text-center">
            <p className="font-display text-3xl text-phosphor-bright tracking-widest">
              {value.toLocaleString()}
            </p>
            <p className="font-display text-sm text-phosphor-dim tracking-widest mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export { ProfileStats }
