import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { RealizaceForm } from '@/components/RealizaceForm'

export default async function RealizaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === 'novy') {
    return (
      <>
        <h1>Nová realizace</h1>
        <RealizaceForm />
      </>
    )
  }

  const realizace = await prisma.realizace.findUnique({ where: { id } })
  if (!realizace) notFound()

  return (
    <>
      <h1>{realizace.nazev}</h1>
      <RealizaceForm vychozi={realizace} />
    </>
  )
}
