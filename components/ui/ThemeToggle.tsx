'use client'

import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [enhanced, setEnhanced] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('crt') === 'on'
    setEnhanced(stored)
    document.documentElement.classList.toggle('crt', stored)
  }, [])

  function toggle() {
    setEnhanced((v) => {
      const next = !v
      document.documentElement.classList.toggle('crt', next)
      localStorage.setItem('crt', next ? 'on' : 'off')
      return next
    })
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle CRT mode"
      title={enhanced ? 'CRT MODE: ON' : 'CRT MODE: OFF'}
      className="font-display text-lg tracking-widest text-phosphor-dim hover:text-phosphor transition-colors focus:outline-none"
    >
      {enhanced ? '◉' : '◎'}
    </button>
  )
}

export { ThemeToggle }
