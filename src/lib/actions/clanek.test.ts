import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  clanek: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}
const revalidatePathMock = vi.fn()

vi.mock('@/lib/db', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

const { ulozClanek, smazClanek } = await import('@/lib/actions/clanek')

function formular(hodnoty: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [klic, hodnota] of Object.entries(hodnoty)) fd.set(klic, hodnota)
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ulozClanek', () => {
  it('vytvoří článek se slugem z nadpisu', async () => {
    prismaMock.clanek.create.mockResolvedValue({ slug: 'jak-delame-stuk' })

    const stav = await ulozClanek({}, formular({
      nadpis: 'Jak děláme štuk',
      perex: 'Krátce o postupu',
      obsah: '<p>Text</p>',
      datum: '2026-03-01',
    }))

    expect(stav.ok).toBe(true)
    expect(prismaMock.clanek.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'jak-delame-stuk', nadpis: 'Jak děláme štuk' }),
    })
  })

  it('odmítne prázdný nadpis', async () => {
    const stav = await ulozClanek({}, formular({ nadpis: '  ', obsah: '<p>x</p>' }))

    expect(stav.chyba).toBe('Vyplňte nadpis článku.')
    expect(prismaMock.clanek.create).not.toHaveBeenCalled()
  })

  it('revaliduje domovskou stránku, aktuality i detail', async () => {
    prismaMock.clanek.create.mockResolvedValue({ slug: 'jak-delame-stuk' })

    await ulozClanek({}, formular({ nadpis: 'Jak děláme štuk', obsah: '<p>Text</p>' }))

    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/aktuality',
      '/aktuality/jak-delame-stuk',
    ])
  })
})

describe('smazClanek', () => {
  it('smaže článek a revaliduje jeho cesty', async () => {
    prismaMock.clanek.delete.mockResolvedValue({ slug: 'jak-delame-stuk' })

    await smazClanek('abc123')

    expect(prismaMock.clanek.delete).toHaveBeenCalledWith({ where: { id: 'abc123' } })
    expect(revalidatePathMock).toHaveBeenCalledTimes(3)
  })
})
