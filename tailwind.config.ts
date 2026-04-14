import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Vault terminal backgrounds ─────────────
        vault: {
          DEFAULT: '#0d1409',
          panel:   '#141c10',
          card:    '#192014',
          border:  '#2a4422',
          hover:   '#304c28',
          active:  '#3a5c30',
        },
        // ── Phosphor green — muted, readable (Gruvbox-inspired) ──
        phosphor: {
          bright:  '#c5e88a',   // titles, highlights
          DEFAULT: '#95b86a',   // primary UI labels
          mid:     '#729050',   // secondary UI
          dim:     '#4a6035',   // muted labels
          faint:   '#28381c',   // very subtle
          ghost:   '#18220f',
        },
        // ── Cream — warm body text (Gruvbox fg) ───
        cream: {
          bright:  '#ede0c4',   // headings, emphasis
          DEFAULT: '#d5c8a0',   // body text, descriptions
          mid:     '#b8a878',   // secondary body
          dim:     '#857558',   // muted body
          faint:   '#4a4030',
        },
        // ── Amber / Vault-Tec yellow (Gruvbox yellow) ──
        amber: {
          bright:  '#ffd75f',
          DEFAULT: '#d79921',
          mid:     '#b88000',
          dim:     '#6b5000',
          faint:   '#3a2c00',
        },
        // ── Danger / Red alert ─────────────────────
        danger: {
          DEFAULT: '#cc4444',
          mid:     '#993030',
          dim:     '#4d1818',
          faint:   '#2a0e0e',
        },
        // ── Seed type accent colors ────────────────
        seed: {
          youtube:   '#cc4444',   // Gruvbox red
          spotify:   '#95b86a',   // phosphor green
          article:   '#669d9d',   // Gruvbox aqua
          podcast:   '#9a7db0',   // Gruvbox purple
          film:      '#d79921',   // Gruvbox yellow
          book:      '#cc7733',   // Gruvbox orange
          tiktok:    '#b06090',   // Gruvbox magenta
          instagram: '#b06090',
          concert:   '#b06090',
          generic:   '#7a7a6a',
          x:         '#9a9a8a',
        },
        // ── Legacy compat aliases ──────────────────
        paper:  { DEFAULT: '#0d1409', dark: '#141c10' },
        forest: { DEFAULT: '#0d1409', card: '#192014', deep: '#080e06' },
        moss: {
          light:   '#2a4422',
          mid:     '#95b86a',
          DEFAULT: '#729050',
          dark:    '#4a6035',
          ink:     '#18220f',
        },
        ink: {
          faint:   '#2a4422',
          muted:   '#4a6035',
          DEFAULT: '#95b86a',
        },
      },
      fontFamily: {
        sans:    ['var(--font-share-tech-mono)', 'monospace'],
        mono:    ['var(--font-share-tech-mono)', 'monospace'],
        display: ['var(--font-vt323)', 'monospace'],
        serif:   ['var(--font-vt323)', 'monospace'],
      },
      boxShadow: {
        'glow':        '0 0 8px rgba(149,184,106,0.35), 0 0 24px rgba(149,184,106,0.1)',
        'glow-sm':     '0 0 4px rgba(149,184,106,0.4)',
        'glow-amber':  '0 0 8px rgba(215,153,33,0.4), 0 0 20px rgba(215,153,33,0.12)',
        'glow-danger': '0 0 8px rgba(204,68,68,0.45)',
        'panel':       '0 2px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(149,184,106,0.05)',
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      animation: {
        'flicker':        'flicker 14s infinite',
        'blink':          'blink 1s step-end infinite',
        'phosphor-pulse': 'phosphor-pulse 5s ease-in-out infinite',
        'boot':           'boot 0.5s ease-out forwards',
      },
      keyframes: {
        flicker: {
          '0%, 90%, 100%': { opacity: '1' },
          '92%': { opacity: '0.88' },
          '94%': { opacity: '0.96' },
          '96%': { opacity: '0.91' },
          '98%': { opacity: '0.97' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'phosphor-pulse': {
          '0%, 100%': { textShadow: '0 0 4px rgba(149,184,106,0.4)' },
          '50%': { textShadow: '0 0 10px rgba(149,184,106,0.8), 0 0 24px rgba(149,184,106,0.3)' },
        },
        boot: {
          '0%':   { opacity: '0', transform: 'scaleY(0.02)' },
          '40%':  { opacity: '1', transform: 'scaleY(0.02)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
