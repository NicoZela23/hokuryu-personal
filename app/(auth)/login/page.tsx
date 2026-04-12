'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { confirmCardVariants } from '@/lib/animations'

function LoginPage() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const variants: Variants = shouldReduceMotion
    ? { hidden: {}, visible: {}, exit: {} }
    : confirmCardVariants

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('invalid credentials')
    } else {
      router.push('/garden')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-paper dark:bg-forest">
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-sm bg-paper-dark dark:bg-forest-card border border-ink-faint dark:border-moss-ink/30 rounded-xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <span className="text-2xl font-serif text-moss font-semibold tracking-tight">
            digi hokuryu
          </span>
          <p className="text-ink-muted text-sm mt-1 text-center">
            things worth your time, planted by people who know you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-ink dark:text-paper mb-1" htmlFor="username">
              username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-3 py-2 rounded border border-ink-faint dark:border-moss-ink/30 bg-paper dark:bg-forest text-ink dark:text-paper text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <div>
            <label className="block text-sm text-ink dark:text-paper mb-1" htmlFor="password">
              password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded border border-ink-faint dark:border-moss-ink/30 bg-paper dark:bg-forest text-ink dark:text-paper text-sm focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-moss text-white text-sm font-medium hover:bg-moss-dark transition-colors focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-60"
          >
            {loading ? 'entering...' : 'enter the garden'}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </form>
      </motion.div>
    </main>
  )
}

export default LoginPage
