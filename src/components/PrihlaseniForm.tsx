'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { prihlasit } from '@/lib/auth'
import type { FormState } from '@/lib/forms'

const pocatecniStav: FormState = {}

export function PrihlaseniForm() {
  const searchParams = useSearchParams()
  const pokracovat = searchParams.get('pokracovat') ?? '/sprava'
  const [stav, formAction, cekaSe] = useActionState(prihlasit, pocatecniStav)

  return (
    <form action={formAction} className="prihlaseni__form">
      <h1 className="prihlaseni__nadpis">Správa obsahu</h1>
      <input type="hidden" name="pokracovat" value={pokracovat} />
      <label className="prihlaseni__label" htmlFor="heslo">
        Heslo
      </label>
      <input
        className="prihlaseni__input"
        id="heslo"
        name="heslo"
        type="password"
        autoComplete="current-password"
        required
      />
      {stav.chyba && <p className="prihlaseni__chyba">{stav.chyba}</p>}
      <button className="prihlaseni__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Přihlašuji…' : 'Přihlásit'}
      </button>
    </form>
  )
}
