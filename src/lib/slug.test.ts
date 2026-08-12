import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('odstraní diakritiku a udělá lowercase', () => {
    expect(slugify('Rezidence Šárka')).toBe('rezidence-sarka')
  })

  it('nahradí mezery a interpunkci jednou pomlčkou', () => {
    expect(slugify('Campus Science Park — umělecká stěna')).toBe(
      'campus-science-park-umelecka-stena'
    )
  })

  it('ořízne pomlčky na krajích', () => {
    expect(slugify('  ...Byt v Karlíně!  ')).toBe('byt-v-karline')
  })

  it('u prázdného vstupu vrátí prázdný řetězec', () => {
    expect(slugify('   ')).toBe('')
  })
})
