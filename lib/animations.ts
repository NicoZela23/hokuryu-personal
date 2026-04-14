import type { Variants } from 'framer-motion'

export const seedCardVariants: Variants = {
  hidden:  { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.2, ease: 'easeOut' }
  }),
  exit: { opacity: 0, x: -4, transition: { duration: 0.12 } }
}

export const panelVariants: Variants = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.14 } }
}

export const confirmCardVariants: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, y: 4, transition: { duration: 0.14 } }
}

export const stemVariants: Variants = {
  hidden:  { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}

export const pageVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
}

export const keywordPanelVariants: Variants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
}

export const sidebarVariants: Variants = {
  hidden:  { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { x: '-100%', opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
}

export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } }
}

// Phosphor hex values for Framer Motion (cannot use Tailwind tokens)
export const statusBgVariants = {
  pending:  { backgroundColor: '#101f0e' },
  consumed: { backgroundColor: '#060d05', transition: { duration: 0.2 } }
}
