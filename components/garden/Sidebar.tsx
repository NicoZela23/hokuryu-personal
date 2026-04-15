'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { sidebarVariants, overlayVariants } from '@/lib/animations'
import { SOURCE_TYPES, CONTENT_FORMATS } from '@/lib/utils/types'

type Props = {
  open:    boolean
  onClose: () => void
}

// Source type (medium) display labels + colors
const typeLabels: Record<string, string> = {
  video:       'VIDEO',
  film:        'FILM',
  book:        'BOOKS',
  article:     'ARTICLES',
  podcast:     'PODCASTS',
  music:       'MUSIC',
  interactive: 'INTERACTIVE',
  event:       'EVENTS',
  course:      'COURSES',
  generic:     'OTHER',
}

const typeColors: Record<string, string> = {
  video:       'text-seed-video',
  film:        'text-seed-film',
  book:        'text-seed-book',
  article:     'text-seed-article',
  podcast:     'text-seed-podcast',
  music:       'text-seed-music',
  interactive: 'text-seed-interactive',
  event:       'text-seed-event',
  course:      'text-seed-course',
  generic:     'text-seed-generic',
}

// Content format display labels
const formatLabels: Record<string, string> = {
  anime:        'ANIME',
  animation:    'ANIMATION',
  series:       'SERIES',
  documentary:  'DOCUMENTARY',
  'k-drama':    'K-DRAMA',
  'stand-up':   'STAND-UP',
  manga:        'MANGA',
  manhwa:       'MANHWA',
  comics:       'COMICS',
  fiction:      'FICTION',
  'non-fiction':'NON-FICTION',
  biography:    'BIOGRAPHY',
  'self-help':  'SELF-HELP',
  programming:  'PROGRAMMING',
  design:       'DESIGN',
  'ai-ml':      'AI / ML',
  science:      'SCIENCE',
  history:      'HISTORY',
  philosophy:   'PHILOSOPHY',
  news:         'NEWS',
  'true-crime': 'TRUE CRIME',
  nature:       'NATURE',
  travel:       'TRAVEL',
  food:         'FOOD',
  sports:       'SPORTS',
  album:        'ALBUM',
  'live-concert':'LIVE CONCERT',
  education:    'EDUCATION',
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
  const currentFormat = searchParams.get('format') ?? undefined
  const currentStatus = searchParams.get('status') ?? undefined

  function navigate(updates: { type?: string | null; format?: string | null; status?: string | null }) {
    const params = new URLSearchParams(searchParams.toString())
    if ('type'   in updates) { updates.type   ? params.set('type',   updates.type)   : params.delete('type') }
    if ('format' in updates) { updates.format ? params.set('format', updates.format) : params.delete('format') }
    if ('status' in updates) { updates.status ? params.set('status', updates.status) : params.delete('status') }
    router.push(`/garden?${params.toString()}`)
    onClose()
  }

  const navContent = (
    <div className="space-y-6">
      {/* ── Medium (source type) ── */}
      <div>
        <p className="font-display text-xl text-phosphor-dim tracking-widest mb-2 border-b border-vault-border pb-1">
          ■ MEDIUM
        </p>
        <div className="space-y-0.5">
          <button
            onClick={() => navigate({ type: null })}
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
            const color    = isActive ? typeColors[type] : 'text-phosphor-dim'
            return (
              <button
                key={type}
                onClick={() => navigate({ type })}
                className={`w-full text-left font-display text-xl tracking-widest px-2 py-1 transition-colors focus:outline-none hover:bg-vault-hover ${
                  isActive ? `bg-vault-active ${color}` : `${color} hover:text-phosphor`
                }`}
              >
                {isActive ? '► ' : '  '}{typeLabels[type]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content format ── */}
      <div>
        <p className="font-display text-xl text-phosphor-dim tracking-widest mb-2 border-b border-vault-border pb-1">
          ■ FORMAT
        </p>
        <div className="space-y-0.5">
          <button
            onClick={() => navigate({ format: null })}
            className={`w-full text-left font-display text-xl tracking-widest px-2 py-1 transition-colors focus:outline-none ${
              !currentFormat
                ? 'text-phosphor-bright glow bg-vault-active'
                : 'text-phosphor-dim hover:text-phosphor hover:bg-vault-hover'
            }`}
          >
            {!currentFormat ? '► ' : '  '}ALL FORMATS
          </button>
          {CONTENT_FORMATS.map((fmt) => {
            const isActive = currentFormat === fmt
            return (
              <button
                key={fmt}
                onClick={() => navigate({ format: fmt })}
                className={`w-full text-left font-display text-lg tracking-widest px-2 py-0.5 transition-colors focus:outline-none hover:bg-vault-hover ${
                  isActive
                    ? 'bg-vault-active text-amber'
                    : 'text-phosphor-dim hover:text-phosphor'
                }`}
              >
                {isActive ? '► ' : '  '}{formatLabels[fmt] ?? fmt.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Status ── */}
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
                onClick={() => navigate({ status: s.value ?? null })}
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
