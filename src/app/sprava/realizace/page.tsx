import Link from 'next/link'
import { vsechnyRealizace } from '@/lib/content/realizace'
import { smazRealizaci } from '@/lib/actions/realizace'
import { SmazatTlacitko } from '@/components/SmazatTlacitko'

export default async function SpravaRealizacePage() {
  const realizace = await vsechnyRealizace()

  return (
    <>
      <h1>Realizace</h1>
      <Link className="sprava__tlacitko" href="/sprava/realizace/novy">
        + Přidat realizaci
      </Link>

      {realizace.length === 0 && <p className="sprava__meta">Zatím tu není žádná realizace.</p>}

      <ul className="sprava__seznam">
        {realizace.map((r) => (
          <li key={r.id} className="sprava__radek">
            <span className="sprava__radek-nazev">{r.nazev}</span>
            <span className="sprava__meta">
              {r.lokalita} · {r.rok}
              {r.vybrana ? ' · na úvodu' : ''}
            </span>
            <Link href={`/sprava/realizace/${r.id}`}>Upravit</Link>
            <SmazatTlacitko id={r.id} popis={r.nazev} akce={smazRealizaci} />
          </li>
        ))}
      </ul>
    </>
  )
}
