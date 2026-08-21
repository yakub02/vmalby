'use server'

import type { Kategorie } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { cestyProRealizaci } from '@/lib/revalidace'
import type { FormState } from '@/lib/forms'

const KATEGORIE: Kategorie[] = ['MALBA', 'STUK', 'BETON', 'KOVY', 'TAPETY']

export async function ulozRealizaci(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get('id') ?? '').trim()
  const nazev = String(formData.get('nazev') ?? '').trim()
  const lokalita = String(formData.get('lokalita') ?? '').trim()
  const rokRaw = String(formData.get('rok') ?? '').trim()
  const kategorieRaw = String(formData.get('kategorie') ?? '').trim()
  const popis = String(formData.get('popis') ?? '')
  const vybrana = formData.get('vybrana') === 'on'

  if (!nazev) return { chyba: 'Vyplňte název realizace.' }
  if (!lokalita) return { chyba: 'Vyplňte lokalitu.' }

  const rok = Number(rokRaw)
  if (!Number.isInteger(rok) || rok < 1992 || rok > 2100) {
    return { chyba: 'Rok musí být číslo mezi 1992 a 2100.' }
  }

  if (!KATEGORIE.includes(kategorieRaw as Kategorie)) {
    return { chyba: 'Vyberte kategorii.' }
  }
  const kategorie = kategorieRaw as Kategorie

  const data = { nazev, lokalita, rok, kategorie, popis, vybrana }

  const ulozena = id
    ? await prisma.realizace.update({ where: { id }, data })
    : await prisma.realizace.create({ data: { ...data, slug: slugify(nazev) } })

  for (const cesta of cestyProRealizaci(ulozena.slug)) {
    revalidatePath(cesta)
  }

  return { ok: true }
}

export async function smazRealizaci(id: string): Promise<void> {
  const smazana = await prisma.realizace.delete({ where: { id } })

  for (const cesta of cestyProRealizaci(smazana.slug)) {
    revalidatePath(cesta)
  }
}
