import Link from 'next/link'
import { UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export function Paticka() {
  return (
    <footer className="paticka">
      <div className="wrap paticka__vnitrek">
        <div>
          <p className="znacka znacka--paticka">V&nbsp;Malby</p>
          <p className="paticka__radek">Malířské a řemeslné práce od roku 1992</p>
        </div>
        <div className="paticka__kontakt">
          <p className="paticka__radek">
            <a href={`mailto:${UKAZKOVE_TEXTY.kontaktEmail}`}>{UKAZKOVE_TEXTY.kontaktEmail}</a>
          </p>
          <p className="paticka__radek">{UKAZKOVE_TEXTY.kontaktTelefon}</p>
          <p className="paticka__radek">{UKAZKOVE_TEXTY.kontaktAdresa}</p>
        </div>
        <p className="paticka__radek paticka__copy">
          © {new Date().getFullYear()} Vmalby s.r.o. · <Link href="/prihlaseni">Správa obsahu</Link>
        </p>
      </div>
    </footer>
  )
}
