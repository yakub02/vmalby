import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FotoPlocha } from '@/components/FotoPlocha'
import { Navigace } from '@/components/Navigace'
import { NAZVY_KATEGORII } from '@/lib/kategorie'
import { realizacePodleSlug, vsechnyRealizace } from '@/lib/content/realizace'

export async function generateStaticParams() {
  const realizace = await vsechnyRealizace()
  return realizace.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const realizace = await realizacePodleSlug(slug)

  return {
    title: realizace ? `${realizace.nazev} — V Malby` : 'Realizace — V Malby',
  }
}

export default async function RealizaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const realizace = await realizacePodleSlug(slug)

  if (!realizace) notFound()

  return (
    <>
      <Navigace pevna />
      <main>
        <div className="zahlavi okraj">
          <p className="popisek">
            {NAZVY_KATEGORII[realizace.kategorie]} — {realizace.lokalita} — {realizace.rok}
          </p>
          <h1 className="detail__nadpis">{realizace.nazev}</h1>

          {/* Bezpečné jen proto, že popis prochází serverovou sanitizací při ukládání. */}
          <div className="detail__popis" dangerouslySetInnerHTML={{ __html: realizace.popis }} />
        </div>

        <div className="galerie okraj">
          {realizace.fotky.map((fotka) => (
            <div key={fotka.id} className="galerie__snimek">
              <FotoPlocha
                src={fotka.url}
                alt={fotka.popisek || realizace.nazev}
                stitek={fotka.url ? undefined : 'Foto: doplní se'}
              />
            </div>
          ))}
        </div>

        <div className="blok okraj" style={{ marginTop: 'clamp(3rem, 7vw, 5rem)' }}>
          <Link className="odkaz" href="/realizace">
            Zpět na realizace
          </Link>
        </div>
      </main>
    </>
  )
}
