'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { cestyProSiteTexts } from '@/lib/revalidace'
import { SITE_TEXTS_ID } from '@/lib/content/siteTexts'
import type { FormState } from '@/lib/forms'

const POVOLENA_POLE = [
  'heroNadpis',
  'heroPodnadpis',
  'oNasNadpis',
  'oNasText',
  'oNasFoto',
  'sluzbyMalba',
  'sluzbyStuk',
  'sluzbyBeton',
  'sluzbyKovy',
  'sluzbyTapety',
  'kontaktEmail',
  'kontaktTelefon',
  'kontaktAdresa',
] as const

export async function ulozSiteTexts(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data: Record<string, string> = {}

  for (const pole of POVOLENA_POLE) {
    const hodnota = formData.get(pole)
    if (hodnota !== null) data[pole] = String(hodnota).trim()
  }

  await prisma.siteTexts.upsert({
    where: { id: SITE_TEXTS_ID },
    update: data,
    create: { id: SITE_TEXTS_ID, ...data },
  })

  for (const cesta of cestyProSiteTexts()) {
    revalidatePath(cesta)
  }

  return { ok: true }
}
