'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { sidebarVariants, overlayVariants } from '@/lib/animations'
import { SOURCE_TYPES } from '@/lib/utils/types'

type Props = {
  open:    boolean
  onClose: () => void
}

const categoryLabels: Record<string, string> = {
  youtube:   'VIDEO',
  spotify:   'MUSIC',
  tiktok:    'CLIPS',
  instagram: 'IMAGE',
  x:         'POSTS',
  article:   'ARTICLES',
  podcast:   'PODCASTS',
  film:      'FILMS',
  book:      'BOOKS',
  concert:   'CONCERTS',
  generic:   'OTHER',
}

const categoryColors: Record<string, string> = {
  youtube:   'text-seed-youtube',
  spotify:   'text-seed-spotify',
  tiktok:    'text-seed-tiktok',
  instagram: 'text-seed-instagram',
  x:         'text-seed-x',
  article:   'text-seed-article',
  podcast:   'text-seed-podcast',
  film:      'text-seed-film',
  book:      'text-seed-book',
  concert:   'text-seed-concert',
  generic:   'text-seed-generic',
}

const STATUS_OPTIONS = [
  { label: 'ALL',       value: undefined as string | undefined },
  { label: 'ACTIVE',    value: 'pending'  },
  { label: 'COMPLETED', value: 'consumed' },
]

function Sidebar({ open, onClose }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const shouldReduce = useReducedMotion()

  const currentType   = searchParams.get('type')   ?? undefined
  const currentStatus = searchParams.get('status') ?? undefined

  function navigate(type?: string, status?: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (type)   params.set('type', type)
    else        params.delete('type')
    if (status) params.set('status', status)
    else        params.delete('status')
    router.push(`/garden?${params.toString()}`)
    onClose()
  }

  const navContent = (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xl text-phosphor-dim tracking-widest mb-2 border-b border-vault-border pb-1">
          ■ TYPE INDEX
        </p>
        <div className="space-y-0.5">
          <button
            onClick={() => navigate(undefined, currentStatus)}
            className={`w-full text-left font-display text-xl tracking-widest px-2 py-1 transition-colors focus:outline-none ${
              !currentType
                ? 'text-phosphor-bright glow bg-vault-active'
                : 'text-phosphor-dim hover:text-phosphor hover:bg-vault-hover'
            }`}
          >
            {!currentType ? '► ' : '  '}ALL RECORDS
          </button>
          {SOURCE_TYPES.map((type) => {
            const isActive = currentType === type
            const color    = isActive ? categoryColors[type] : 'text-phosphor-dim'
            return (
              <button
                key={type}
                onClick={() => navigate(type, currentStatus)}
                className={`w-full text-left font-display text-xl tracking-widest px-2 py-1 transition-colors focus:outline-none hover:bg-vault-hover ${
                  isActive ? `bg-vault-active ${color}` : `${color} hover:text-phosphor`
                }`}
              >
                {isActive ? '► ' : '  '}{categoryLabels[type]}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="font-display text-xl text-phosphor-dim tracking-widest mb-2 border-b border-vault-border pb-1">
          ■ STATUS
        </p>
        <div className="space-y-0.5">
          {STATUS_OPTIONS.map((s) => {
            const isActive = currentStatus === s.value
            return (
              <button
                key={s.label}
                onClick={() => navigate(currentType, s.value)}
                className={`w-full text-left font-display text-xl tracking-widest px-2 py-1 transition-colors focus:outline-none hover:bg-vault-hover ${
                  isActive
                    ? 'text-phosphor-bright glow bg-vault-active'
                    : 'text-phosphor-dim hover:text-phosphor'
                }`}
              >
                {isActive ? '► ' : '  '}{s.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const slideVars = shouldReduce ? { hidden: {}, visible: {}, exit: {} } : sidebarVariants
  const bgVars    = shouldReduce ? { hidden: {}, visible: {}, exit: {} } : overlayVariants

  return (
    <>
      {/* Desktop sidebar — wider on larger screens */}
      <aside className="hidden lg:flex flex-col w-56 xl:w-64 2xl:w-72 3xl:w-80 flex-none sticky top-0 h-screen overflow-y-auto border-r border-vault-border bg-vault-panel shrink-0">
        <div className="px-4 py-4 border-b border-vault-border">
          <p className="font-display text-2xl text-phosphor glow tracking-widest">DATA TERMINAL</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {navContent}
        </div>
        <div className="px-4 py-3 border-t border-vault-border">
          <p className="font-display text-sm text-phosphor-dim tracking-widest">SYS:OK · MEM:—</p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              variants={bgVars}
              initial="hidden" animate="visible" exit="exit"
              onClick={onClose}
              className="lg:hidden fixed inset-0 z-30 bg-vault/80"
            />
            <motion.aside
              variants={slideVars}
              initial="hidden" animate="visible" exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 z-40 w-72 bg-vault-panel border-r border-vault-border flex flex-col"
              style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.8)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-vault-border">
                <p className="font-display text-2xl text-phosphor glow tracking-widest">DATA TERMINAL</p>
                <button
                  onClick={onClose}
                  aria-label="close menu"
                  className="font-display text-2xl text-phosphor-dim hover:text-danger transition-colors focus:outline-none"
                >✕</button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {navContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export { Sidebar }
