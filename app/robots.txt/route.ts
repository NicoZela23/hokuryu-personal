import { NextResponse } from 'next/server'

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /feed
Disallow: /notifications
Disallow: /settings
Disallow: /onboarding
Disallow: /passport
Disallow: /api/

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml
`
  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
