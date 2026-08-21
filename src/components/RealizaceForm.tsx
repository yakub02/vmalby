'use client'

import { useActionState } from 'react'
import { ulozRealizaci } from '@/lib/actions/realizace'
import type { FormState } from '@/lib/forms'
import { Editor } from '@/components/Editor'

type Vychozi = {
  id?: string
  nazev?: string
  lokalita?: string
  rok?: number
  kategorie?: string
  popis?: string
  vybrana?: boolean
}

const KATEGORIE = [
  ['MALBA', 'Malba a lakování'],
  ['STUK', 'Dekorativní štuk'],
  ['BETON', 'Designový beton'],
  ['KOVY', 'Imitace kovů'],
  ['TAPETY', 'Tapety'],
] as const

const pocatecniStav: FormState = {}

export function RealizaceForm({ vychozi = {} }: { vychozi?: Vychozi }) {
  const [stav, formAction, cekaSe] = useActionState(ulozRealizaci, pocatecniStav)

  return (
    <form action={formAction}>
      {vychozi.id && <input type="hidden" name="id" value={vychozi.id} />}
      {stav.chyba && <p className="sprava__chyba">{stav.chyba}</p>}
      {stav.ok && <p className="sprava__meta">Uloženo.</p>}

      <div className="sprava__pole">
        <label htmlFor="nazev">Název realizace</label>
        <input id="nazev" name="nazev" type="text" defaultValue={vychozi.nazev ?? ''} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="lokalita">Lokalita</label>
        <input id="lokalita" name="lokalita" type="text" defaultValue={vychozi.lokalita ?? ''} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="rok">Rok</label>
        <input id="rok" name="rok" type="number" min={1992} max={2100} defaultValue={vychozi.rok ?? new Date().getFullYear()} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="kategorie">Kategorie</label>
        <select id="kategorie" name="kategorie" defaultValue={vychozi.kategorie ?? 'MALBA'}>
          {KATEGORIE.map(([hodnota, popisek]) => (
            <option key={hodnota} value={hodnota}>
              {popisek}
            </option>
          ))}
        </select>
      </div>

      <div className="sprava__pole">
        <label>Popis</label>
        <Editor name="popis" vychozi={vychozi.popis ?? ''} />
      </div>

      <div className="sprava__pole">
        <label>
          <input type="checkbox" name="vybrana" defaultChecked={vychozi.vybrana ?? false} /> Zobrazit
          na úvodní stránce
        </label>
      </div>

      <button className="sprava__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
