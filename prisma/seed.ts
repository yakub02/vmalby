import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { UKAZKOVE_REALIZACE, UKAZKOVE_CLANKY, UKAZKOVE_TEXTY } from '../src/lib/ukazkovyObsah.ts'

process.loadEnvFile('.env.local')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Chybí DATABASE_URL — nastav ho v .env.local')
}

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) })

function fotkaKeVlozeni(fotka: { popisek: string; poradi: number; url: string }) {
  return { url: fotka.url, popisek: fotka.popisek, poradi: fotka.poradi }
}

async function main() {
  for (const realizace of UKAZKOVE_REALIZACE) {
    const { fotky, ...data } = realizace
    await prisma.realizace.upsert({
      where: { slug: data.slug },
      update: { ...data, fotky: { deleteMany: {}, create: fotky.map(fotkaKeVlozeni) } },
      create: { ...data, fotky: { create: fotky.map(fotkaKeVlozeni) } },
    })
    console.log(`realizace: ${data.nazev}`)
  }

  for (const clanek of UKAZKOVE_CLANKY) {
    await prisma.clanek.upsert({
      where: { slug: clanek.slug },
      update: clanek,
      create: clanek,
    })
    console.log(`clanek: ${clanek.nadpis}`)
  }

  await prisma.siteTexts.upsert({
    where: { id: 'singleton' },
    update: UKAZKOVE_TEXTY,
    create: { id: 'singleton', ...UKAZKOVE_TEXTY },
  })
  console.log('siteTexts: uloženo')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (chyba) => {
    console.error(chyba)
    await prisma.$disconnect()
    process.exit(1)
  })
