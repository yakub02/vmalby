import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FotoPlocha } from '@/components/FotoPlocha'
import { NAZVY_KATEGORII } from '@/lib/kategorie'
import { UKAZKOVE_REALIZACE } from '@/lib/ukazkovyObsah'

export function generateStaticParams() {
  return UKAZKOVE_REALIZACE.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const realizace = UKAZKOVE_REALIZACE.find((r) => r.slug === slug)

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
  const realizace = UKAZKOVE_REALIZACE.find((r) => r.slug === slug)

  if (!realizace) notFound()

  return (
    <main className="wrap detail">
      <span className="nadtitulek">
        {NAZVY_KATEGORII[realizace.kategorie]} — {realizace.lokalita} — {realizace.rok}
      </span>
      <h1 className="detail__nadpis">{realizace.nazev}</h1>

      {/* Bezpečné jen proto, že popis prochází serverovou sanitizací při ukládání. */}
      <div className="detail__popis" dangerouslySetInnerHTML={{ __html: realizace.popis }} />

      <div className="detail__galerie">
        {realizace.fotky.map((fotka, i) => (
          <FotoPlocha
            key={fotka.id}
            pomer={i === 0 ? '16 / 9' : '4 / 3'}
            stitek={i === 0 ? 'Foto: doplní se' : undefined}
          />
        ))}
      </div>

      <Link className="zpet" href="/realizace">
        ← Zpět na realizace
      </Link>
    </main>
  )
}
