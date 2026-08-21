import type { SiteTexts } from '@prisma/client'
import { prisma } from '@/lib/db'

export const SITE_TEXTS_ID = 'singleton'

export async function nactiSiteTexts(): Promise<SiteTexts> {
  return prisma.siteTexts.upsert({
    where: { id: SITE_TEXTS_ID },
    update: {},
    create: { id: SITE_TEXTS_ID },
  })
}
