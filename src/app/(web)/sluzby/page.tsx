import Link from 'next/link'
import { KATEGORIE_PORADI, NAZVY_KATEGORII } from '@/lib/kategorie'

export const metadata = {
  title: 'Služby — V Malby',
  description:
    'Malba a lakování, benátský štuk, designový beton, imitace kovů a tapetování.',
}

const POPISY: Record<(typeof KATEGORIE_PORADI)[number], string> = {
  MALBA:
    'Interiérové i fasádní malby, lakování truhlářských prvků a zárubní. Práce v obydlených bytech řešíme po etapách, aby se dalo bydlet dál.',
  STUK:
    'Benátský a marocký štuk. Odstín mícháme na místě, u rekonstrukcí ho dokážeme dohledat podle fragmentu původní omítky.',
  BETON:
    'Designové betonové a cementové stěrky na stěny i nábytkové plochy. Bezespárý povrch, který snese vlhko v koupelně.',
  KOVY:
    'Imitace patinované mosazi, mědi a rezavé oceli. Povrch se dolaďuje podle světla v konkrétním prostoru.',
  TAPETY:
    'Papírové, vinylové i textilní tapety včetně náročných podkladů a klenutých stropů.',
}

export default function SluzbyPage() {
  return (
    <main className="wrap">
      <section className="sekce">
        <div className="sekce__hlava">
          <div>
            <span className="nadtitulek">Služby</span>
            <h1 className="sekce__nadpis">Pět technik, jedna dílna</h1>
          </div>
          <p className="sekce__poznamka">
            U každé techniky najdete hotové realizace v portfoliu.
          </p>
        </div>

        <ul className="aktuality">
          {KATEGORIE_PORADI.map((kategorie) => (
            <li key={kategorie}>
              <span className="aktuality__datum">{NAZVY_KATEGORII[kategorie]}</span>
              <p className="aktuality__perex">{POPISY[kategorie]}</p>
              <p className="vyzva__radek">
                <Link href={`/realizace?kategorie=${kategorie}`}>Realizace v této technice</Link>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
