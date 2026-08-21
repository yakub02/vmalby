'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { cestyProClanek } from '@/lib/revalidace'
import { sanitizujObsah } from '@/lib/sanitizace'
import type { FormState } from '@/lib/forms'

export async function ulozClanek(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get('id') ?? '').trim()
  const nadpis = String(formData.get('nadpis') ?? '').trim()
  const perex = String(formData.get('perex') ?? '').trim()
  const obsah = sanitizujObsah(String(formData.get('obsah') ?? ''))
  const titulniFoto = String(formData.get('titulniFoto') ?? '').trim() || null
  const datumRaw = String(formData.get('datum') ?? '').trim()

  if (!nadpis) return { chyba: 'Vyplňte nadpis článku.' }

  const datum = datumRaw ? new Date(datumRaw) : new Date()
  if (Number.isNaN(datum.getTime())) return { chyba: 'Datum není platné.' }

  const data = { nadpis, perex, obsah, titulniFoto, datum }

  const ulozeny = id
    ? await prisma.clanek.update({ where: { id }, data })
    : await prisma.clanek.create({ data: { ...data, slug: slugify(nadpis) } })

  for (const cesta of cestyProClanek(ulozeny.slug)) {
    revalidatePath(cesta)
  }

  return { ok: true }
}

export async function smazClanek(id: string): Promise<void> {
  const smazany = await prisma.clanek.delete({ where: { id } })

  for (const cesta of cestyProClanek(smazany.slug)) {
    revalidatePath(cesta)
  }
}
