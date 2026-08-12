import { UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export const metadata = {
  title: 'Kontakt — V Malby',
  description: 'Vmalby s.r.o. — malířské a řemeslné práce, Praha a okolí.',
}

export default function KontaktPage() {
  return (
    <main className="wrap">
      <section className="sekce">
        <div className="sekce__hlava">
          <div>
            <span className="nadtitulek">Kontakt</span>
            <h1 className="sekce__nadpis">Ozvěte se s projektem</h1>
          </div>
          <p className="sekce__poznamka">
            Na poptávky odpovídáme do druhého pracovního dne.
          </p>
        </div>

        <p className="text-blok">
          Napište, co potřebujete udělat a kde. Pokud to jde, přiložte fotku prostoru —
          ušetří nám to jedno kolo dotazů.
        </p>

        <p style={{ marginTop: '2rem' }}>
          <a className="vyzva__kontakt" href={`mailto:${UKAZKOVE_TEXTY.kontaktEmail}`}>
            {UKAZKOVE_TEXTY.kontaktEmail}
          </a>
        </p>
        <p className="vyzva__radek">{UKAZKOVE_TEXTY.kontaktTelefon}</p>
        <p className="vyzva__radek">Vmalby s.r.o. · {UKAZKOVE_TEXTY.kontaktAdresa}</p>
      </section>
    </main>
  )
}
