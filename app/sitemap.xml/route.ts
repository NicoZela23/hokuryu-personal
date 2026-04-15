import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export const revalidate = 3600 // 1 hour

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hokuryu.app'

  const allProfiles = await db
    .select({ username: profiles.username, createdAt: profiles.createdAt })
    .from(profiles)

  const profileUrls = allProfiles.map(p => `
  <url>
    <loc>${base}/u/${p.username}</loc>
    <lastmod>${p.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${profileUrls}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
