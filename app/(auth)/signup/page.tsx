import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register — HOKURYU',
}

export default function SignupPage() {
  return (
    <div className="border border-vault-border bg-vault-panel">
      <div className="px-8 py-5 border-b border-vault-border">
        <p className="font-display text-4xl text-phosphor glow tracking-widest">◈ HOKURYU</p>
        <p className="font-display text-xl text-phosphor-dim tracking-widest mt-1">
          NEW OPERATIVE REGISTRATION
        </p>
      </div>
      <div className="p-8">
        <SignupForm />
      </div>
    </div>
  )
}
