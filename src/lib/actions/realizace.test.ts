import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  realizace: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
}
const revalidatePathMock = vi.fn()

vi.mock('@/lib/db', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

const { ulozRealizaci, smazRealizaci } = await import('@/lib/actions/realizace')

function formular(hodnoty: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [klic, hodnota] of Object.entries(hodnoty)) fd.set(klic, hodnota)
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ulozRealizaci', () => {
  it('vytvoří novou realizaci a odvodí slug z názvu', async () => {
    prismaMock.realizace.create.mockResolvedValue({ slug: 'rezidence-sarka' })

    const stav = await ulozRealizaci({}, formular({
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
      popis: '<p>Benátský štuk</p>',
    }))

    expect(stav.ok).toBe(true)
    expect(prismaMock.realizace.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: 'rezidence-sarka',
        nazev: 'Rezidence Šárka',
        rok: 2024,
        kategorie: 'STUK',
        vybrana: false,
      }),
    })
  })

  it('při zadaném id místo vytvoření aktualizuje', async () => {
    prismaMock.realizace.update.mockResolvedValue({ slug: 'rezidence-sarka' })

    await ulozRealizaci({}, formular({
      id: 'abc123',
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
    }))

    expect(prismaMock.realizace.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'abc123' } })
    )
    expect(prismaMock.realizace.create).not.toHaveBeenCalled()
  })

  it('po uložení revaliduje domovskou stránku, výpis i detail', async () => {
    prismaMock.realizace.create.mockResolvedValue({ slug: 'rezidence-sarka' })

    await ulozRealizaci({}, formular({
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
    }))

    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/realizace',
      '/realizace/rezidence-sarka',
    ])
  })

  it('odmítne prázdný název a nic neuloží', async () => {
    const stav = await ulozRealizaci({}, formular({
      nazev: '   ',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
    }))

    expect(stav.chyba).toBe('Vyplňte název realizace.')
    expect(prismaMock.realizace.create).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('odmítne nesmyslný rok', async () => {
    const stav = await ulozRealizaci({}, formular({
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: 'loni',
      kategorie: 'STUK',
    }))

    expect(stav.chyba).toBe('Rok musí být číslo mezi 1992 a 2100.')
    expect(prismaMock.realizace.create).not.toHaveBeenCalled()
  })
})

describe('smazRealizaci', () => {
  it('smaže záznam a revaliduje jeho cesty', async () => {
    prismaMock.realizace.delete.mockResolvedValue({ slug: 'rezidence-sarka' })

    await smazRealizaci('abc123')

    expect(prismaMock.realizace.delete).toHaveBeenCalledWith({ where: { id: 'abc123' } })
    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/realizace',
      '/realizace/rezidence-sarka',
    ])
  })
})
