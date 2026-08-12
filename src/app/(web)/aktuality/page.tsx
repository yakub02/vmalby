import { UKAZKOVE_CLANKY } from '@/lib/ukazkovyObsah'

export const metadata = {
  title: 'Aktuality — V Malby',
  description: 'Novinky z dílny, postupy a realizace v procesu.',
}

export default function AktualityPage() {
  return (
    <main className="wrap">
      <section className="sekce">
        <div className="sekce__hlava">
          <div>
            <span className="nadtitulek">Aktuality</span>
            <h1 className="sekce__nadpis">Z dílny</h1>
          </div>
          <p className="sekce__poznamka">
            Postupy, materiály a rozpracované realizace.
          </p>
        </div>

        {UKAZKOVE_CLANKY.length === 0 ? (
          <p className="text-blok">Zatím tu není žádný článek.</p>
        ) : (
          <ul className="aktuality">
            {UKAZKOVE_CLANKY.map((clanek) => (
              <li key={clanek.id}>
                <span className="aktuality__datum">
                  {clanek.datum.toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <h2 className="aktuality__nadpis">{clanek.nadpis}</h2>
                <p className="aktuality__perex">{clanek.perex}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
