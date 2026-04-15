import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Login — HOKURYU',
}

export default function LoginPage() {
  return (
    <div className="border border-vault-border bg-vault-panel">
      <div className="px-8 py-5 border-b border-vault-border">
        <p className="font-display text-4xl text-phosphor glow tracking-widest">◈ HOKURYU</p>
        <p className="font-display text-xl text-phosphor-dim tracking-widest mt-1">
          OPERATOR LOGIN
        </p>
      </div>
      <div className="p-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
