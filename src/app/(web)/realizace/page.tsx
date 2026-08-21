import Link from 'next/link'
import type { Kategorie } from '@prisma/client'
import { Navigace } from '@/components/Navigace'
import { RealizacePolozka } from '@/components/RealizacePolozka'
import { KATEGORIE_PORADI, NAZVY_KATEGORII } from '@/lib/kategorie'
import { vsechnyRealizace } from '@/lib/content/realizace'

export const metadata = {
  title: 'Realizace — V Malby',
  description: 'Portfolio malířských, štukatérských a betonových realizací v Praze a okolí.',
}

function jeKategorie(hodnota: string | undefined): hodnota is Kategorie {
  return hodnota !== undefined && KATEGORIE_PORADI.includes(hodnota as Kategorie)
}

export default async function RealizacePage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>
}) {
  const { kategorie } = await searchParams
  const aktivni = jeKategorie(kategorie) ? kategorie : undefined

  const realizace = await vsechnyRealizace(aktivni)

  return (
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">Portfolio — {realizace.length} realizací</p>
          <h1 className="zahlavi__nadpis">Práce, která se dá vidět zblízka</h1>
        </div>

        <nav className="filtr okraj" aria-label="Filtr podle techniky">
          <Link href="/realizace" aria-current={aktivni === undefined ? 'true' : undefined}>
            Vše
          </Link>
          {KATEGORIE_PORADI.map((k) => (
            <Link
              key={k}
              href={`/realizace?kategorie=${k}`}
              aria-current={aktivni === k ? 'true' : undefined}
            >
              {NAZVY_KATEGORII[k]}
            </Link>
          ))}
        </nav>

        {realizace.length === 0 ? (
          <div className="blok okraj">
            <p className="blok__text">V této technice zatím žádnou realizaci nemáme.</p>
          </div>
        ) : (
          <section className="rada okraj">
            {realizace.map((r, i) => (
              <RealizacePolozka key={r.id} realizace={r} poradi={i + 1} />
            ))}
          </section>
        )}
      </main>
    </>
  )
}
