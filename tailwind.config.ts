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
        paper: {
          DEFAULT: '#F9F7F2',
          dark:    '#F1EFE8',
        },
        forest: {
          DEFAULT: '#141a0e',
          card:    '#1c2415',
          deep:    '#0e1109',
        },
        moss: {
          light:   '#EAF3DE',
          mid:     '#97C459',
          DEFAULT: '#3B6D11',
          dark:    '#27500A',
          ink:     '#173404',
        },
        ink: {
          faint:   '#D3D1C7',
          muted:   '#888780',
          DEFAULT: '#2C2C2A',
        },
        seed: {
          youtube:   '#E24B4A',
          spotify:   '#97C459',
          article:   '#5DCAA5',
          podcast:   '#7F77DD',
          film:      '#EF9F27',
          book:      '#D85A30',
          tiktok:    '#E24B4A',
          instagram: '#D4537E',
          concert:   '#D4537E',
          generic:   '#888780',
        },
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
