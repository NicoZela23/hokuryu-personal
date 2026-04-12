import type { Variants } from 'framer-motion'

export const seedCardVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' }
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
}

export const panelVariants: Variants = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { height: 0, opacity: 0, transition: { duration: 0.15 } }
}

export const confirmCardVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.97, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.15 } }
}

export const stemVariants: Variants = {
  hidden:  { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.6, ease: 'easeOut' } }
}

export const pageVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
}

export const statusBgVariants = {
  pending:  { backgroundColor: '#F1EFE8' },
  consumed: { backgroundColor: '#EAF3DE', transition: { duration: 0.2 } }
}
