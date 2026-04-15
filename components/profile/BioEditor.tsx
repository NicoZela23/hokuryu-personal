'use client'

import { useState, useRef } from 'react'
import { marked } from 'marked'

type Props = {
  initialBio:  string
  onSave:      (bio: string) => Promise<void>
}

function BioEditor({ initialBio, onSave }: Props) {
  const [bio,     setBio]     = useState(initialBio)
  const [preview, setPreview] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const BIO_MAX = 2000

  function handleChange(val: string) {
    const capped = val.slice(0, BIO_MAX)
    setBio(capped)
    setSaved(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      await onSave(capped)
      setSaving(false)
      setSaved(true)
    }, 800)
  }

  const previewHtml = preview
    ? (marked.parse(bio, { gfm: true, breaks: true }) as string)
    : ''

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-phosphor-dim tracking-widest">■ BIO</p>
        <div className="flex items-center gap-4">
          <span className={`font-display text-xs tracking-widest ${bio.length > 1800 ? 'text-danger' : 'text-phosphor-dim'}`}>
            {bio.length}/{BIO_MAX}
          </span>
          {saving && (
            <span className="font-display text-sm text-phosphor-dim tracking-widest animate-blink">
              ◌ SAVING...
            </span>
          )}
          {saved && !saving && (
            <span className="font-display text-sm text-phosphor-dim tracking-widest">
              ✓ SAVED
            </span>
          )}
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="font-display text-sm tracking-widest text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none"
          >
            {preview ? '■ EDIT' : '■ PREVIEW'}
          </button>
        </div>
      </div>

      {preview ? (
        <div
          className="w-full min-h-[120px] bg-vault border border-vault-border p-3 font-mono text-sm text-cream prose-terminal"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          value={bio}
          onChange={(e) => handleChange(e.target.value)}
          rows={5}
          placeholder="> ENTER BIO — SUPPORTS MARKDOWN"
          className="w-full bg-vault font-mono text-sm text-cream border border-vault-border px-3 py-2 resize-y focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors"
        />
      )}

      <p className="font-display text-xs text-phosphor-dim tracking-widest">
        SUPPORTS MARKDOWN — AUTO-SAVES ON EDIT
      </p>
    </div>
  )
}

export { BioEditor }
