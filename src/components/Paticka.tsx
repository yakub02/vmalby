import Link from 'next/link'
import { UKAZKOVE_TEXTY } from '@/lib/ukazkovyObsah'

export function Paticka() {
  return (
    <footer className="paticka okraj">
      <div className="paticka__rada">
        <div>
          <p className="popisek">Vmalby s.r.o.</p>
          <p className="paticka__hodnota">Malířské a řemeslné práce od roku 1992</p>
        </div>
        <div>
          <p className="popisek">Kontakt</p>
          <p className="paticka__hodnota">
            <a href={`mailto:${UKAZKOVE_TEXTY.kontaktEmail}`}>{UKAZKOVE_TEXTY.kontaktEmail}</a>
          </p>
          <p className="paticka__hodnota">{UKAZKOVE_TEXTY.kontaktTelefon}</p>
        </div>
        <div>
          <p className="popisek">Kde působíme</p>
          <p className="paticka__hodnota">{UKAZKOVE_TEXTY.kontaktAdresa} a okolí</p>
        </div>
      </div>

      <div className="paticka__spodek">
        <p className="popisek">© {new Date().getFullYear()} Vmalby s.r.o.</p>
        <p className="popisek">
          <Link href="/prihlaseni">Správa obsahu</Link>
        </p>
      </div>
    </footer>
  )
}
