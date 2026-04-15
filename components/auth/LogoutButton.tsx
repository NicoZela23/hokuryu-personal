'use client'

import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="font-display text-base tracking-widest text-phosphor-dim hover:text-danger transition-colors focus:outline-none"
    >
      [EXIT]
    </button>
  )
}

export { LogoutButton }
