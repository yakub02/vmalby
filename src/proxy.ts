import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session'

export function proxy(request: NextRequest) {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('Chybí SESSION_SECRET — nastav ho v .env.local')
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  if (verifySession(cookie, secret)) {
    return NextResponse.next()
  }

  const url = new URL('/prihlaseni', request.url)
  url.searchParams.set('pokracovat', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: '/sprava/:path*',
}
