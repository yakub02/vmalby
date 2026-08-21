import type { Clanek } from '@prisma/client'
import { prisma } from '@/lib/db'

export async function vsechnyClanky(): Promise<Clanek[]> {
  return prisma.clanek.findMany({ orderBy: { datum: 'desc' } })
}

export async function clanekPodleSlug(slug: string): Promise<Clanek | null> {
  return prisma.clanek.findUnique({ where: { slug } })
}
