import * as Sentry from '@sentry/nextjs'

// Only initialise if DSN is configured — app works without Sentry
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,  // 10% — stay within free tier
    debug: false,
  })
}
