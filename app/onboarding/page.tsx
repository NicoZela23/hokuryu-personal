import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/utils/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { OnboardingFlow } from '@/components/auth/OnboardingFlow'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const user = await requireAuth()

  const [profile] = await db
    .select({ onboardingCompleted: profiles.onboardingCompleted })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (profile?.onboardingCompleted) redirect('/garden')

  return (
    <div className="min-h-screen bg-vault flex flex-col">
      {/* System header */}
      <div className="px-6 py-2 border-b border-vault-border bg-vault-panel shrink-0">
        <p className="font-display text-sm text-phosphor-dim tracking-widest text-center">
          HOKU INDUSTRIES UNIFIED OPERATING SYSTEM — COPYRIGHT 2075 HOKU INDUSTRIES
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="border border-vault-border bg-vault-card p-6 space-y-2">
            <h1 className="font-display text-4xl text-phosphor-bright tracking-widest">
              ◈ HOKURYU
            </h1>
            <p className="font-display text-xl text-phosphor tracking-widest">
              OPERATIVE INTAKE — CALIBRATING GARDEN
            </p>
            <p className="font-mono text-sm text-cream-mid">
              Tell us what you consume. We&apos;ll use this to surface relevant content.
            </p>
          </div>

          {/* Flow */}
          <div className="border border-vault-border bg-vault-card p-6">
            <OnboardingFlow />
          </div>
        </div>
      </div>

      <div className="px-6 py-1 border-t border-vault-border bg-vault-panel shrink-0">
        <p className="font-display text-sm text-phosphor-dim tracking-widest text-center">
          CALIBRATION IN PROGRESS &nbsp;·&nbsp; PLEASE STAND BY
        </p>
      </div>
    </div>
  )
}
