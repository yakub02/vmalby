import { describe, it, expect } from 'vitest'
import { nazevSouboru } from '@/lib/uploads'

describe('nazevSouboru', () => {
  it('vyrobí bezpečný název s příponou webp', () => {
    expect(nazevSouboru('Fotka z akce (1).JPG', () => 'abc123')).toBe(
      'fotka-z-akce-1-abc123.webp'
    )
  })

  it('zvládne název bez přípony', () => {
    expect(nazevSouboru('scan', () => 'abc123')).toBe('scan-abc123.webp')
  })

  it('nepustí do názvu cestu ven z adresáře', () => {
    expect(nazevSouboru('../../etc/passwd', () => 'abc123')).toBe('etc-passwd-abc123.webp')
  })

  it('u prázdného názvu použije fallback', () => {
    expect(nazevSouboru('   ', () => 'abc123')).toBe('foto-abc123.webp')
  })
})
