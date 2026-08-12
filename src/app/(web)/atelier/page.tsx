import { UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export const metadata = {
  title: 'Ateliér — V Malby',
  description: 'Historie firmy od roku 1992, hodnoty a průběh zakázky.',
}

const PRUBEH = [
  ['01', 'Prohlídka', 'Přijedeme se podívat na místo a probereme, co má povrch vydržet.'],
  ['02', 'Vzorek', 'Na kus stěny naneseme vzorek v odstínu a struktuře, kterou schválíte.'],
  ['03', 'Realizace', 'Pracujeme po vrstvách, každou necháme vyzrát. Prostor předáváme uklizený.'],
] as const

export default function AtelierPage() {
  return (
    <main className="wrap">
      <section className="sekce">
        <div className="sekce__hlava">
          <div>
            <span className="nadtitulek">Ateliér</span>
            <h1 className="sekce__nadpis">{UKAZKOVE_TEXTY.oNasNadpis}</h1>
          </div>
          <p className="sekce__poznamka">Rodinná firma z Prahy, na trhu od roku 1992.</p>
        </div>
        <p className="text-blok">{UKAZKOVE_TEXTY.oNasText}</p>
      </section>

      <section className="sekce">
        <div className="sekce__hlava">
          <div>
            <span className="nadtitulek">Průběh zakázky</span>
            <h2 className="sekce__nadpis">Jak to u nás chodí</h2>
          </div>
        </div>
        <ul className="aktuality">
          {PRUBEH.map(([cislo, nazev, popis]) => (
            <li key={cislo}>
              <span className="aktuality__datum">{cislo}</span>
              <h3 className="aktuality__nadpis">{nazev}</h3>
              <p className="aktuality__perex">{popis}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
