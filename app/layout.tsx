import type { Metadata } from 'next'
import { VT323, Share_Tech_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const vt323 = VT323({
  weight:   '400',
  subsets:  ['latin'],
  variable: '--font-vt323',
  display:  'swap',
})

const shareTechMono = Share_Tech_Mono({
  weight:   '400',
  subsets:  ['latin'],
  variable: '--font-share-tech-mono',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'HOKURYU',
  description: 'ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM',
}

// Always terminal dark — no light mode
const themeScript = `
(function() {
  document.documentElement.classList.add('dark');
  try { localStorage.setItem('theme', 'dark'); } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${vt323.variable} ${shareTechMono.variable} font-mono bg-vault text-phosphor antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
