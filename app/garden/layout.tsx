'use client'

import { useState, Suspense } from 'react'
import { Nav } from '@/components/garden/Nav'
import { Sidebar } from '@/components/garden/Sidebar'

export default function GardenLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-vault">
      {/* Terminal frame — centered on very large screens */}
      <div className="max-w-[1800px] mx-auto min-h-screen flex flex-col 3xl:border-x 3xl:border-vault-border" style={{ boxShadow: 'none' }}>
        <Nav onMenuOpen={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Suspense fallback={null}>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </Suspense>
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>

        {/* Terminal status bar — bottom of screen on large displays */}
        <div className="hidden 3xl:flex items-center justify-between px-6 py-1 border-t border-vault-border bg-vault-panel shrink-0">
          <span className="font-display text-sm text-phosphor-dim tracking-widest">
            GRONE INDUSTRIES UNIFIED OPERATING SYSTEM — COPYRIGHT 2075 GRONE INDUSTRIES
          </span>
          <span className="font-display text-sm text-phosphor-dim tracking-widest">
            TERMINAL v1.0.6 &nbsp;·&nbsp; SYS:OK
          </span>
        </div>
      </div>
    </div>
  )
}
