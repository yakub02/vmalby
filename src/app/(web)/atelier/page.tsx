import { Navigace } from '@/components/Navigace'
import { UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export const metadata = {
  title: 'Ateliér — V Malby',
  description: 'Historie firmy od roku 1992, hodnoty a průběh zakázky.',
}

const PRUBEH = [
  ['Prohlídka', 'Přijedeme se podívat na místo a probereme, co má povrch vydržet.'],
  ['Vzorek', 'Na kus stěny naneseme vzorek v odstínu a struktuře, kterou schválíte.'],
  ['Realizace', 'Pracujeme po vrstvách, každou necháme vyzrát. Prostor předáváme uklizený.'],
] as const

export default function AtelierPage() {
  return (
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">Ateliér — Praha</p>
          <h1 className="zahlavi__nadpis">{UKAZKOVE_TEXTY.oNasNadpis}</h1>
          <p className="blok__text">{UKAZKOVE_TEXTY.oNasText}</p>
        </div>

        <section className="blok okraj">
          <p className="popisek">Průběh zakázky</p>
          <ol className="zapisy" style={{ marginTop: '2rem' }}>
            {PRUBEH.map(([nazev, popis], i) => (
              <li key={nazev}>
                <p className="popisek">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="zapisy__nadpis">{nazev}</h2>
                <p className="zapisy__perex">{popis}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  )
}
