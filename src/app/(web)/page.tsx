import Link from 'next/link'
import { FotoPlocha } from '@/components/FotoPlocha'
import { Navigace } from '@/components/Navigace'
import { RealizacePolozka } from '@/components/RealizacePolozka'
import { vybraneRealizace } from '@/lib/content/realizace'
import { vsechnyClanky } from '@/lib/content/clanek'
import { nactiSiteTexts } from '@/lib/content/siteTexts'

export default async function DomuPage() {
  const [vybrane, clanky, texty] = await Promise.all([
    vybraneRealizace(4),
    vsechnyClanky(),
    nactiSiteTexts(),
  ])
  const clanek = clanky[0]

  return (
    <main>
      <section className="uvod okraj">
        <div className="uvod__plocha">
          <FotoPlocha stitek="Foto: doplní se" />
        </div>

        <Navigace />

        <div className="uvod__text">
          <p className="popisek popisek--svetly">Praha — od roku 1992</p>
          <h1 className="uvod__nadpis">{texty.heroNadpis}</h1>
        </div>

        <div className="uvod__pata">
          <p className="popisek popisek--svetly">Malba a lakování</p>
          <p className="popisek popisek--svetly">Benátský štuk</p>
          <p className="popisek popisek--svetly">Designový beton</p>
          <p className="popisek popisek--svetly">Imitace kovů</p>
          <p className="popisek popisek--svetly">Tapetování</p>
        </div>
      </section>

      <section className="rada okraj">
        {vybrane.map((realizace, i) => (
          <RealizacePolozka key={realizace.id} realizace={realizace} poradi={i + 1} />
        ))}
        <p>
          <Link className="odkaz" href="/realizace">
            Všechny realizace
          </Link>
        </p>
      </section>

      <section className="blok okraj">
        <p className="popisek">Ateliér</p>
        <h2 className="blok__nadpis">{texty.oNasNadpis}</h2>
        <p className="blok__text">{texty.oNasText}</p>
        <div className="blok__rada">
          <div>
            <p className="popisek">Založeno</p>
            <p className="paticka__hodnota">1992</p>
          </div>
          <div>
            <p className="popisek">Ocenění</p>
            <p className="paticka__hodnota">Best of Realty</p>
          </div>
          <div>
            <p className="popisek">Spolupráce</p>
            <p className="paticka__hodnota">Pavel Hayek</p>
          </div>
        </div>
      </section>

      {clanek && (
        <section className="blok okraj">
          <p className="popisek">Z dílny</p>
          <h2 className="blok__nadpis">{clanek.nadpis}</h2>
          <p className="blok__text">{clanek.perex}</p>
          <p style={{ marginTop: '2rem' }}>
            <Link className="odkaz" href="/aktuality">
              Všechny články
            </Link>
          </p>
        </section>
      )}

      <section className="blok okraj">
        <p className="popisek">Kontakt</p>
        <h2 className="blok__nadpis">Máte projekt, který potřebuje pořádný povrch?</h2>
        <p style={{ marginTop: '2rem' }}>
          <a className="odkaz odkaz--velky" href={`mailto:${texty.kontaktEmail}`}>
            {texty.kontaktEmail}
          </a>
        </p>
      </section>
    </main>
  )
}
