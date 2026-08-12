import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'vmalby_session'
export const SESSION_TRVANI_MS = 7 * 24 * 60 * 60 * 1000

function podpis(expiresAt: number, secret: string): string {
  return createHmac('sha256', secret).update(`admin:${expiresAt}`).digest('hex')
}

export function signSession(expiresAt: number, secret: string): string {
  return `${expiresAt}.${podpis(expiresAt, secret)}`
}

export function verifySession(
  value: string | undefined,
  secret: string,
  now: number = Date.now()
): boolean {
  if (!value) return false

  const [expiresRaw, podpisZCookie] = value.split('.')
  if (!expiresRaw || !podpisZCookie) return false

  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false

  // Porovnává se v konstantním čase, aby podpis nešlo uhodnout po znacích.
  const ocekavany = Buffer.from(podpis(expiresAt, secret), 'hex')
  const doruceny = Buffer.from(podpisZCookie, 'hex')
  if (ocekavany.length !== doruceny.length) return false

  return timingSafeEqual(ocekavany, doruceny)
}
