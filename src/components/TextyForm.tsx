'use client'

import { useActionState } from 'react'
import { ulozSiteTexts } from '@/lib/actions/siteTexts'
import type { FormState } from '@/lib/forms'

const POLE: [string, string, 'text' | 'textarea'][] = [
  ['heroNadpis', 'Nadpis na úvodu', 'text'],
  ['heroPodnadpis', 'Podnadpis na úvodu', 'textarea'],
  ['oNasNadpis', 'O nás — nadpis', 'text'],
  ['oNasText', 'O nás — text', 'textarea'],
  ['oNasFoto', 'O nás — foto (URL z nahrání)', 'text'],
  ['sluzbyMalba', 'Služby — malba a lakování', 'textarea'],
  ['sluzbyStuk', 'Služby — dekorativní štuk', 'textarea'],
  ['sluzbyBeton', 'Služby — designový beton', 'textarea'],
  ['sluzbyKovy', 'Služby — imitace kovů', 'textarea'],
  ['sluzbyTapety', 'Služby — tapety', 'textarea'],
  ['kontaktEmail', 'E-mail', 'text'],
  ['kontaktTelefon', 'Telefon', 'text'],
  ['kontaktAdresa', 'Adresa', 'textarea'],
]

const pocatecniStav: FormState = {}

export function TextyForm({ vychozi }: { vychozi: Record<string, unknown> }) {
  const [stav, formAction, cekaSe] = useActionState(ulozSiteTexts, pocatecniStav)

  return (
    <form action={formAction}>
      {stav.chyba && <p className="sprava__chyba">{stav.chyba}</p>}
      {stav.ok && <p className="sprava__meta">Uloženo.</p>}

      {POLE.map(([nazev, popisek, typ]) => (
        <div className="sprava__pole" key={nazev}>
          <label htmlFor={nazev}>{popisek}</label>
          {typ === 'textarea' ? (
            <textarea id={nazev} name={nazev} rows={3} defaultValue={String(vychozi[nazev] ?? '')} />
          ) : (
            <input id={nazev} name={nazev} type="text" defaultValue={String(vychozi[nazev] ?? '')} />
          )}
        </div>
      ))}

      <button className="sprava__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
