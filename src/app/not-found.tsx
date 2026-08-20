import Link from 'next/link'
import { Navigace } from '@/components/Navigace'
import { Paticka } from '@/components/Paticka'

export const metadata = {
  title: 'Stránka nenalezena — V Malby',
}

/**
 * Kořenový not-found — zachytává jak volání notFound() z libovolné stránky
 * (např. neexistující slug realizace), tak úplně neznámé URL. Bez tohoto
 * souboru Next.js vykreslí svoji vlastní anglickou stránku bez brandingu.
 */
export default function NotFound() {
  return (
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">404</p>
          <h1 className="zahlavi__nadpis">Tahle stránka tu není</h1>
          <p className="blok__text">
            Odkaz je asi starý, nebo jste se překlepli v adrese. Zkuste se vrátit na realizace
            nebo na úvodní stránku.
          </p>
          <p style={{ marginTop: '2rem' }}>
            <Link className="odkaz" href="/">
              Zpět na úvod
            </Link>
          </p>
        </div>
      </main>
      <Paticka />
    </>
  )
}
