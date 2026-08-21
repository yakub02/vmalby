import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ClanekForm } from '@/components/ClanekForm'

export default async function ClanekDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === 'novy') {
    return (
      <>
        <h1>Nový článek</h1>
        <ClanekForm />
      </>
    )
  }

  const clanek = await prisma.clanek.findUnique({ where: { id } })
  if (!clanek) notFound()

  return (
    <>
      <h1>{clanek.nadpis}</h1>
      <ClanekForm vychozi={clanek} />
    </>
  )
}
