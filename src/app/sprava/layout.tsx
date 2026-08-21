import Link from 'next/link'
import { odhlasit } from '@/lib/auth'
import './sprava.css'

export default function SpravaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sprava">
      <header className="sprava__hlavicka">
        <strong className="sprava__znacka">V Malby — správa obsahu</strong>
        <nav className="sprava__nav">
          <Link href="/sprava/realizace">Realizace</Link>
          <Link href="/sprava/clanky">Články</Link>
          <Link href="/sprava/texty">Texty stránek</Link>
        </nav>
        <form action={odhlasit}>
          <button type="submit" className="sprava__odhlasit">
            Odhlásit
          </button>
        </form>
      </header>
      <main className="sprava__obsah">{children}</main>
    </div>
  )
}
