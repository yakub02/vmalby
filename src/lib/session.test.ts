import { describe, it, expect } from 'vitest'
import { signSession, verifySession } from '@/lib/session'

const SECRET = 'testovaci-tajemstvi-aspon-32-znaku-dlouhe'
const HOUR = 60 * 60 * 1000

describe('session cookie', () => {
  it('ověří vlastní čerstvý podpis', () => {
    const now = Date.now()
    const cookie = signSession(now + HOUR, SECRET)
    expect(verifySession(cookie, SECRET, now)).toBe(true)
  })

  it('odmítne prošlé cookie', () => {
    const now = Date.now()
    const cookie = signSession(now - 1, SECRET)
    expect(verifySession(cookie, SECRET, now)).toBe(false)
  })

  it('odmítne cookie podepsané jiným tajemstvím', () => {
    const now = Date.now()
    const cookie = signSession(now + HOUR, 'uplne-jine-tajemstvi-a-taky-dost-dlouhe')
    expect(verifySession(cookie, SECRET, now)).toBe(false)
  })

  it('odmítne cookie s ručně prodlouženou expirací', () => {
    const now = Date.now()
    const cookie = signSession(now + HOUR, SECRET)
    const [, podpis] = cookie.split('.')
    const podvrzene = `${now + 100 * HOUR}.${podpis}`
    expect(verifySession(podvrzene, SECRET, now)).toBe(false)
  })

  it('odmítne prázdné nebo poškozené cookie', () => {
    expect(verifySession(undefined, SECRET)).toBe(false)
    expect(verifySession('', SECRET)).toBe(false)
    expect(verifySession('nesmysl', SECRET)).toBe(false)
    expect(verifySession('123.', SECRET)).toBe(false)
  })

  it('nespadne na podpisu, který není platný hex', () => {
    const now = Date.now()
    expect(verifySession(`${now + HOUR}.zzzz`, SECRET, now)).toBe(false)
  })
})
