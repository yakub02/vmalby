'use client'

import { useActionState } from 'react'
import { ulozClanek } from '@/lib/actions/clanek'
import type { FormState } from '@/lib/forms'
import { Editor } from '@/components/Editor'

type Vychozi = {
  id?: string
  nadpis?: string
  perex?: string
  titulniFoto?: string | null
  datum?: Date
  obsah?: string
}

const pocatecniStav: FormState = {}

function naDatumInput(datum: Date | undefined): string {
  return (datum ?? new Date()).toISOString().slice(0, 10)
}

export function ClanekForm({ vychozi = {} }: { vychozi?: Vychozi }) {
  const [stav, formAction, cekaSe] = useActionState(ulozClanek, pocatecniStav)

  return (
    <form action={formAction}>
      {vychozi.id && <input type="hidden" name="id" value={vychozi.id} />}
      {stav.chyba && <p className="sprava__chyba">{stav.chyba}</p>}
      {stav.ok && <p className="sprava__meta">Uloženo.</p>}

      <div className="sprava__pole">
        <label htmlFor="nadpis">Nadpis</label>
        <input id="nadpis" name="nadpis" type="text" defaultValue={vychozi.nadpis ?? ''} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="perex">Perex</label>
        <textarea id="perex" name="perex" rows={3} defaultValue={vychozi.perex ?? ''} />
      </div>

      <div className="sprava__pole">
        <label htmlFor="datum">Datum</label>
        <input id="datum" name="datum" type="date" defaultValue={naDatumInput(vychozi.datum)} />
      </div>

      <div className="sprava__pole">
        <label htmlFor="titulniFoto">Titulní foto (URL z nahrání)</label>
        <input
          id="titulniFoto"
          name="titulniFoto"
          type="text"
          defaultValue={vychozi.titulniFoto ?? ''}
          placeholder="/uploads/…"
        />
      </div>

      <div className="sprava__pole">
        <label>Obsah</label>
        <Editor name="obsah" vychozi={vychozi.obsah ?? ''} />
      </div>

      <button className="sprava__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
