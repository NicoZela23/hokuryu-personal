'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

const inputClass = 'w-full bg-vault font-mono text-sm text-cream border border-vault-border px-3 py-2 focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('✗ INVALID CREDENTIALS — CHECK EMAIL AND PASSWORD')
      setLoading(false)
      return
    }

    const next = searchParams.get('next') ?? '/garden'
    router.push(next)
    router.refresh()
  }

  async function handleGoogle() {
    setError(null)
    setOauthLoading(true)
    const supabase = createBrowserClient()
    const next = searchParams.get('next') ?? '/garden'

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (oauthError) {
      setError('✗ GOOGLE AUTH FAILED — TRY AGAIN')
      setOauthLoading(false)
    }
    // On success browser redirects — no further action needed
  }

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={oauthLoading || loading}
        className="w-full font-display text-xl tracking-widest border border-vault-border text-cream py-2 hover:border-phosphor hover:text-phosphor transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {oauthLoading ? '◌ REDIRECTING...' : '◈ CONTINUE WITH GOOGLE'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-vault-border" />
        <span className="font-display text-sm text-phosphor-dim tracking-widest">OR</span>
        <div className="flex-1 border-t border-vault-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="font-display text-lg text-phosphor-dim tracking-widest block">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operative@vault.net"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-display text-lg text-phosphor-dim tracking-widest block">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {error && (
          <p className="font-display text-base text-danger tracking-widest">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || oauthLoading}
          className="w-full font-display text-xl tracking-widest border border-phosphor text-phosphor py-2 hover:bg-vault-active hover:glow transition-colors focus:outline-none disabled:opacity-50"
        >
          {loading ? '◌ AUTHENTICATING...' : '▸ ACCESS TERMINAL'}
        </button>
      </form>

      <p className="font-display text-base text-phosphor-dim tracking-widest text-center pt-2">
        NEW OPERATIVE?{' '}
        <Link href="/signup" className="text-amber hover:glow-amber transition-all">
          REGISTER HERE →
        </Link>
      </p>
    </div>
  )
}

export { LoginForm }
