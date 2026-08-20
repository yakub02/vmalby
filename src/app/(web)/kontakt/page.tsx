import { Navigace } from '@/components/Navigace'
import { FIREMNI_UDAJE, UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export const metadata = {
  title: 'Kontakt — V Malby',
  description: 'Vmalby s.r.o. — malířské a řemeslné práce, Praha a okolí.',
}

export default function KontaktPage() {
  return (
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">Kontakt</p>
          <h1 className="zahlavi__nadpis">Ozvěte se s projektem</h1>
          <p className="blok__text">
            Napište, co potřebujete udělat a kde. Pokud to jde, přiložte fotku prostoru —
            ušetří nám to jedno kolo dotazů.
          </p>
        </div>

        <section className="blok okraj">
          <p>
            <a className="odkaz odkaz--velky" href={`mailto:${UKAZKOVE_TEXTY.kontaktEmail}`}>
              {UKAZKOVE_TEXTY.kontaktEmail}
            </a>
          </p>
          <div className="blok__rada">
            <div>
              <p className="popisek">Telefon</p>
              <p className="paticka__hodnota">{UKAZKOVE_TEXTY.kontaktTelefon}</p>
            </div>
            <div>
              <p className="popisek">Sídlo</p>
              <p className="paticka__hodnota">Vmalby s.r.o., {UKAZKOVE_TEXTY.kontaktAdresa}</p>
            </div>
          </div>
        </section>

        <section className="blok okraj">
          <p className="popisek">Fakturační údaje</p>
          <div className="blok__rada">
            <div>
              <p className="popisek">IČ</p>
              <p className="paticka__hodnota">{FIREMNI_UDAJE.ic}</p>
            </div>
            <div>
              <p className="popisek">DIČ</p>
              <p className="paticka__hodnota">{FIREMNI_UDAJE.dic}</p>
            </div>
            <div>
              <p className="popisek">Bankovní účet</p>
              <p className="paticka__hodnota">{FIREMNI_UDAJE.ucet}</p>
            </div>
          </div>
          <p className="blok__text" style={{ marginTop: '1.5rem' }}>
            {FIREMNI_UDAJE.or}
          </p>
        </section>
      </main>
    </>
  )
}
