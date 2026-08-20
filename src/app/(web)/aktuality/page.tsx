import { Navigace } from '@/components/Navigace'
import { UKAZKOVE_CLANKY } from '@/lib/ukazkovyObsah'

export const metadata = {
  title: 'Aktuality — V Malby',
  description: 'Novinky z dílny, postupy a realizace v procesu.',
}

export default function AktualityPage() {
  return (
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">Aktuality</p>
          <h1 className="zahlavi__nadpis">Z dílny</h1>
        </div>

        <section className="okraj">
          {UKAZKOVE_CLANKY.length === 0 ? (
            <p className="blok__text">Zatím tu není žádný článek.</p>
          ) : (
            <ul className="zapisy">
              {UKAZKOVE_CLANKY.map((clanek) => (
                <li key={clanek.id}>
                  <p className="popisek">
                    {clanek.datum.toLocaleDateString('cs-CZ', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <h2 className="zapisy__nadpis">{clanek.nadpis}</h2>
                  <p className="zapisy__perex">{clanek.perex}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
