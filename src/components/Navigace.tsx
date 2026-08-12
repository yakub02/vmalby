import Link from 'next/link'

const ODKAZY = [
  ['/realizace', 'Realizace'],
  ['/atelier', 'Ateliér'],
  ['/sluzby', 'Služby'],
  ['/aktuality', 'Aktuality'],
  ['/kontakt', 'Kontakt'],
] as const

export function Navigace() {
  return (
    <header className="hlavicka">
      <div className="wrap hlavicka__vnitrek">
        <Link href="/" className="znacka">
          V&nbsp;Malby
        </Link>
        <nav className="navigace" aria-label="Hlavní navigace">
          {ODKAZY.map(([href, popisek]) => (
            <Link key={href} href={href}>
              {popisek}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
