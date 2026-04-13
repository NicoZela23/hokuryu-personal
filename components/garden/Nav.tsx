'use client'

import { Suspense } from 'react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { FilterBar } from './FilterBar'

function Nav() {
  return (
    <nav className="sticky top-0 z-10 h-14 flex items-center gap-4 px-6 md:px-12 lg:px-20 bg-paper/80 dark:bg-forest/80 backdrop-blur-sm border-b border-ink-faint dark:border-moss-ink/20">
      <div className="flex-none">
        <Logo />
      </div>
      <div className="flex-1 flex justify-center">
        <Suspense>
          <FilterBar />
        </Suspense>
      </div>
      <div className="flex-none flex items-center gap-3">
        <ThemeToggle />
      </div>
    </nav>
  )
}

export { Nav }
