'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONTENT_FORMATS, GENRES } from '@/lib/utils/types'
import type { ContentFormat } from '@/lib/utils/types'

// Amber accent for selected format chips (content identity, not medium)
const FORMAT_LABELS: Record<ContentFormat, string> = {
  anime:         '◈ ANIME',
  animation:     '▶ ANIMATION',
  series:        '▶ SERIES',
  documentary:   '■ DOCUMENTARY',
  'k-drama':     '◈ K-DRAMA',
  'stand-up':    '◉ STAND-UP',
  manga:         '◈ MANGA',
  manhwa:        '◈ MANHWA',
  comics:        '◈ COMICS',
  fiction:       '◎ FICTION',
  'non-fiction': '◎ NON-FICTION',
  biography:     '◎ BIOGRAPHY',
  'self-help':   '◎ SELF-HELP',
  programming:   '▸ PROGRAMMING',
  design:        '▸ DESIGN',
  'ai-ml':       '▸ AI / ML',
  science:       '◎ SCIENCE',
  history:       '◎ HISTORY',
  philosophy:    '◎ PHILOSOPHY',
  news:          '◎ NEWS',
  'true-crime':  '◉ TRUE CRIME',
  nature:        '◎ NATURE',
  travel:        '◎ TRAVEL',
  food:          '◎ FOOD',
  sports:        '◈ SPORTS',
  album:         '♫ ALBUM',
  'live-concert':'♪ LIVE CONCERT',
  education:     '◎ EDUCATION',
}

function OnboardingFlow() {
  const router = useRouter()
  const [step,           setStep]           = useState<1 | 2>(1)
  const [selectedFmts,   setSelectedFmts]   = useState<ContentFormat[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  function toggleFormat(fmt: ContentFormat) {
    setSelectedFmts(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    )
  }

  function toggleGenre(genre: string) {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) return prev.filter(g => g !== genre)
      if (prev.length >= 5)     return prev
      return [...prev, genre]
    })
  }

  async function handleSubmit() {
    if (selectedFmts.length === 0) {
      setError('✗ SELECT AT LEAST ONE CONTENT FORMAT')
      return
    }
    setError(null)
    setLoading(true)

    const res = await fetch('/api/onboarding', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ contentFormats: selectedFmts, genres: selectedGenres }),
    })

    if (!res.ok) {
      setError('✗ FAILED TO SAVE PREFERENCES — TRY AGAIN')
      setLoading(false)
      return
    }

    router.push('/garden')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className={`font-display text-sm tracking-widest ${step === 1 ? 'text-phosphor-bright' : 'text-phosphor-dim'}`}>
          [01] CONTENT FORMATS
        </span>
        <span className="font-display text-sm text-phosphor-dim">·</span>
        <span className={`font-display text-sm tracking-widest ${step === 2 ? 'text-phosphor-bright' : 'text-phosphor-dim'}`}>
          [02] GENRES
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="font-display text-sm text-phosphor-dim tracking-widest">
            &gt; WHAT KINDS OF CONTENT DO YOU CONSUME? SELECT ALL THAT APPLY.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTENT_FORMATS.map((fmt) => {
              const active = selectedFmts.includes(fmt)
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => toggleFormat(fmt)}
                  className={`font-display text-lg tracking-widest py-3 px-4 border transition-colors focus:outline-none text-left ${
                    active
                      ? 'border-amber text-amber bg-vault-active shadow-glow-amber'
                      : 'border-vault-border text-phosphor-dim hover:border-phosphor hover:text-phosphor'
                  }`}
                >
                  {FORMAT_LABELS[fmt]}
                </button>
              )
            })}
          </div>

          {error && (
            <p className="font-display text-base text-danger tracking-widest">{error}</p>
          )}

          <button
            type="button"
            disabled={selectedFmts.length === 0}
            onClick={() => setStep(2)}
            className="w-full font-display text-xl tracking-widest border border-phosphor text-phosphor py-2 hover:bg-vault-active transition-colors focus:outline-none disabled:opacity-40"
          >
            ▸ NEXT — SELECT GENRES
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedFmts.length === 0 || loading}
            className="w-full font-display text-base tracking-widest text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none disabled:opacity-40"
          >
            {loading ? '◌ SAVING...' : '→ SKIP GENRES — ENTER GARDEN'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="font-display text-sm text-phosphor-dim tracking-widest">
            &gt; SELECT UP TO 5 GENRES YOU ENJOY.
          </p>

          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const active = selectedGenres.includes(genre)
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  disabled={!active && selectedGenres.length >= 5}
                  className={`font-display text-base tracking-widest px-3 py-1 border transition-colors focus:outline-none disabled:opacity-40 ${
                    active
                      ? 'border-amber text-amber bg-vault-active'
                      : 'border-vault-border text-phosphor-dim hover:border-phosphor hover:text-phosphor'
                  }`}
                >
                  {genre.toUpperCase()}
                </button>
              )
            })}
          </div>

          <p className="font-display text-xs text-phosphor-dim tracking-widest">
            {selectedGenres.length}/5 SELECTED
          </p>

          {error && (
            <p className="font-display text-base text-danger tracking-widest">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-display text-xl tracking-widest border border-vault-border text-phosphor-dim px-6 py-2 hover:border-phosphor hover:text-phosphor transition-colors focus:outline-none"
            >
              ← BACK
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 font-display text-xl tracking-widest border border-phosphor text-phosphor py-2 hover:bg-vault-active transition-colors focus:outline-none disabled:opacity-50"
            >
              {loading ? '◌ ENTERING GARDEN...' : '▸ ENTER THE GARDEN'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { OnboardingFlow }
