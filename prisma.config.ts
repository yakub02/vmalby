import { defineConfig, env } from 'prisma/config'

// Prisma sama čte jen `.env`, kdežto Next.js drží lokální hodnoty v `.env.local`.
// Bez tohohle načtení by `prisma migrate` neznalo DATABASE_URL. Na produkci soubor
// neexistuje a proměnné dodává hosting, proto se selhání ignoruje.
try {
  process.loadEnvFile('.env.local')
} catch {
  // .env.local není — počítá se s proměnnými z prostředí
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
