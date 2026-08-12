import Link from 'next/link'
import { FotoPlocha } from '@/components/FotoPlocha'
import { NAZVY_KATEGORII } from '@/lib/kategorie'
import type { RealizaceSFotkami } from '@/lib/ukazkovyObsah'

export function RealizaceKarta({ realizace }: { realizace: RealizaceSFotkami }) {
  return (
    <article className="karta">
      <Link href={`/realizace/${realizace.slug}`} className="karta__odkaz">
        <div className="karta__foto">
          <FotoPlocha />
          <span className="karta__kategorie">{NAZVY_KATEGORII[realizace.kategorie]}</span>
        </div>
        <div className="karta__telo">
          <h3 className="karta__nazev">{realizace.nazev}</h3>
          <p className="karta__meta">
            {realizace.lokalita} — {realizace.rok}
          </p>
        </div>
      </Link>
    </article>
  )
}
