import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = { siteTexts: { upsert: vi.fn() } }
const revalidatePathMock = vi.fn()

vi.mock('@/lib/db', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

const { ulozSiteTexts } = await import('@/lib/actions/siteTexts')

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.siteTexts.upsert.mockResolvedValue({ id: 'singleton' })
})

describe('ulozSiteTexts', () => {
  it('upsertuje vždy stejný singleton řádek', async () => {
    const fd = new FormData()
    fd.set('heroNadpis', 'Řemeslo od 1992')
    fd.set('kontaktEmail', 'info@vmalby.cz')

    const stav = await ulozSiteTexts({}, fd)

    expect(stav.ok).toBe(true)
    const volani = prismaMock.siteTexts.upsert.mock.calls[0][0]
    expect(volani.where).toEqual({ id: 'singleton' })
    expect(volani.update.heroNadpis).toBe('Řemeslo od 1992')
    expect(volani.create.id).toBe('singleton')
  })

  it('ignoruje pole, která nejsou v seznamu povolených', async () => {
    const fd = new FormData()
    fd.set('heroNadpis', 'Řemeslo od 1992')
    fd.set('id', 'podvrzene')
    fd.set('neexistujicPole', 'x')

    await ulozSiteTexts({}, fd)

    const volani = prismaMock.siteTexts.upsert.mock.calls[0][0]
    expect(volani.update).not.toHaveProperty('neexistujicPole')
    expect(volani.update).not.toHaveProperty('id')
    expect(volani.where).toEqual({ id: 'singleton' })
  })

  it('revaliduje statické stránky', async () => {
    await ulozSiteTexts({}, new FormData())

    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/atelier',
      '/sluzby',
      '/kontakt',
    ])
  })
})
