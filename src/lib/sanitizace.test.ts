import { describe, it, expect } from 'vitest'
import { sanitizujObsah } from '@/lib/sanitizace'

describe('sanitizujObsah', () => {
  it('nechá projít odstavce, tučné a obrázky', () => {
    const html = '<p>Text <strong>tučně</strong></p><img src="/uploads/a.jpg" alt="Stěna">'
    expect(sanitizujObsah(html)).toBe(
      '<p>Text <strong>tučně</strong></p><img src="/uploads/a.jpg" alt="Stěna" />'
    )
  })

  it('zahodí script', () => {
    expect(sanitizujObsah('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>')
  })

  it('zahodí onerror a jiné event handlery', () => {
    expect(sanitizujObsah('<img src="/uploads/a.jpg" onerror="alert(1)">')).toBe(
      '<img src="/uploads/a.jpg" />'
    )
  })

  it('zahodí obrázek s javascript: URL', () => {
    expect(sanitizujObsah('<img src="javascript:alert(1)">')).toBe('<img />')
  })

  it('zahodí nepovolené tagy, ale nechá jejich text', () => {
    expect(sanitizujObsah('<div><p>text</p></div>')).toBe('<p>text</p>')
  })

  it('zvládne prázdný vstup', () => {
    expect(sanitizujObsah('')).toBe('')
  })
})
