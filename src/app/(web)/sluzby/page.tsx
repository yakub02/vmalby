import Link from 'next/link'
import { Navigace } from '@/components/Navigace'
import { KATEGORIE_PORADI, NAZVY_KATEGORII } from '@/lib/kategorie'

export const metadata = {
  title: 'Služby — V Malby',
  description: 'Malba a lakování, benátský štuk, designový beton, imitace kovů a tapetování.',
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
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">Služby — pět technik</p>
          <h1 className="zahlavi__nadpis">Co umíme udělat na zdi</h1>
        </div>

        <section className="okraj">
          <ul className="zapisy">
            {KATEGORIE_PORADI.map((kategorie, i) => (
              <li key={kategorie}>
                <p className="popisek">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="zapisy__nadpis">{NAZVY_KATEGORII[kategorie]}</h2>
                <p className="zapisy__perex">{POPISY[kategorie]}</p>
                <p style={{ marginTop: '1.25rem' }}>
                  <Link className="odkaz" href={`/realizace?kategorie=${kategorie}`}>
                    Realizace
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}
