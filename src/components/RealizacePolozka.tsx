import Link from 'next/link'
import { FotoPlocha } from '@/components/FotoPlocha'
import { Odhaleni } from '@/components/Odhaleni'
import { NAZVY_KATEGORII } from '@/lib/kategorie'
import type { RealizaceSFotkami } from '@/lib/ukazkovyObsah'

/**
 * Realizace není karta — je to fotografie s popiskem. Šířku a poměr stran
 * střídá CSS podle pořadí, aby výpis nepůsobil jako katalog dlaždic.
 */
export function RealizacePolozka({
  realizace,
  poradi,
}: {
  realizace: RealizaceSFotkami
  poradi: number
}) {
  return (
    <Odhaleni>
      <article className="polozka">
        <Link href={`/realizace/${realizace.slug}`} className="polozka__media">
          <FotoPlocha
            src={realizace.fotky[0]?.url}
            alt={realizace.fotky[0]?.popisek || realizace.nazev}
            stitek={realizace.fotky[0]?.url ? undefined : 'Foto: doplní se'}
          />
        </Link>
        <div className="polozka__popis">
          <p className="popisek">
            <span className="polozka__cislo">{String(poradi).padStart(2, '0')}</span>
            {' — '}
            {NAZVY_KATEGORII[realizace.kategorie]}
          </p>
          <Link href={`/realizace/${realizace.slug}`}>
            <h3 className="polozka__nazev">{realizace.nazev}</h3>
          </Link>
          <p className="popisek" style={{ marginTop: '0.75rem' }}>
            {realizace.lokalita} — {realizace.rok}
          </p>
        </div>
      </article>
    </Odhaleni>
  )
}
