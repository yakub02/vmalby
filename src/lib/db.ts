import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function vytvorKlienta(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('Chybí DATABASE_URL — nastav ho v .env.local')
  }

  // Prisma 7 nemá Rust engine, spojení obstarává driver adapter.
  return new PrismaClient({ adapter: new PrismaPg(connectionString) })
}

export const prisma = globalForPrisma.prisma ?? vytvorKlienta()

// Bez singletonu by dev server otevíral nové spojení při každém hot reloadu.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
