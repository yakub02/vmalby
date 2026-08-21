import { describe, it, expect } from 'vitest'
import { cestyProRealizaci, cestyProClanek, cestyProSiteTexts } from '@/lib/revalidace'

describe('revalidační cesty', () => {
  it('realizace revaliduje detail, výpis i domovskou stránku', () => {
    expect(cestyProRealizaci('rezidence-sarka')).toEqual([
      '/',
      '/realizace',
      '/realizace/rezidence-sarka',
    ])
  })

  it('článek revaliduje detail, aktuality i domovskou stránku', () => {
    expect(cestyProClanek('novy-stuk')).toEqual([
      '/',
      '/aktuality',
      '/aktuality/novy-stuk',
    ])
  })

  it('texty stránek revalidují všechny statické stránky', () => {
    expect(cestyProSiteTexts()).toEqual(['/', '/atelier', '/sluzby', '/kontakt'])
  })
})
