'use server'

import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, SESSION_TRVANI_MS, signSession } from '@/lib/session'
import type { FormState } from '@/lib/forms'

// Hashuje se před porovnáním, aby délka zadaného hesla neunikla
// a porovnání běželo v konstantním čase.
function hesloSedi(zadane: string, spravne: string): boolean {
  const a = createHash('sha256').update(zadane).digest()
  const b = createHash('sha256').update(spravne).digest()
  return timingSafeEqual(a, b)
}

export async function prihlasit(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const heslo = String(formData.get('heslo') ?? '')
  const spravneHeslo = process.env.ADMIN_PASSWORD
  const secret = process.env.SESSION_SECRET

  if (!spravneHeslo || !secret) {
    return { chyba: 'Server není nastavený — chybí ADMIN_PASSWORD nebo SESSION_SECRET.' }
  }

  if (!hesloSedi(heslo, spravneHeslo)) {
    return { chyba: 'Nesprávné heslo.' }
  }

  const expiresAt = Date.now() + SESSION_TRVANI_MS
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, signSession(expiresAt, secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  })

  // Cíl se bere z formuláře, ale musí zůstat uvnitř /sprava,
  // jinak by šlo přihlášení zneužít k přesměrování kamkoli.
  const pokracovat = String(formData.get('pokracovat') ?? '/sprava')
  redirect(pokracovat.startsWith('/sprava') ? pokracovat : '/sprava')
}

export async function odhlasit(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/prihlaseni')
}
