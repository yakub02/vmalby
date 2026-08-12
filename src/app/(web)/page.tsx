import Link from 'next/link'
import { RealizaceKarta } from '@/components/RealizaceKarta'
import { UKAZKOVE_CLANKY, UKAZKOVE_REALIZACE, UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export default function DomuPage() {
  const vybrane = UKAZKOVE_REALIZACE.filter((r) => r.vybrana).slice(0, 4)
  const clanky = UKAZKOVE_CLANKY.slice(0, 2)

  return (
    <main>
      <section className="hero">
        <span className="hero__stitek">Foto: doplní se</span>
        <div>
          <h1 className="hero__nadpis">{UKAZKOVE_TEXTY.heroNadpis}</h1>
          <p className="hero__podnadpis">{UKAZKOVE_TEXTY.heroPodnadpis}</p>
        </div>
      </section>

      <div className="wrap">
        <div className="fakta">
          <span>
            <b>1992</b> — rok založení
          </span>
          <span>
            <b>Praha</b> a okolí
          </span>
          <span>
            <b>Best of Realty</b> — oceněný projekt
          </span>
        </div>

        <section className="sekce">
          <div className="sekce__hlava">
            <div>
              <span className="nadtitulek">Vybrané realizace</span>
              <h2 className="sekce__nadpis">Práce, která se dá vidět zblízka</h2>
            </div>
            <p className="sekce__poznamka">
              Každá realizace má vlastní stránku s popisem postupu a galerií.
            </p>
          </div>

          <div className="mrizka">
            {vybrane.map((realizace) => (
              <RealizaceKarta key={realizace.id} realizace={realizace} />
            ))}
          </div>
        </section>

        <section className="sekce">
          <div className="sekce__hlava">
            <div>
              <span className="nadtitulek">Ateliér</span>
              <h2 className="sekce__nadpis">{UKAZKOVE_TEXTY.oNasNadpis}</h2>
            </div>
            <p className="sekce__poznamka">
              <Link href="/atelier">Více o firmě a průběhu zakázky</Link>
            </p>
          </div>
          <p className="text-blok">{UKAZKOVE_TEXTY.oNasText}</p>
        </section>

        <section className="sekce">
          <div className="sekce__hlava">
            <div>
              <span className="nadtitulek">Aktuality</span>
              <h2 className="sekce__nadpis">Z dílny</h2>
            </div>
            <p className="sekce__poznamka">
              <Link href="/aktuality">Všechny články</Link>
            </p>
          </div>

          <ul className="aktuality">
            {clanky.map((clanek) => (
              <li key={clanek.id}>
                <span className="aktuality__datum">
                  {clanek.datum.toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <h3 className="aktuality__nadpis">{clanek.nadpis}</h3>
                <p className="aktuality__perex">{clanek.perex}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="sekce">
          <span className="nadtitulek">Kontakt</span>
          <h2 className="vyzva__nadpis">Máte projekt, který potřebuje pořádný povrch?</h2>
          <a className="vyzva__kontakt" href={`mailto:${UKAZKOVE_TEXTY.kontaktEmail}`}>
            {UKAZKOVE_TEXTY.kontaktEmail}
          </a>
          <p className="vyzva__radek">
            {UKAZKOVE_TEXTY.kontaktTelefon} · {UKAZKOVE_TEXTY.kontaktAdresa}
          </p>
        </section>
      </div>
    </main>
  )
}
