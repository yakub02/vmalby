'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ODKAZY = [
  ['/realizace', 'Realizace'],
  ['/atelier', 'Ateliér'],
  ['/sluzby', 'Služby'],
  ['/aktuality', 'Aktuality'],
  ['/kontakt', 'Kontakt'],
] as const

/**
 * `pevna` = navigace stojí v toku stránky na světlém podkladu, přilepená
 * nahoru při scrollu (viz `.hlavicka--pevna`). Bez ní hlavička plave přes
 * úvodní fotografii a přebarví se do světla.
 */
export function Navigace({ pevna = false }: { pevna?: boolean }) {
  const cesta = usePathname()

  return (
    <header className={`hlavicka okraj${pevna ? ' hlavicka--pevna' : ''}`}>
      <Link href="/" className="znacka">
        V Malby
      </Link>
      <nav className="navigace" aria-label="Hlavní navigace">
        {ODKAZY.map(([href, popisek]) => (
          <Link key={href} href={href} aria-current={cesta.startsWith(href) ? 'true' : undefined}>
            {popisek}
          </Link>
        ))}
      </nav>
    </header>
  )
}
