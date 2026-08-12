import Link from 'next/link'
import type { Kategorie } from '@prisma/client'
import { RealizaceKarta } from '@/components/RealizaceKarta'
import { KATEGORIE_PORADI, NAZVY_KATEGORII } from '@/lib/kategorie'
import { UKAZKOVE_REALIZACE } from '@/lib/ukazkovyObsah'

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

  const realizace = aktivni
    ? UKAZKOVE_REALIZACE.filter((r) => r.kategorie === aktivni)
    : UKAZKOVE_REALIZACE

  return (
    <main className="wrap">
      <section className="sekce">
        <div className="sekce__hlava">
          <div>
            <span className="nadtitulek">Portfolio</span>
            <h1 className="sekce__nadpis">Realizace</h1>
          </div>
          <p className="sekce__poznamka">
            Od celobytové malby po uměleckou stěnu — filtrovat lze podle techniky.
          </p>
        </div>

        <nav className="filtr" aria-label="Filtr podle kategorie">
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
          <p className="text-blok">V této kategorii zatím žádnou realizaci nemáme.</p>
        ) : (
          <div className="mrizka">
            {realizace.map((r) => (
              <RealizaceKarta key={r.id} realizace={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
