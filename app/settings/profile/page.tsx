'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'
import { BioEditor } from '@/components/profile/BioEditor'

export const dynamic = 'force-dynamic'

// Settings page is a client component — loads own profile via API on mount
export default function SettingsProfilePage() {
  const router   = useRouter()
  const [profile, setProfile] = useState<{
    id: string; username: string; displayName: string | null;
    bio: string | null; avatarUrl: string | null
  } | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [success,       setSuccess]       = useState<string | null>(null)
  const [displayName,   setDisplayName]   = useState('')
  const [username,      setUsername]      = useState('')
  const [usernameState, setUsernameState] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef        = useRef<HTMLInputElement>(null)
  const checkTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load profile on mount
  useState(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ data }) => {
        if (data) {
          setProfile(data)
          setDisplayName(data.displayName ?? '')
          setUsername(data.username ?? '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  })

  useEffect(() => {
    if (!profile) return
    // No check needed if unchanged
    if (username === profile.username) { setUsernameState('idle'); return }
    if (username.length < 3) { setUsernameState('invalid'); return }

    setUsernameState('checking')
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current)
    checkTimerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/profile/check?username=${encodeURIComponent(username)}`)
        const json = await res.json()
        setUsernameState(json.available ? 'available' : 'taken')
      } catch {
        setUsernameState('idle')
      }
    }, 500)

    return () => { if (checkTimerRef.current) clearTimeout(checkTimerRef.current) }
  }, [username, profile])

  async function saveBio(bio: string) {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setProfile(prev => prev ? { ...prev, bio: data.bio } : prev)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: displayName || null,
        username:    username.toLowerCase().trim(),
      }),
    })

    const json = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(`✗ ${(json.error?.toString() ?? 'SAVE FAILED').toUpperCase()}`)
      return
    }

    setProfile(prev => prev ? { ...prev, ...json.data } : prev)
    setSuccess('✓ PROFILE UPDATED')
    router.refresh()
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingAvatar(true)
    setError(null)

    // Resize to 400×400 using canvas
    const resized = await resizeImage(file, 400)
    const supabase = createBrowserClient()

    const path = `${profile.id}/avatar.webp`
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, resized, { upsert: true, contentType: 'image/webp' })

    if (uploadErr) {
      setError('✗ AVATAR UPLOAD FAILED — CHECK STORAGE BUCKET EXISTS')
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: publicUrl }),
    })

    if (res.ok) {
      setProfile(prev => prev ? { ...prev, avatarUrl: publicUrl } : prev)
      setSuccess('✓ AVATAR UPDATED')
    }

    setUploadingAvatar(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-vault flex items-center justify-center">
        <p className="font-display text-xl text-phosphor-dim tracking-widest animate-blink">
          ◌ LOADING PROFILE...
        </p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-vault flex items-center justify-center">
        <p className="font-display text-xl text-danger tracking-widest">✗ PROFILE NOT FOUND</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-vault">
      <nav className="bg-vault-panel border-b border-vault-border px-4 md:px-8 py-2 flex items-center gap-4">
        <Link href="/garden" className="font-display text-base text-phosphor-dim tracking-widest hover:text-phosphor transition-colors">
          ← GARDEN
        </Link>
        <span className="font-display text-base text-phosphor-dim tracking-widest">·</span>
        <span className="font-display text-base text-phosphor tracking-widest">SETTINGS</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Section header */}
        <div className="border-b border-vault-border pb-3">
          <h1 className="font-display text-2xl text-phosphor-bright tracking-widest">
            ■ EDIT PROFILE
          </h1>
        </div>

        {/* Avatar */}
        <section className="border border-vault-border bg-vault-card p-6 space-y-4">
          <p className="font-display text-sm text-phosphor-dim tracking-widest">■ AVATAR</p>
          <div className="flex items-center gap-4">
            <Avatar avatarUrl={profile.avatarUrl} username={profile.username} size={72} />
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="font-display text-base tracking-widest border border-vault-border text-phosphor-dim px-4 py-1 hover:border-phosphor hover:text-phosphor transition-colors focus:outline-none disabled:opacity-50"
              >
                {uploadingAvatar ? '◌ UPLOADING...' : '◈ UPLOAD AVATAR'}
              </button>
              <p className="font-display text-xs text-phosphor-dim tracking-widest">
                MAX 4MB · WILL BE RESIZED TO 400×400
              </p>
            </div>
          </div>
        </section>

        {/* Display name + username */}
        <section className="border border-vault-border bg-vault-card p-6">
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-display text-sm text-phosphor-dim tracking-widest block">
                DISPLAY NAME
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you want to be known"
                maxLength={50}
                className="w-full bg-vault font-mono text-sm text-cream border border-vault-border px-3 py-2 focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-display text-sm text-phosphor-dim tracking-widest block">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="lowercase_letters_only"
                minLength={3}
                maxLength={20}
                required
                className={`w-full bg-vault font-mono text-sm text-cream border px-3 py-2 focus:outline-none placeholder:text-phosphor-dim transition-colors ${
                  usernameState === 'taken'     ? 'border-danger'   :
                  usernameState === 'available' ? 'border-phosphor' :
                  'border-vault-border focus:border-phosphor'
                }`}
              />
              <div className="flex items-center justify-between">
                <p className="font-display text-xs text-phosphor-dim tracking-widest">
                  PROFILE AT: /u/{username || 'username'}
                </p>
                {usernameState === 'checking'  && <span className="font-display text-xs text-phosphor-dim tracking-widest animate-blink">◌ CHECKING...</span>}
                {usernameState === 'available' && <span className="font-display text-xs text-phosphor tracking-widest">✓ AVAILABLE</span>}
                {usernameState === 'taken'     && <span className="font-display text-xs text-danger tracking-widest">✗ ALREADY TAKEN</span>}
                {usernameState === 'invalid'   && <span className="font-display text-xs text-danger tracking-widest">✗ MIN 3 CHARS</span>}
              </div>
            </div>

            {error   && <p className="font-display text-base text-danger tracking-widest">{error}</p>}
            {success && <p className="font-display text-base text-phosphor tracking-widest">{success}</p>}

            <button
              type="submit"
              disabled={saving || usernameState === 'taken' || usernameState === 'checking' || usernameState === 'invalid'}
              className="w-full font-display text-xl tracking-widest border border-phosphor text-phosphor py-2 hover:bg-vault-active transition-colors focus:outline-none disabled:opacity-50"
            >
              {saving ? '◌ SAVING...' : '▸ SAVE CHANGES'}
            </button>
          </form>
        </section>

        {/* Bio */}
        <section className="border border-vault-border bg-vault-card p-6">
          <BioEditor initialBio={profile.bio ?? ''} onSave={saveBio} />
        </section>

        {/* View public profile */}
        <div className="text-center">
          <Link
            href={`/u/${profile.username}`}
            className="font-display text-base text-phosphor-dim tracking-widest hover:text-phosphor transition-colors"
          >
            → VIEW PUBLIC PROFILE
          </Link>
        </div>
      </div>
    </main>
  )
}

// Resize image to maxSize×maxSize using canvas, returns WebP Blob
async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale  = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width  = img.width  * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob ?? file), 'image/webp', 0.85)
    }
    img.src = url
  })
}
