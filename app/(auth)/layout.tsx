import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HOKURYU — ACCESS TERMINAL',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-vault flex flex-col">
      {/* System header */}
      <div className="px-6 py-2 border-b border-vault-border bg-vault-panel shrink-0">
        <p className="font-display text-sm text-phosphor-dim tracking-widest text-center">
          HOKU INDUSTRIES UNIFIED OPERATING SYSTEM — COPYRIGHT 2075 HOKU INDUSTRIES
        </p>
      </div>

      {/* Centered auth card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-6 py-1 border-t border-vault-border bg-vault-panel shrink-0">
        <p className="font-display text-sm text-phosphor-dim tracking-widest text-center">
          SECURE CHANNEL ESTABLISHED &nbsp;·&nbsp; ENCRYPTION: ACTIVE
        </p>
      </div>
    </div>
  )
}
