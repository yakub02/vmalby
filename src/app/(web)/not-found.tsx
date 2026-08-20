import Link from 'next/link'
import { Navigace } from '@/components/Navigace'

export const metadata = {
  title: 'Stránka nenalezena — V Malby',
}

/**
 * not-found pro cokoli pod veřejným webem (např. notFound() na neexistujícím
 * slugu realizace). Bez vlastní <Paticka /> — tu už přidává WebLayout, který
 * tuhle stránku obaluje. Pro zcela neznámé URL mimo (web) skupinu platí
 * samostatný `src/app/not-found.tsx`.
 */
export default function WebNotFound() {
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
    </>
  )
}
