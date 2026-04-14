'use client'

import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

type Props = { onMenuOpen: () => void }

function Nav({ onMenuOpen }: Props) {
  return (
    <nav className="sticky top-0 z-10 bg-vault-panel border-b border-vault-border" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
      {/* System header */}
      <div className="px-4 md:px-6 py-1 border-b border-vault-border/50 hidden md:block">
        <p className="font-display text-sm text-phosphor-dim tracking-widest">
          ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM — COPYRIGHT 2075 ROBCO INDUSTRIES
        </p>
      </div>

      {/* Main nav bar */}
      <div className="h-12 flex items-center gap-3 px-4 md:px-6">
        <button
          onClick={onMenuOpen}
          aria-label="open menu"
          className="lg:hidden flex-none p-1 text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none font-display text-2xl leading-none"
        >
          ≡
        </button>

        <div className="flex-none">
          <Logo />
        </div>

        <div className="flex-1 hidden md:flex items-center gap-2 ml-6">
          <span className="font-display text-lg text-phosphor-dim tracking-widest">
            // MEDIA ARCHIVE v1.0
          </span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="font-display text-base text-phosphor-dim tracking-widest hidden sm:block animate-blink">
            ▌
          </span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}

export { Nav }
