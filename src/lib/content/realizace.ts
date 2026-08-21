import type { Kategorie, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export type RealizaceSFotkami = Prisma.RealizaceGetPayload<{
  include: { fotky: true }
}>

const razeni = {
  include: { fotky: { orderBy: { poradi: 'asc' } } },
  orderBy: [{ poradi: 'asc' }, { rok: 'desc' }],
} satisfies Prisma.RealizaceFindManyArgs

export async function vsechnyRealizace(
  kategorie?: Kategorie
): Promise<RealizaceSFotkami[]> {
  return prisma.realizace.findMany({
    ...razeni,
    where: kategorie ? { kategorie } : undefined,
  })
}

export async function vybraneRealizace(limit = 4): Promise<RealizaceSFotkami[]> {
  return prisma.realizace.findMany({
    ...razeni,
    where: { vybrana: true },
    take: limit,
  })
}

export async function realizacePodleSlug(
  slug: string
): Promise<RealizaceSFotkami | null> {
  return prisma.realizace.findUnique({
    where: { slug },
    include: { fotky: { orderBy: { poradi: 'asc' } } },
  })
}
