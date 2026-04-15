'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

const inputClass = 'w-full bg-vault font-mono text-sm text-cream border border-vault-border px-3 py-2 focus:outline-none focus:border-phosphor placeholder:text-phosphor-dim transition-colors'

function SignupForm() {
  const router = useRouter()
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState<string | null>(null)
  const [loading,         setLoading]         = useState(false)
  const [oauthLoading,    setOauthLoading]    = useState(false)

  async function handleGoogle() {
    setError(null)
    setOauthLoading(true)
    const supabase = createBrowserClient()

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (oauthError) {
      setError('✗ GOOGLE AUTH FAILED — TRY AGAIN')
      setOauthLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('✗ PASSWORDS DO NOT MATCH')
      return
    }
    if (password.length < 10) {
      setError('✗ PASSWORD TOO SHORT — MINIMUM 10 CHARACTERS')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('✗ PASSWORD MUST CONTAIN AT LEAST ONE NUMBER')
      return
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?`~]/.test(password)) {
      setError('✗ PASSWORD MUST CONTAIN AT LEAST ONE SPECIAL CHARACTER')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('✗ PASSWORD MUST CONTAIN AT LEAST ONE UPPERCASE LETTER')
      return
    }
    if (!/[a-z]/.test(password)) {
      setError('✗ PASSWORD MUST CONTAIN AT LEAST ONE LOWERCASE LETTER')
      return
    }

    setLoading(true)
    const supabase = createBrowserClient()

    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(`✗ ${authError.message.toUpperCase()}`)
      setLoading(false)
      return
    }

    if (data.user) {
      await fetch('/api/auth/profile', { method: 'POST' })
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={oauthLoading || loading}
        className="w-full font-display text-xl tracking-widest border border-vault-border text-cream py-2 hover:border-phosphor hover:text-phosphor transition-colors focus:outline-none disabled:opacity-50"
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
            placeholder="min. 10 chars, A-Z, 0-9, !@#..."
            required
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="font-display text-xs text-phosphor-dim tracking-widest">
            MIN 10 CHARS &nbsp;·&nbsp; UPPERCASE &nbsp;·&nbsp; LOWERCASE &nbsp;·&nbsp; NUMBER &nbsp;·&nbsp; SPECIAL CHAR
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="font-display text-lg text-phosphor-dim tracking-widest block">
            CONFIRM PASSWORD
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="repeat password"
            required
            autoComplete="new-password"
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
          {loading ? '◌ PROCESSING...' : '▸ REGISTER OPERATIVE'}
        </button>
      </form>

      <p className="font-display text-base text-phosphor-dim tracking-widest text-center pt-2">
        ALREADY REGISTERED?{' '}
        <Link href="/login" className="text-amber hover:glow-amber transition-all">
          ACCESS TERMINAL →
        </Link>
      </p>
    </div>
  )
}

export { SignupForm }
