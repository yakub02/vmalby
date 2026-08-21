import Link from 'next/link'
import { vsechnyClanky } from '@/lib/content/clanek'
import { smazClanek } from '@/lib/actions/clanek'
import { SmazatTlacitko } from '@/components/SmazatTlacitko'

export default async function SpravaClankyPage() {
  const clanky = await vsechnyClanky()

  return (
    <>
      <h1>Články</h1>
      <Link className="sprava__tlacitko" href="/sprava/clanky/novy">
        + Přidat článek
      </Link>

      {clanky.length === 0 && <p className="sprava__meta">Zatím tu není žádný článek.</p>}

      <ul className="sprava__seznam">
        {clanky.map((c) => (
          <li key={c.id} className="sprava__radek">
            <span className="sprava__radek-nazev">{c.nadpis}</span>
            <span className="sprava__meta">{c.datum.toLocaleDateString('cs-CZ')}</span>
            <Link href={`/sprava/clanky/${c.id}`}>Upravit</Link>
            <SmazatTlacitko id={c.id} popis={c.nadpis} akce={smazClanek} />
          </li>
        ))}
      </ul>
    </>
  )
}
