# V Malby — vlastní redakční systém — implementační plán

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Postavit uvnitř jedné Next.js aplikace vlastní redakční systém — veřejné stránky čtou obsah z vlastní Postgres databáze, netechnický administrátor spravuje Realizace, Články a Texty stránek na `/sprava` po přihlášení jedním sdíleným heslem, a uložení formuláře se projeví na živém webu do pár vteřin.

**Architecture:** Jedna Next.js aplikace (App Router), žádný samostatný CMS proces a žádná cloudová CMS služba. Obsah leží v PostgreSQL, přístup přes Prisma. Redakční část je běžná větev routeru `/sprava`, chráněná `proxy.ts` a podepsaným httpOnly session cookie. Zápis probíhá server actions, které po uložení volají `revalidatePath()` na dotčené veřejné stránky — proto nejsou potřeba žádné webhooky.

**Tech Stack:** Next.js 16.2.10 (App Router, Turbopack) + React 19.2.4 + TypeScript, PostgreSQL + Prisma, Tiptap (rich text), sanitize-html (serverová sanitizace), sharp (resize fotek), Vitest (testy).

## Global Constraints

- **Tohle není Next.js, který znáš.** Před psaním kódu, který se dotýká Next API, si přečti příslušný soubor v `node_modules/next/dist/docs/`. Platí i pro věci, které „přece znáš".
- **Next 16: `middleware.ts` je deprecated a přejmenovaný na `proxy.ts`** (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Soubor musí exportovat funkci `proxy` (default nebo pojmenovaně). **Proxy běží defaultně v Node.js runtime** a `runtime` config v něm vyhodí chybu — proto v něm `node:crypto` funguje.
- Existující `params` v dynamických routách je `Promise` — vždy `const { slug } = await params`.
- Verze jsou pinnuté: `next` 16.2.10, `react`/`react-dom` 19.2.4. Neupgradovat v rámci tohoto plánu.
- Bez Tailwindu. Styluje se vlastním CSS nad tokeny v `src/app/tokens.css` (`--ground`, `--ink`, `--oxide`, `--line`, `--card-bg`, `--serif`, `--sans`, …). Nezavádět nové barvy mimo tokeny.
- Veškerý text viditelný uživateli je **česky** (včetně chybových hlášek v adminu).
- Balíčky se instalují bez `--force` a bez `--legacy-peer-deps`. Když npm hlásí peer konflikt, nahlas to a zastav se.
- Commit po každém tasku, do lokálního gitu. Nic se nepushuje bez souhlasu uživatele.
- Testy: `npx vitest run`. Task je hotový, až testy projdou a `npm run build` je zelený.
- **Soubor s `'use server'` smí exportovat jen async funkce.** Typy a konstanty proto patří do běžných modulů (`src/lib/forms.ts`, `src/lib/revalidace.ts`), ne do souborů se server actions.
- **Prisma je verze 7 a chová se jinak než starší návody.** `url` v `datasource` bloku už neexistuje — připojení se konfiguruje v `prisma.config.ts`. Prisma 7 nemá Rust engine, takže `PrismaClient` vyžaduje driver adapter (`@prisma/adapter-pg`). Prisma navíc čte jen `.env`, ne `.env.local`.

---

## Task 1: Prisma, databáze a obsahové modely

**Files:**
- Create: `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/db.ts`
- Modify: `package.json` (skripty), `.env.local.example`, `.gitignore`

**Interfaces:**
- Produces: `prisma` (singleton `PrismaClient` z `@/lib/db`), modely `Realizace`, `Clanek`, `SiteTexts`, enum `Kategorie`.

- [x] **Step 1: Instalace Prismy**

```bash
npm install @prisma/client @prisma/adapter-pg pg
npm install -D prisma @types/pg
```

`@prisma/adapter-pg` a `pg` jsou v Prisma 7 povinné — bez Rust enginu si klient sám spojení neotevře.

- [x] **Step 2: Schéma**

Vytvoř `prisma/schema.prisma` (bez `url` — ta patří do `prisma.config.ts`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum Kategorie {
  MALBA
  STUK
  BETON
  KOVY
  TAPETY
}

model Realizace {
  id        String    @id @default(cuid())
  slug      String    @unique
  nazev     String
  lokalita  String
  rok       Int
  kategorie Kategorie
  popis     String    @default("")
  fotky     Fotka[]
  vybrana   Boolean   @default(false)
  poradi    Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([vybrana])
  @@index([kategorie])
}

model Fotka {
  id          String    @id @default(cuid())
  url         String
  popisek     String    @default("")
  poradi      Int       @default(0)
  realizace   Realizace @relation(fields: [realizaceId], references: [id], onDelete: Cascade)
  realizaceId String

  @@index([realizaceId])
}

model Clanek {
  id          String   @id @default(cuid())
  slug        String   @unique
  nadpis      String
  perex       String   @default("")
  titulniFoto String?
  datum       DateTime @default(now())
  obsah       String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([datum])
}

model SiteTexts {
  id             String   @id @default("singleton")
  heroNadpis     String   @default("")
  heroPodnadpis  String   @default("")
  oNasNadpis     String   @default("")
  oNasText       String   @default("")
  oNasFoto       String?
  sluzbyMalba    String   @default("")
  sluzbyStuk     String   @default("")
  sluzbyBeton    String   @default("")
  sluzbyKovy     String   @default("")
  sluzbyTapety   String   @default("")
  kontaktEmail   String   @default("")
  kontaktTelefon String   @default("")
  kontaktAdresa  String   @default("")
  updatedAt      DateTime @updatedAt
}
```

`SiteTexts` má pevné `id = "singleton"` — je to jeden řádek, admin ho nikdy nezakládá ani nemaže, jen edituje.

- [x] **Step 3: Konfigurace připojení**

Vytvoř `prisma.config.ts` v rootu repa. Prisma sama čte jen `.env`, kdežto Next drží lokální hodnoty v `.env.local` — bez explicitního načtení by `prisma migrate` neznalo `DATABASE_URL`:

```ts
import { defineConfig, env } from 'prisma/config'

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
```

Ověř: `npx prisma validate` → „The schema at prisma\schema.prisma is valid 🚀"

- [x] **Step 4: Prisma klient jako singleton**

Vytvoř `src/lib/db.ts` (bez singletonu by dev server s hot reloadem otevíral nové spojení při každé změně a Postgres by došly connections):

```ts
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

Ověř: `npx prisma generate` → „Generated Prisma Client (v7…)"

- [x] **Step 5: Skripty a ignore**

Do `package.json` do `scripts` přidej:

```json
"db:migrate": "prisma migrate dev",
"db:generate": "prisma generate",
"db:studio": "prisma studio"
```

Do `.gitignore` přidej na konec:

```
# uploads (obsahové fotky, nepatří do repa)
/public/uploads/*
!/public/uploads/.gitkeep
```

- [x] **Step 6: Lokální databáze a první migrace**

Potřebuješ běžící Postgres a `DATABASE_URL` v `.env.local`. Pokud máš Docker:

```bash
docker run --name vmalby-pg -e POSTGRES_USER=vmalby -e POSTGRES_PASSWORD=vmalby -e POSTGRES_DB=vmalby -p 5432:5432 -d postgres:16
```

Pak:

```bash
npx prisma migrate dev --name init
```

Expected: vznikne `prisma/migrations/<timestamp>_init/migration.sql` a vypíše se „Your database is now in sync with your schema."

Pokud Postgres neběží, **zastav se a nahlas to** — nezakládej SQLite náhradu, přenositelnost na Postgres je zadání.

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema for Realizace, Clanek and SiteTexts"
```

---

## Task 2: Vitest a testovací kostra

**Files:**
- Create: `vitest.config.mts`, `src/lib/slug.ts`, `src/lib/slug.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `slugify(text: string): string` — používají ho Tasky 5 a 6 pro generování `slug` z názvu/nadpisu.

- [x] **Step 1: Instalace**

```bash
npm install -D vitest
```

- [x] **Step 2: Konfigurace**

Vytvoř `vitest.config.mts` — **přípona `.mts` je záměrná**, jako `.ts` ho Vite načítá jako CommonJS a hlásí varování o ESM syntaxi:

```ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
```

Do `package.json` do `scripts` přidej `"test": "vitest run"`.

- [x] **Step 3: Napiš padající test**

Vytvoř `src/lib/slug.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/slug'

describe('slugify', () => {
  it('odstraní diakritiku a udělá lowercase', () => {
    expect(slugify('Rezidence Šárka')).toBe('rezidence-sarka')
  })

  it('nahradí mezery a interpunkci jednou pomlčkou', () => {
    expect(slugify('Campus Science Park — umělecká stěna')).toBe(
      'campus-science-park-umelecka-stena'
    )
  })

  it('ořízne pomlčky na krajích', () => {
    expect(slugify('  ...Byt v Karlíně!  ')).toBe('byt-v-karline')
  })

  it('u prázdného vstupu vrátí prázdný řetězec', () => {
    expect(slugify('   ')).toBe('')
  })
})
```

- [x] **Step 4: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/slug.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/slug"`.

- [x] **Step 5: Implementace**

Vytvoř `src/lib/slug.ts`:

```ts
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [x] **Step 6: Spusť testy**

Run: `npx vitest run`
Expected: PASS, 4 testy.

- [x] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add Vitest harness and slugify helper"
```

---

## Task 3: Přihlášení — podepsané session cookie a ochrana /sprava

**Files:**
- Create: `src/lib/forms.ts`, `src/lib/session.ts`, `src/lib/session.test.ts`, `src/lib/auth.ts`, `src/proxy.ts`
- Create: `src/app/prihlaseni/page.tsx`, `src/app/prihlaseni/prihlaseni.css`, `src/components/PrihlaseniForm.tsx`

**Interfaces:**
- Consumes: nic z předchozích tasků.
- Produces:
  - `signSession(expiresAt: number, secret: string): string`
  - `verifySession(value: string | undefined, secret: string, now?: number): boolean`
  - `SESSION_COOKIE = 'vmalby_session'`
  - server actions `prihlasit(prevState: FormState, formData: FormData): Promise<FormState>` a `odhlasit(): Promise<void>` z `@/lib/auth`
  - typ `FormState = { chyba?: string; ok?: boolean }` z `@/lib/forms` — sdílí ho všechny formuláře v Tascích 3, 5, 6 a 9

- [x] **Step 1: Napiš padající testy podpisu**

Podpis musí být HMAC (ne jen hash), jinak by si kdokoli vyrobil platné cookie. Vytvoř `src/lib/session.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { signSession, verifySession } from '@/lib/session'

const SECRET = 'testovaci-tajemstvi-aspon-32-znaku-dlouhe'
const HOUR = 60 * 60 * 1000

describe('session cookie', () => {
  it('ověří vlastní čerstvý podpis', () => {
    const now = Date.now()
    const cookie = signSession(now + HOUR, SECRET)
    expect(verifySession(cookie, SECRET, now)).toBe(true)
  })

  it('odmítne prošlé cookie', () => {
    const now = Date.now()
    const cookie = signSession(now - 1, SECRET)
    expect(verifySession(cookie, SECRET, now)).toBe(false)
  })

  it('odmítne cookie podepsané jiným tajemstvím', () => {
    const now = Date.now()
    const cookie = signSession(now + HOUR, 'uplne-jine-tajemstvi-a-taky-dost-dlouhe')
    expect(verifySession(cookie, SECRET, now)).toBe(false)
  })

  it('odmítne cookie s ručně prodlouženou expirací', () => {
    const now = Date.now()
    const cookie = signSession(now + HOUR, SECRET)
    const [, podpis] = cookie.split('.')
    const podvrzene = `${now + 100 * HOUR}.${podpis}`
    expect(verifySession(podvrzene, SECRET, now)).toBe(false)
  })

  it('odmítne prázdné nebo poškozené cookie', () => {
    expect(verifySession(undefined, SECRET)).toBe(false)
    expect(verifySession('', SECRET)).toBe(false)
    expect(verifySession('nesmysl', SECRET)).toBe(false)
    expect(verifySession('123.', SECRET)).toBe(false)
  })
})
```

- [x] **Step 2: Spusť testy, ať vidíš, že padají**

Run: `npx vitest run src/lib/session.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/session"`.

- [x] **Step 3: Implementace podpisu**

Vytvoř `src/lib/session.ts`. `timingSafeEqual` se používá proto, aby porovnání podpisu neprozradilo správnou hodnotu po znacích:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'vmalby_session'
export const SESSION_TRVANI_MS = 7 * 24 * 60 * 60 * 1000

function podpis(expiresAt: number, secret: string): string {
  return createHmac('sha256', secret).update(`admin:${expiresAt}`).digest('hex')
}

export function signSession(expiresAt: number, secret: string): string {
  return `${expiresAt}.${podpis(expiresAt, secret)}`
}

export function verifySession(
  value: string | undefined,
  secret: string,
  now: number = Date.now()
): boolean {
  if (!value) return false

  const [expiresRaw, podpisZCookie] = value.split('.')
  if (!expiresRaw || !podpisZCookie) return false

  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return false

  const ocekavany = Buffer.from(podpis(expiresAt, secret), 'hex')
  const dorucený = Buffer.from(podpisZCookie, 'hex')
  if (ocekavany.length !== dorucený.length) return false

  return timingSafeEqual(ocekavany, dorucený)
}
```

- [x] **Step 4: Spusť testy**

Run: `npx vitest run`
Expected: PASS (slug + session).

- [x] **Step 5: Přečti si dokumentaci k proxy a cookies**

Read: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` (sekce Exports, Matcher, Runtime) a `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`.

- [x] **Step 6: Ochrana /sprava**

Vytvoř **`src/proxy.ts`** — soubor musí ležet na stejné úrovni jako `app/`, a protože tenhle projekt používá `src/app`, patří proxy do `src/`, ne do rootu. **Ověřeno:** v rootu se tiše ignoruje, build projde zelený a `/sprava` zůstane nechráněná. Kontrola je ve výpisu `npm run build` — musí tam být řádek `ƒ Proxy (Middleware)`.

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/lib/session'

export function proxy(request: NextRequest) {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('Chybí SESSION_SECRET — nastav ho v .env.local')
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value
  if (verifySession(cookie, secret)) {
    return NextResponse.next()
  }

  const url = new URL('/prihlaseni', request.url)
  url.searchParams.set('pokracovat', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: '/sprava/:path*',
}
```

- [x] **Step 7: Sdílený typ stavu formuláře**

Vytvoř `src/lib/forms.ts` (samostatný modul, protože soubor s `'use server'` smí exportovat jen async funkce):

```ts
export type FormState = { chyba?: string; ok?: boolean }
```

- [x] **Step 8: Server actions pro přihlášení a odhlášení**

Vytvoř `src/lib/auth.ts`. Heslo se porovnává `timingSafeEqual` nad hashem, aby délka hesla neunikala a porovnání bylo konstantní:

```ts
'use server'

import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE, SESSION_TRVANI_MS, signSession } from '@/lib/session'
import type { FormState } from '@/lib/forms'

function hesloSedi(zadane: string, spravne: string): boolean {
  const a = createHash('sha256').update(zadane).digest()
  const b = createHash('sha256').update(spravne).digest()
  return timingSafeEqual(a, b)
}

export async function prihlasit(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const heslo = String(formData.get('heslo') ?? '')
  const spravneHeslo = process.env.ADMIN_PASSWORD
  const secret = process.env.SESSION_SECRET

  if (!spravneHeslo || !secret) {
    return { chyba: 'Server není nastavený — chybí ADMIN_PASSWORD nebo SESSION_SECRET.' }
  }

  if (!hesloSedi(heslo, spravneHeslo)) {
    return { chyba: 'Nesprávné heslo.' }
  }

  const expiresAt = Date.now() + SESSION_TRVANI_MS
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, signSession(expiresAt, secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expiresAt),
  })

  const pokracovat = String(formData.get('pokracovat') ?? '/sprava')
  redirect(pokracovat.startsWith('/sprava') ? pokracovat : '/sprava')
}

export async function odhlasit(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/prihlaseni')
}
```

Pozn.: `redirect()` uvnitř server action vyhazuje speciální výjimku — nesmí být v `try/catch`, který by ji spolkl.

- [x] **Step 9: Přihlašovací stránka**

Vytvoř `src/app/prihlaseni/page.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { prihlasit } from '@/lib/auth'
import type { FormState } from '@/lib/forms'
import './prihlaseni.css'

const pocatecniStav: FormState = {}

export default function PrihlaseniPage() {
  const searchParams = useSearchParams()
  const pokracovat = searchParams.get('pokracovat') ?? '/sprava'
  const [stav, formAction, cekaSe] = useActionState(prihlasit, pocatecniStav)

  return (
    <main className="prihlaseni">
      <form action={formAction} className="prihlaseni__form">
        <h1 className="prihlaseni__nadpis">Správa obsahu</h1>
        <input type="hidden" name="pokracovat" value={pokracovat} />
        <label className="prihlaseni__label" htmlFor="heslo">
          Heslo
        </label>
        <input
          className="prihlaseni__input"
          id="heslo"
          name="heslo"
          type="password"
          autoComplete="current-password"
          required
        />
        {stav.chyba && <p className="prihlaseni__chyba">{stav.chyba}</p>}
        <button className="prihlaseni__tlacitko" type="submit" disabled={cekaSe}>
          {cekaSe ? 'Přihlašuji…' : 'Přihlásit'}
        </button>
      </form>
    </main>
  )
}
```

Vytvoř `src/app/prihlaseni/prihlaseni.css`:

```css
.prihlaseni {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.prihlaseni__form {
  width: min(24rem, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--line);
}

.prihlaseni__nadpis {
  font-family: var(--serif);
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
}

.prihlaseni__label {
  font-size: 0.875rem;
  color: var(--ink-soft);
}

.prihlaseni__input {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--line);
  background: var(--ground);
  color: var(--ink);
  font: inherit;
}

.prihlaseni__chyba {
  margin: 0;
  color: var(--oxide);
  font-size: 0.875rem;
}

.prihlaseni__tlacitko {
  padding: 0.625rem 1rem;
  border: none;
  background: var(--oxide);
  color: var(--ground);
  font: inherit;
  cursor: pointer;
}

.prihlaseni__tlacitko:disabled {
  opacity: 0.6;
  cursor: progress;
}
```

**Rozdělení na dva soubory je záměrné:** `useSearchParams` vyžaduje Suspense hranici při prerenderu, takže formulář je klientská komponenta `src/components/PrihlaseniForm.tsx` a stránka je serverová obálka, která ji zabalí do `<Suspense>` a nastaví `robots: 'noindex'`.

- [ ] **Step 10: Ověření**

1. `npx vitest run` → PASS
2. `npm run build` → zelený
3. `npm run dev`, otevři `http://localhost:3000/sprava` → přesměruje na `/prihlaseni?pokracovat=/sprava`
4. Zadej špatné heslo → „Nesprávné heslo."
5. Zadej `ADMIN_PASSWORD` z `.env.local` → přesměruje na `/sprava` (zatím 404, stránka vzniká v Tasku 9)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add password login with signed session cookie and /sprava guard"
```

---

## Task 4: Čtecí vrstva obsahu

**Files:**
- Create: `src/lib/content/realizace.ts`, `src/lib/content/clanek.ts`, `src/lib/content/siteTexts.ts`

**Interfaces:**
- Consumes: `prisma` z `@/lib/db`.
- Produces:
  - `vsechnyRealizace(kategorie?: Kategorie): Promise<RealizaceSFotkami[]>`
  - `vybraneRealizace(limit?: number): Promise<RealizaceSFotkami[]>`
  - `realizacePodleSlug(slug: string): Promise<RealizaceSFotkami | null>`
  - `vsechnyClanky(): Promise<Clanek[]>`, `clanekPodleSlug(slug: string): Promise<Clanek | null>`
  - `nactiSiteTexts(): Promise<SiteTexts>`
  - typ `RealizaceSFotkami = Prisma.RealizaceGetPayload<{ include: { fotky: true } }>`

- [ ] **Step 1: Realizace**

Vytvoř `src/lib/content/realizace.ts`:

```ts
import type { Kategorie, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export type RealizaceSFotkami = Prisma.RealizaceGetPayload<{
  include: { fotky: true }
}>

const razeni = {
  include: { fotky: { orderBy: { poradi: 'asc' } } },
  orderBy: [{ poradi: 'asc' }, { rok: 'desc' }],
} satisfies Prisma.RealizaceFindManyArgs

export async function vsechnyRealizace(
  kategorie?: Kategorie
): Promise<RealizaceSFotkami[]> {
  return prisma.realizace.findMany({
    ...razeni,
    where: kategorie ? { kategorie } : undefined,
  })
}

export async function vybraneRealizace(limit = 4): Promise<RealizaceSFotkami[]> {
  return prisma.realizace.findMany({
    ...razeni,
    where: { vybrana: true },
    take: limit,
  })
}

export async function realizacePodleSlug(
  slug: string
): Promise<RealizaceSFotkami | null> {
  return prisma.realizace.findUnique({
    where: { slug },
    include: { fotky: { orderBy: { poradi: 'asc' } } },
  })
}
```

- [ ] **Step 2: Články**

Vytvoř `src/lib/content/clanek.ts`:

```ts
import type { Clanek } from '@prisma/client'
import { prisma } from '@/lib/db'

export async function vsechnyClanky(): Promise<Clanek[]> {
  return prisma.clanek.findMany({ orderBy: { datum: 'desc' } })
}

export async function clanekPodleSlug(slug: string): Promise<Clanek | null> {
  return prisma.clanek.findUnique({ where: { slug } })
}
```

- [ ] **Step 3: Texty stránek**

Vytvoř `src/lib/content/siteTexts.ts`. Singleton musí existovat i na prázdné databázi, jinak by veřejné stránky padaly před prvním uložením v adminu:

```ts
import type { SiteTexts } from '@prisma/client'
import { prisma } from '@/lib/db'

export const SITE_TEXTS_ID = 'singleton'

export async function nactiSiteTexts(): Promise<SiteTexts> {
  return prisma.siteTexts.upsert({
    where: { id: SITE_TEXTS_ID },
    update: {},
    create: { id: SITE_TEXTS_ID },
  })
}
```

- [ ] **Step 4: Ověření**

Run: `npx tsc --noEmit`
Expected: bez chyb. (Pokud Prisma typy neexistují, spusť `npx prisma generate`.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add typed content read layer over Prisma"
```

---

## Task 5: Server actions pro Realizace + revalidace

**Files:**
- Create: `src/lib/revalidace.ts`, `src/lib/revalidace.test.ts`
- Create: `src/lib/actions/realizace.ts`, `src/lib/actions/realizace.test.ts`

**Interfaces:**
- Consumes: `slugify` z `@/lib/slug`, `prisma` z `@/lib/db`, `FormState` z `@/lib/forms` (Task 3).
- Produces:
  - `cestyProRealizaci(slug: string): string[]`, `cestyProClanek(slug: string): string[]`, `cestyProSiteTexts(): string[]`
  - `ulozRealizaci(prevState: FormState, formData: FormData): Promise<FormState>`
  - `smazRealizaci(id: string): Promise<void>`

- [ ] **Step 1: Napiš padající test revalidačních cest**

Vytvoř `src/lib/revalidace.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cestyProRealizaci, cestyProClanek, cestyProSiteTexts } from '@/lib/revalidace'

describe('revalidační cesty', () => {
  it('realizace revaliduje detail, výpis i domovskou stránku', () => {
    expect(cestyProRealizaci('rezidence-sarka')).toEqual([
      '/',
      '/realizace',
      '/realizace/rezidence-sarka',
    ])
  })

  it('článek revaliduje detail, aktuality i domovskou stránku', () => {
    expect(cestyProClanek('novy-stuk')).toEqual([
      '/',
      '/aktuality',
      '/aktuality/novy-stuk',
    ])
  })

  it('texty stránek revalidují všechny statické stránky', () => {
    expect(cestyProSiteTexts()).toEqual(['/', '/atelier', '/sluzby', '/kontakt'])
  })
})
```

- [ ] **Step 2: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/revalidace.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/revalidace"`.

- [ ] **Step 3: Implementace cest**

Vytvoř `src/lib/revalidace.ts` (čistá funkce bez závislosti na Nextu, aby šla testovat samostatně):

```ts
export function cestyProRealizaci(slug: string): string[] {
  return ['/', '/realizace', `/realizace/${slug}`]
}

export function cestyProClanek(slug: string): string[] {
  return ['/', '/aktuality', `/aktuality/${slug}`]
}

export function cestyProSiteTexts(): string[] {
  return ['/', '/atelier', '/sluzby', '/kontakt']
}
```

- [ ] **Step 4: Napiš padající test server action**

Prisma i `next/cache` se mockují — test ověřuje chování akce, ne databázi. Vytvoř `src/lib/actions/realizace.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  realizace: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
}
const revalidatePathMock = vi.fn()

vi.mock('@/lib/db', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

const { ulozRealizaci, smazRealizaci } = await import('@/lib/actions/realizace')

function formular(hodnoty: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [klic, hodnota] of Object.entries(hodnoty)) fd.set(klic, hodnota)
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ulozRealizaci', () => {
  it('vytvoří novou realizaci a odvodí slug z názvu', async () => {
    prismaMock.realizace.create.mockResolvedValue({ slug: 'rezidence-sarka' })

    const stav = await ulozRealizaci({}, formular({
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
      popis: '<p>Benátský štuk</p>',
    }))

    expect(stav.ok).toBe(true)
    expect(prismaMock.realizace.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: 'rezidence-sarka',
        nazev: 'Rezidence Šárka',
        rok: 2024,
        kategorie: 'STUK',
        vybrana: false,
      }),
    })
  })

  it('při zadaném id místo vytvoření aktualizuje', async () => {
    prismaMock.realizace.update.mockResolvedValue({ slug: 'rezidence-sarka' })

    await ulozRealizaci({}, formular({
      id: 'abc123',
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
    }))

    expect(prismaMock.realizace.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'abc123' } })
    )
    expect(prismaMock.realizace.create).not.toHaveBeenCalled()
  })

  it('po uložení revaliduje domovskou stránku, výpis i detail', async () => {
    prismaMock.realizace.create.mockResolvedValue({ slug: 'rezidence-sarka' })

    await ulozRealizaci({}, formular({
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
    }))

    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/realizace',
      '/realizace/rezidence-sarka',
    ])
  })

  it('odmítne prázdný název a nic neuloží', async () => {
    const stav = await ulozRealizaci({}, formular({
      nazev: '   ',
      lokalita: 'Praha 6',
      rok: '2024',
      kategorie: 'STUK',
    }))

    expect(stav.chyba).toBe('Vyplňte název realizace.')
    expect(prismaMock.realizace.create).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('odmítne nesmyslný rok', async () => {
    const stav = await ulozRealizaci({}, formular({
      nazev: 'Rezidence Šárka',
      lokalita: 'Praha 6',
      rok: 'loni',
      kategorie: 'STUK',
    }))

    expect(stav.chyba).toBe('Rok musí být číslo mezi 1992 a 2100.')
    expect(prismaMock.realizace.create).not.toHaveBeenCalled()
  })
})

describe('smazRealizaci', () => {
  it('smaže záznam a revaliduje jeho cesty', async () => {
    prismaMock.realizace.delete.mockResolvedValue({ slug: 'rezidence-sarka' })

    await smazRealizaci('abc123')

    expect(prismaMock.realizace.delete).toHaveBeenCalledWith({ where: { id: 'abc123' } })
    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/realizace',
      '/realizace/rezidence-sarka',
    ])
  })
})
```

- [ ] **Step 5: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/actions/realizace.test.ts`
Expected: FAIL — modul `@/lib/actions/realizace` neexistuje.

- [ ] **Step 6: Implementace**

Vytvoř `src/lib/actions/realizace.ts`:

```ts
'use server'

import type { Kategorie } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { cestyProRealizaci } from '@/lib/revalidace'
import type { FormState } from '@/lib/forms'

const KATEGORIE: Kategorie[] = ['MALBA', 'STUK', 'BETON', 'KOVY', 'TAPETY']

export async function ulozRealizaci(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get('id') ?? '').trim()
  const nazev = String(formData.get('nazev') ?? '').trim()
  const lokalita = String(formData.get('lokalita') ?? '').trim()
  const rokRaw = String(formData.get('rok') ?? '').trim()
  const kategorieRaw = String(formData.get('kategorie') ?? '').trim()
  const popis = String(formData.get('popis') ?? '')
  const vybrana = formData.get('vybrana') === 'on'

  if (!nazev) return { chyba: 'Vyplňte název realizace.' }
  if (!lokalita) return { chyba: 'Vyplňte lokalitu.' }

  const rok = Number(rokRaw)
  if (!Number.isInteger(rok) || rok < 1992 || rok > 2100) {
    return { chyba: 'Rok musí být číslo mezi 1992 a 2100.' }
  }

  if (!KATEGORIE.includes(kategorieRaw as Kategorie)) {
    return { chyba: 'Vyberte kategorii.' }
  }
  const kategorie = kategorieRaw as Kategorie

  const data = { nazev, lokalita, rok, kategorie, popis, vybrana }

  const ulozena = id
    ? await prisma.realizace.update({ where: { id }, data })
    : await prisma.realizace.create({ data: { ...data, slug: slugify(nazev) } })

  for (const cesta of cestyProRealizaci(ulozena.slug)) {
    revalidatePath(cesta)
  }

  return { ok: true }
}

export async function smazRealizaci(id: string): Promise<void> {
  const smazana = await prisma.realizace.delete({ where: { id } })

  for (const cesta of cestyProRealizaci(smazana.slug)) {
    revalidatePath(cesta)
  }
}
```

Pozn.: při úpravě se `slug` záměrně nemění — přepsaný slug by rozbil odkazy, které už někdo sdílel.

- [ ] **Step 7: Spusť testy**

Run: `npx vitest run`
Expected: PASS (slug, session, revalidace, realizace).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Realizace server actions with path revalidation"
```

---

## Task 6: Server actions pro Články a Texty stránek

**Files:**
- Create: `src/lib/actions/clanek.ts`, `src/lib/actions/clanek.test.ts`
- Create: `src/lib/actions/siteTexts.ts`, `src/lib/actions/siteTexts.test.ts`

**Interfaces:**
- Consumes: `slugify` z `@/lib/slug`, `cestyProClanek` a `cestyProSiteTexts` z `@/lib/revalidace`, `FormState` z `@/lib/forms`.
- Produces: `ulozClanek`, `smazClanek`, `ulozSiteTexts` — všechny se signaturou server action jako v Tasku 5.

- [ ] **Step 1: Napiš padající test pro články**

Vytvoř `src/lib/actions/clanek.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = {
  clanek: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}
const revalidatePathMock = vi.fn()

vi.mock('@/lib/db', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

const { ulozClanek, smazClanek } = await import('@/lib/actions/clanek')

function formular(hodnoty: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [klic, hodnota] of Object.entries(hodnoty)) fd.set(klic, hodnota)
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ulozClanek', () => {
  it('vytvoří článek se slugem z nadpisu', async () => {
    prismaMock.clanek.create.mockResolvedValue({ slug: 'jak-delame-stuk' })

    const stav = await ulozClanek({}, formular({
      nadpis: 'Jak děláme štuk',
      perex: 'Krátce o postupu',
      obsah: '<p>Text</p>',
      datum: '2026-03-01',
    }))

    expect(stav.ok).toBe(true)
    expect(prismaMock.clanek.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'jak-delame-stuk', nadpis: 'Jak děláme štuk' }),
    })
  })

  it('odmítne prázdný nadpis', async () => {
    const stav = await ulozClanek({}, formular({ nadpis: '  ', obsah: '<p>x</p>' }))

    expect(stav.chyba).toBe('Vyplňte nadpis článku.')
    expect(prismaMock.clanek.create).not.toHaveBeenCalled()
  })

  it('revaliduje domovskou stránku, aktuality i detail', async () => {
    prismaMock.clanek.create.mockResolvedValue({ slug: 'jak-delame-stuk' })

    await ulozClanek({}, formular({ nadpis: 'Jak děláme štuk', obsah: '<p>Text</p>' }))

    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/aktuality',
      '/aktuality/jak-delame-stuk',
    ])
  })
})

describe('smazClanek', () => {
  it('smaže článek a revaliduje jeho cesty', async () => {
    prismaMock.clanek.delete.mockResolvedValue({ slug: 'jak-delame-stuk' })

    await smazClanek('abc123')

    expect(prismaMock.clanek.delete).toHaveBeenCalledWith({ where: { id: 'abc123' } })
    expect(revalidatePathMock).toHaveBeenCalledTimes(3)
  })
})
```

- [ ] **Step 2: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/actions/clanek.test.ts`
Expected: FAIL — modul neexistuje.

- [ ] **Step 3: Implementace článků**

Vytvoř `src/lib/actions/clanek.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { cestyProClanek } from '@/lib/revalidace'
import type { FormState } from '@/lib/forms'

export async function ulozClanek(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const id = String(formData.get('id') ?? '').trim()
  const nadpis = String(formData.get('nadpis') ?? '').trim()
  const perex = String(formData.get('perex') ?? '').trim()
  const obsah = String(formData.get('obsah') ?? '')
  const titulniFoto = String(formData.get('titulniFoto') ?? '').trim() || null
  const datumRaw = String(formData.get('datum') ?? '').trim()

  if (!nadpis) return { chyba: 'Vyplňte nadpis článku.' }

  const datum = datumRaw ? new Date(datumRaw) : new Date()
  if (Number.isNaN(datum.getTime())) return { chyba: 'Datum není platné.' }

  const data = { nadpis, perex, obsah, titulniFoto, datum }

  const ulozeny = id
    ? await prisma.clanek.update({ where: { id }, data })
    : await prisma.clanek.create({ data: { ...data, slug: slugify(nadpis) } })

  for (const cesta of cestyProClanek(ulozeny.slug)) {
    revalidatePath(cesta)
  }

  return { ok: true }
}

export async function smazClanek(id: string): Promise<void> {
  const smazany = await prisma.clanek.delete({ where: { id } })

  for (const cesta of cestyProClanek(smazany.slug)) {
    revalidatePath(cesta)
  }
}
```

- [ ] **Step 4: Napiš padající test pro texty stránek**

Vytvoř `src/lib/actions/siteTexts.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const prismaMock = { siteTexts: { upsert: vi.fn() } }
const revalidatePathMock = vi.fn()

vi.mock('@/lib/db', () => ({ prisma: prismaMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

const { ulozSiteTexts } = await import('@/lib/actions/siteTexts')

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.siteTexts.upsert.mockResolvedValue({ id: 'singleton' })
})

describe('ulozSiteTexts', () => {
  it('upsertuje vždy stejný singleton řádek', async () => {
    const fd = new FormData()
    fd.set('heroNadpis', 'Řemeslo od 1992')
    fd.set('kontaktEmail', 'info@vmalby.cz')

    const stav = await ulozSiteTexts({}, fd)

    expect(stav.ok).toBe(true)
    const volani = prismaMock.siteTexts.upsert.mock.calls[0][0]
    expect(volani.where).toEqual({ id: 'singleton' })
    expect(volani.update.heroNadpis).toBe('Řemeslo od 1992')
    expect(volani.create.id).toBe('singleton')
  })

  it('ignoruje pole, která nejsou v seznamu povolených', async () => {
    const fd = new FormData()
    fd.set('heroNadpis', 'Řemeslo od 1992')
    fd.set('id', 'podvrzene')
    fd.set('neexistujicPole', 'x')

    await ulozSiteTexts({}, fd)

    const volani = prismaMock.siteTexts.upsert.mock.calls[0][0]
    expect(volani.update).not.toHaveProperty('neexistujicPole')
    expect(volani.update).not.toHaveProperty('id')
    expect(volani.where).toEqual({ id: 'singleton' })
  })

  it('revaliduje statické stránky', async () => {
    await ulozSiteTexts({}, new FormData())

    expect(revalidatePathMock.mock.calls.map(([cesta]) => cesta)).toEqual([
      '/',
      '/atelier',
      '/sluzby',
      '/kontakt',
    ])
  })
})
```

- [ ] **Step 5: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/actions/siteTexts.test.ts`
Expected: FAIL — modul neexistuje.

- [ ] **Step 6: Implementace textů stránek**

Vytvoř `src/lib/actions/siteTexts.ts`. Seznam povolených polí je bezpečnostní hranice — bez něj by šlo formulářem přepsat `id` a rozbít singleton:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { cestyProSiteTexts } from '@/lib/revalidace'
import { SITE_TEXTS_ID } from '@/lib/content/siteTexts'
import type { FormState } from '@/lib/forms'

const POVOLENA_POLE = [
  'heroNadpis',
  'heroPodnadpis',
  'oNasNadpis',
  'oNasText',
  'oNasFoto',
  'sluzbyMalba',
  'sluzbyStuk',
  'sluzbyBeton',
  'sluzbyKovy',
  'sluzbyTapety',
  'kontaktEmail',
  'kontaktTelefon',
  'kontaktAdresa',
] as const

export async function ulozSiteTexts(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data: Record<string, string> = {}

  for (const pole of POVOLENA_POLE) {
    const hodnota = formData.get(pole)
    if (hodnota !== null) data[pole] = String(hodnota).trim()
  }

  await prisma.siteTexts.upsert({
    where: { id: SITE_TEXTS_ID },
    update: data,
    create: { id: SITE_TEXTS_ID, ...data },
  })

  for (const cesta of cestyProSiteTexts()) {
    revalidatePath(cesta)
  }

  return { ok: true }
}
```

- [ ] **Step 7: Spusť testy**

Run: `npx vitest run`
Expected: PASS, všechny soubory.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Clanek and SiteTexts server actions"
```

---

## Task 7: Sanitizace rich textu

**Files:**
- Create: `src/lib/sanitizace.ts`, `src/lib/sanitizace.test.ts`
- Modify: `src/lib/actions/realizace.ts`, `src/lib/actions/clanek.ts`

**Interfaces:**
- Produces: `sanitizujObsah(html: string): string`

- [ ] **Step 1: Instalace**

```bash
npm install sanitize-html
npm install -D @types/sanitize-html
```

- [ ] **Step 2: Napiš padající testy**

Vytvoř `src/lib/sanitizace.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sanitizujObsah } from '@/lib/sanitizace'

describe('sanitizujObsah', () => {
  it('nechá projít odstavce, tučné a obrázky', () => {
    const html = '<p>Text <strong>tučně</strong></p><img src="/uploads/a.jpg" alt="Stěna">'
    expect(sanitizujObsah(html)).toBe(html)
  })

  it('zahodí script', () => {
    expect(sanitizujObsah('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>')
  })

  it('zahodí onerror a jiné event handlery', () => {
    expect(sanitizujObsah('<img src="/uploads/a.jpg" onerror="alert(1)">')).toBe(
      '<img src="/uploads/a.jpg" />'
    )
  })

  it('zahodí obrázek s javascript: URL', () => {
    expect(sanitizujObsah('<img src="javascript:alert(1)">')).toBe('')
  })

  it('zahodí nepovolené tagy, ale nechá jejich text', () => {
    expect(sanitizujObsah('<div><p>text</p></div>')).toBe('<p>text</p>')
  })

  it('zvládne prázdný vstup', () => {
    expect(sanitizujObsah('')).toBe('')
  })
})
```

- [ ] **Step 3: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/sanitizace.test.ts`
Expected: FAIL — modul neexistuje.

- [ ] **Step 4: Implementace**

Vytvoř `src/lib/sanitizace.ts`. Seznam tagů odpovídá tomu, co editor v Tasku 8 umí — víc se do databáze nedostane, ani kdyby někdo poslal request ručně:

```ts
import sanitizeHtml from 'sanitize-html'

export function sanitizujObsah(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'strong', 'em', 'br', 'img'],
    allowedAttributes: { img: ['src', 'alt'] },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: { img: ['http', 'https'] },
  })
}
```

- [ ] **Step 5: Spusť testy**

Run: `npx vitest run src/lib/sanitizace.test.ts`
Expected: PASS. Pokud se liší jen formátování výstupu (např. `<img ... />` vs `<img ...>`), uprav **očekávání v testu** podle skutečného výstupu knihovny — ne sanitizační pravidla.

- [ ] **Step 6: Zapoj sanitizaci do server actions**

V `src/lib/actions/realizace.ts` přidej import a obal `popis`:

```ts
import { sanitizujObsah } from '@/lib/sanitizace'
```

a řádek `const popis = String(formData.get('popis') ?? '')` změň na:

```ts
const popis = sanitizujObsah(String(formData.get('popis') ?? ''))
```

V `src/lib/actions/clanek.ts` stejně pro `obsah`:

```ts
const obsah = sanitizujObsah(String(formData.get('obsah') ?? ''))
```

- [ ] **Step 7: Přidej regresní test do akcí**

Do `src/lib/actions/clanek.test.ts` doplň:

```ts
it('sanitizuje obsah před uložením', async () => {
  prismaMock.clanek.create.mockResolvedValue({ slug: 'jak-delame-stuk' })

  await ulozClanek({}, formular({
    nadpis: 'Jak děláme štuk',
    obsah: '<p>Text</p><script>alert(1)</script>',
  }))

  const data = prismaMock.clanek.create.mock.calls[0][0].data
  expect(data.obsah).toBe('<p>Text</p>')
})
```

- [ ] **Step 8: Spusť testy**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: sanitize rich text server-side before storing"
```

---

## Task 8: Nahrávání fotek

**Files:**
- Create: `src/lib/uploads.ts`, `src/lib/uploads.test.ts`, `src/app/api/upload/route.ts`
- Create: `public/uploads/.gitkeep`

**Interfaces:**
- Produces:
  - `nazevSouboru(puvodni: string, nahodne?: () => string): string`
  - `POST /api/upload` — přijímá `multipart/form-data` s polem `soubor`, vrací `{ url: string }`

- [ ] **Step 1: Instalace**

```bash
npm install sharp
```

- [ ] **Step 2: Napiš padající testy názvu souboru**

Uživatel nahraje `Fotka z akce (1).JPG` — to nesmí skončit v URL. Vytvoř `src/lib/uploads.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { nazevSouboru } from '@/lib/uploads'

describe('nazevSouboru', () => {
  it('vyrobí bezpečný název s příponou webp', () => {
    expect(nazevSouboru('Fotka z akce (1).JPG', () => 'abc123')).toBe(
      'fotka-z-akce-1-abc123.webp'
    )
  })

  it('zvládne název bez přípony', () => {
    expect(nazevSouboru('scan', () => 'abc123')).toBe('scan-abc123.webp')
  })

  it('nepustí do názvu cestu ven z adresáře', () => {
    expect(nazevSouboru('../../etc/passwd', () => 'abc123')).toBe('etc-passwd-abc123.webp')
  })

  it('u prázdného názvu použije fallback', () => {
    expect(nazevSouboru('   ', () => 'abc123')).toBe('foto-abc123.webp')
  })
})
```

- [ ] **Step 3: Spusť test, ať vidíš, že padá**

Run: `npx vitest run src/lib/uploads.test.ts`
Expected: FAIL — modul neexistuje.

- [ ] **Step 4: Implementace**

Vytvoř `src/lib/uploads.ts`:

```ts
import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { slugify } from '@/lib/slug'

export const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
export const MAX_SIRKA = 2000
export const MAX_VELIKOST_B = 10 * 1024 * 1024

export function nazevSouboru(
  puvodni: string,
  nahodne: () => string = () => randomBytes(4).toString('hex')
): string {
  const bezPripony = puvodni.replace(/\.[^.]*$/, '')
  const zaklad = slugify(bezPripony) || 'foto'
  return `${zaklad}-${nahodne()}.webp`
}

export async function ulozFotku(soubor: File): Promise<string> {
  if (soubor.size > MAX_VELIKOST_B) {
    throw new Error('Fotka je větší než 10 MB.')
  }

  const vstup = Buffer.from(await soubor.arrayBuffer())
  const vystup = await sharp(vstup)
    .rotate()
    .resize({ width: MAX_SIRKA, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const nazev = nazevSouboru(soubor.name)
  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(join(UPLOAD_DIR, nazev), vystup)

  return `/uploads/${nazev}`
}
```

`.rotate()` bez argumentu srovná fotku podle EXIF orientace — bez toho jsou fotky z mobilu otočené.

- [ ] **Step 5: Route handler**

Přečti si `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`, pak vytvoř `src/app/api/upload/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifySession } from '@/lib/session'
import { ulozFotku } from '@/lib/uploads'

export async function POST(request: Request) {
  const secret = process.env.SESSION_SECRET
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value

  if (!secret || !verifySession(cookie, secret)) {
    return NextResponse.json({ chyba: 'Nepřihlášeno.' }, { status: 401 })
  }

  const formData = await request.formData()
  const soubor = formData.get('soubor')

  if (!(soubor instanceof File) || soubor.size === 0) {
    return NextResponse.json({ chyba: 'Chybí soubor.' }, { status: 400 })
  }

  if (!soubor.type.startsWith('image/')) {
    return NextResponse.json({ chyba: 'Nahrát lze jen obrázek.' }, { status: 400 })
  }

  try {
    const url = await ulozFotku(soubor)
    return NextResponse.json({ url })
  } catch (chyba) {
    const zprava = chyba instanceof Error ? chyba.message : 'Nahrání se nezdařilo.'
    return NextResponse.json({ chyba: zprava }, { status: 400 })
  }
}
```

Ochrana session je tu nutná zvlášť — `proxy.ts` hlídá jen `/sprava`, ne `/api/upload`.

- [ ] **Step 6: Adresář pro uploady**

```bash
mkdir -p public/uploads && touch public/uploads/.gitkeep
```

- [ ] **Step 7: Ověření**

Run: `npx vitest run` → PASS
Run: `npm run build` → zelený

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add authenticated image upload with sharp resizing"
```

---

## Task 9: Redakční rozhraní /sprava

**Files:**
- Create: `src/app/sprava/layout.tsx`, `src/app/sprava/sprava.css`, `src/app/sprava/page.tsx`
- Create: `src/app/sprava/realizace/page.tsx`, `src/app/sprava/realizace/[id]/page.tsx`
- Create: `src/app/sprava/clanky/page.tsx`, `src/app/sprava/clanky/[id]/page.tsx`
- Create: `src/app/sprava/texty/page.tsx`
- Create: `src/components/Editor.tsx`, `src/components/RealizaceForm.tsx`, `src/components/ClanekForm.tsx`, `src/components/TextyForm.tsx`, `src/components/SmazatTlacitko.tsx`

**Interfaces:**
- Consumes: čtecí vrstva z Tasku 4, server actions z Tasků 5–6, `/api/upload` z Tasku 8.
- Produces: kompletní redakční UI. Trasa `/sprava/realizace/novy` a `/sprava/clanky/novy` znamená „nový záznam" (id `novy` je vyhrazené).

- [ ] **Step 1: Instalace editoru**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image
```

- [ ] **Step 2: Editor**

Vytvoř `src/components/Editor.tsx` — klientská komponenta, která drží HTML v skrytém inputu, aby ho server action dostala jako běžné pole formuláře:

```tsx
'use client'

import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

export function Editor({ name, vychozi }: { name: string; vychozi: string }) {
  const [html, setHtml] = useState(vychozi)
  const [nahravaSe, setNahravaSe] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
      }),
      Image,
    ],
    content: vychozi,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  })

  async function nahrajFotku(soubor: File) {
    setNahravaSe(true)
    try {
      const fd = new FormData()
      fd.set('soubor', soubor)
      const odpoved = await fetch('/api/upload', { method: 'POST', body: fd })
      const vysledek = await odpoved.json()
      if (!odpoved.ok) throw new Error(vysledek.chyba ?? 'Nahrání se nezdařilo.')
      editor?.chain().focus().setImage({ src: vysledek.url }).run()
    } catch (chyba) {
      alert(chyba instanceof Error ? chyba.message : 'Nahrání se nezdařilo.')
    } finally {
      setNahravaSe(false)
    }
  }

  return (
    <div className="editor">
      <div className="editor__panel">
        <button
          type="button"
          className="editor__nastroj"
          aria-pressed={editor?.isActive('bold') ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Tučně
        </button>
        <label className="editor__nastroj">
          {nahravaSe ? 'Nahrávám…' : 'Vložit fotku'}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={nahravaSe}
            onChange={(e) => {
              const soubor = e.target.files?.[0]
              if (soubor) void nahrajFotku(soubor)
              e.target.value = ''
            }}
          />
        </label>
      </div>
      <EditorContent editor={editor} className="editor__plocha" />
      <input type="hidden" name={name} value={html} />
    </div>
  )
}
```

`immediatelyRender: false` je povinné — bez něj Tiptap v Next SSR hlásí hydration mismatch.

- [ ] **Step 3: Layout administrace**

Vytvoř `src/app/sprava/layout.tsx`:

```tsx
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
```

Vytvoř `src/app/sprava/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function SpravaPage() {
  redirect('/sprava/realizace')
}
```

- [ ] **Step 4: Styl administrace**

Vytvoř `src/app/sprava/sprava.css` — střídmé, čitelné, na tokenech:

```css
.sprava {
  min-height: 100dvh;
  background: var(--ground);
}

.sprava__hlavicka {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--line);
  background: var(--card-bg);
}

.sprava__znacka {
  font-family: var(--serif);
  font-weight: 600;
}

.sprava__nav {
  display: flex;
  gap: 1rem;
  margin-right: auto;
}

.sprava__nav a {
  color: var(--ink-soft);
  text-decoration: none;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
}

.sprava__nav a:hover {
  color: var(--ink);
  border-bottom-color: var(--oxide);
}

.sprava__odhlasit {
  background: none;
  border: 1px solid var(--line);
  padding: 0.375rem 0.75rem;
  font: inherit;
  color: var(--ink-soft);
  cursor: pointer;
}

.sprava__obsah {
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.sprava__seznam {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sprava__radek {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--line);
}

.sprava__radek-nazev {
  font-weight: 600;
  margin-right: auto;
}

.sprava__meta {
  color: var(--ink-soft);
  font-size: 0.875rem;
}

.sprava__pole {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.sprava__pole input[type='text'],
.sprava__pole input[type='number'],
.sprava__pole input[type='date'],
.sprava__pole input[type='email'],
.sprava__pole select,
.sprava__pole textarea {
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--line);
  background: var(--ground);
  color: var(--ink);
  font: inherit;
}

.sprava__tlacitko {
  padding: 0.5rem 1rem;
  border: none;
  background: var(--oxide);
  color: var(--ground);
  font: inherit;
  cursor: pointer;
}

.sprava__chyba {
  color: var(--oxide);
  margin: 0 0 1rem;
}

.editor__panel {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--line);
  border-bottom: none;
  background: var(--card-bg);
}

.editor__nastroj {
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--line);
  background: var(--ground);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.editor__nastroj[aria-pressed='true'] {
  background: var(--oxide);
  color: var(--ground);
}

.editor__plocha .ProseMirror {
  min-height: 12rem;
  padding: 0.75rem;
  border: 1px solid var(--line);
  background: var(--ground);
  outline: none;
}
```

- [ ] **Step 5: Mazací tlačítko**

Vytvoř `src/components/SmazatTlacitko.tsx` — potvrzení je tu proto, že mazání je nevratné:

```tsx
'use client'

export function SmazatTlacitko({
  id,
  popis,
  akce,
}: {
  id: string
  popis: string
  akce: (id: string) => Promise<void>
}) {
  return (
    <form
      action={async () => {
        await akce(id)
      }}
      onSubmit={(e) => {
        if (!confirm(`Opravdu smazat „${popis}"? Tuto akci nelze vrátit.`)) {
          e.preventDefault()
        }
      }}
    >
      <button type="submit" className="editor__nastroj">
        Smazat
      </button>
    </form>
  )
}
```

- [ ] **Step 6: Formulář realizace**

Vytvoř `src/components/RealizaceForm.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { ulozRealizaci } from '@/lib/actions/realizace'
import type { FormState } from '@/lib/forms'
import { Editor } from '@/components/Editor'

type Vychozi = {
  id?: string
  nazev?: string
  lokalita?: string
  rok?: number
  kategorie?: string
  popis?: string
  vybrana?: boolean
}

const KATEGORIE = [
  ['MALBA', 'Malba a lakování'],
  ['STUK', 'Dekorativní štuk'],
  ['BETON', 'Designový beton'],
  ['KOVY', 'Imitace kovů'],
  ['TAPETY', 'Tapety'],
] as const

const pocatecniStav: FormState = {}

export function RealizaceForm({ vychozi = {} }: { vychozi?: Vychozi }) {
  const [stav, formAction, cekaSe] = useActionState(ulozRealizaci, pocatecniStav)

  return (
    <form action={formAction}>
      {vychozi.id && <input type="hidden" name="id" value={vychozi.id} />}
      {stav.chyba && <p className="sprava__chyba">{stav.chyba}</p>}
      {stav.ok && <p className="sprava__meta">Uloženo.</p>}

      <div className="sprava__pole">
        <label htmlFor="nazev">Název realizace</label>
        <input id="nazev" name="nazev" type="text" defaultValue={vychozi.nazev ?? ''} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="lokalita">Lokalita</label>
        <input id="lokalita" name="lokalita" type="text" defaultValue={vychozi.lokalita ?? ''} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="rok">Rok</label>
        <input id="rok" name="rok" type="number" min={1992} max={2100} defaultValue={vychozi.rok ?? new Date().getFullYear()} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="kategorie">Kategorie</label>
        <select id="kategorie" name="kategorie" defaultValue={vychozi.kategorie ?? 'MALBA'}>
          {KATEGORIE.map(([hodnota, popisek]) => (
            <option key={hodnota} value={hodnota}>
              {popisek}
            </option>
          ))}
        </select>
      </div>

      <div className="sprava__pole">
        <label>Popis</label>
        <Editor name="popis" vychozi={vychozi.popis ?? ''} />
      </div>

      <div className="sprava__pole">
        <label>
          <input type="checkbox" name="vybrana" defaultChecked={vychozi.vybrana ?? false} /> Zobrazit
          na úvodní stránce
        </label>
      </div>

      <button className="sprava__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
```

- [ ] **Step 7: Formulář článku**

Vytvoř `src/components/ClanekForm.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { ulozClanek } from '@/lib/actions/clanek'
import type { FormState } from '@/lib/forms'
import { Editor } from '@/components/Editor'

type Vychozi = {
  id?: string
  nadpis?: string
  perex?: string
  titulniFoto?: string | null
  datum?: Date
  obsah?: string
}

const pocatecniStav: FormState = {}

function naDatumInput(datum: Date | undefined): string {
  return (datum ?? new Date()).toISOString().slice(0, 10)
}

export function ClanekForm({ vychozi = {} }: { vychozi?: Vychozi }) {
  const [stav, formAction, cekaSe] = useActionState(ulozClanek, pocatecniStav)

  return (
    <form action={formAction}>
      {vychozi.id && <input type="hidden" name="id" value={vychozi.id} />}
      {stav.chyba && <p className="sprava__chyba">{stav.chyba}</p>}
      {stav.ok && <p className="sprava__meta">Uloženo.</p>}

      <div className="sprava__pole">
        <label htmlFor="nadpis">Nadpis</label>
        <input id="nadpis" name="nadpis" type="text" defaultValue={vychozi.nadpis ?? ''} required />
      </div>

      <div className="sprava__pole">
        <label htmlFor="perex">Perex</label>
        <textarea id="perex" name="perex" rows={3} defaultValue={vychozi.perex ?? ''} />
      </div>

      <div className="sprava__pole">
        <label htmlFor="datum">Datum</label>
        <input id="datum" name="datum" type="date" defaultValue={naDatumInput(vychozi.datum)} />
      </div>

      <div className="sprava__pole">
        <label htmlFor="titulniFoto">Titulní foto (URL z nahrání)</label>
        <input
          id="titulniFoto"
          name="titulniFoto"
          type="text"
          defaultValue={vychozi.titulniFoto ?? ''}
          placeholder="/uploads/…"
        />
      </div>

      <div className="sprava__pole">
        <label>Obsah</label>
        <Editor name="obsah" vychozi={vychozi.obsah ?? ''} />
      </div>

      <button className="sprava__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
```

- [ ] **Step 8: Seznamy a detaily**

Vytvoř `src/app/sprava/realizace/page.tsx`:

```tsx
import Link from 'next/link'
import { vsechnyRealizace } from '@/lib/content/realizace'
import { smazRealizaci } from '@/lib/actions/realizace'
import { SmazatTlacitko } from '@/components/SmazatTlacitko'

export default async function SpravaRealizacePage() {
  const realizace = await vsechnyRealizace()

  return (
    <>
      <h1>Realizace</h1>
      <Link className="sprava__tlacitko" href="/sprava/realizace/novy">
        + Přidat realizaci
      </Link>

      {realizace.length === 0 && <p className="sprava__meta">Zatím tu není žádná realizace.</p>}

      <ul className="sprava__seznam">
        {realizace.map((r) => (
          <li key={r.id} className="sprava__radek">
            <span className="sprava__radek-nazev">{r.nazev}</span>
            <span className="sprava__meta">
              {r.lokalita} · {r.rok}
              {r.vybrana ? ' · na úvodu' : ''}
            </span>
            <Link href={`/sprava/realizace/${r.id}`}>Upravit</Link>
            <SmazatTlacitko id={r.id} popis={r.nazev} akce={smazRealizaci} />
          </li>
        ))}
      </ul>
    </>
  )
}
```

Vytvoř `src/app/sprava/clanky/page.tsx` — stejná struktura, jen `vsechnyClanky()` z `@/lib/content/clanek`, `smazClanek` z `@/lib/actions/clanek`, nadpis „Články", odkaz „+ Přidat článek" na `/sprava/clanky/novy`, v řádku `c.nadpis` a `c.datum.toLocaleDateString('cs-CZ')`:

```tsx
import Link from 'next/link'
import { vsechnyClanky } from '@/lib/content/clanek'
import { smazClanek } from '@/lib/actions/clanek'
import { SmazatTlacitko } from '@/components/SmazatTlacitko'

export default async function SpravaClankyPage() {
  const clanky = await vsechnyClanky()

  return (
    <>
      <h1>Články</h1>
      <Link className="sprava__tlacitko" href="/sprava/clanky/novy">
        + Přidat článek
      </Link>

      {clanky.length === 0 && <p className="sprava__meta">Zatím tu není žádný článek.</p>}

      <ul className="sprava__seznam">
        {clanky.map((c) => (
          <li key={c.id} className="sprava__radek">
            <span className="sprava__radek-nazev">{c.nadpis}</span>
            <span className="sprava__meta">{c.datum.toLocaleDateString('cs-CZ')}</span>
            <Link href={`/sprava/clanky/${c.id}`}>Upravit</Link>
            <SmazatTlacitko id={c.id} popis={c.nadpis} akce={smazClanek} />
          </li>
        ))}
      </ul>
    </>
  )
}
```

Vytvoř `src/app/sprava/realizace/[id]/page.tsx`:

```tsx
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
```

Vytvoř `src/app/sprava/clanky/[id]/page.tsx` podle stejného vzoru — `id === 'novy'` vykreslí prázdný `<ClanekForm />`, jinak `prisma.clanek.findUnique({ where: { id } })`, při `null` zavolej `notFound()`, jinak `<ClanekForm vychozi={clanek} />` s nadpisem `clanek.nadpis`.

- [ ] **Step 9: Texty stránek**

Vytvoř `src/components/TextyForm.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { ulozSiteTexts } from '@/lib/actions/siteTexts'
import type { FormState } from '@/lib/forms'

const POLE: [string, string, 'text' | 'textarea'][] = [
  ['heroNadpis', 'Nadpis na úvodu', 'text'],
  ['heroPodnadpis', 'Podnadpis na úvodu', 'textarea'],
  ['oNasNadpis', 'O nás — nadpis', 'text'],
  ['oNasText', 'O nás — text', 'textarea'],
  ['oNasFoto', 'O nás — foto (URL z nahrání)', 'text'],
  ['sluzbyMalba', 'Služby — malba a lakování', 'textarea'],
  ['sluzbyStuk', 'Služby — dekorativní štuk', 'textarea'],
  ['sluzbyBeton', 'Služby — designový beton', 'textarea'],
  ['sluzbyKovy', 'Služby — imitace kovů', 'textarea'],
  ['sluzbyTapety', 'Služby — tapety', 'textarea'],
  ['kontaktEmail', 'E-mail', 'text'],
  ['kontaktTelefon', 'Telefon', 'text'],
  ['kontaktAdresa', 'Adresa', 'textarea'],
]

const pocatecniStav: FormState = {}

export function TextyForm({ vychozi }: { vychozi: Record<string, unknown> }) {
  const [stav, formAction, cekaSe] = useActionState(ulozSiteTexts, pocatecniStav)

  return (
    <form action={formAction}>
      {stav.chyba && <p className="sprava__chyba">{stav.chyba}</p>}
      {stav.ok && <p className="sprava__meta">Uloženo.</p>}

      {POLE.map(([nazev, popisek, typ]) => (
        <div className="sprava__pole" key={nazev}>
          <label htmlFor={nazev}>{popisek}</label>
          {typ === 'textarea' ? (
            <textarea id={nazev} name={nazev} rows={3} defaultValue={String(vychozi[nazev] ?? '')} />
          ) : (
            <input id={nazev} name={nazev} type="text" defaultValue={String(vychozi[nazev] ?? '')} />
          )}
        </div>
      ))}

      <button className="sprava__tlacitko" type="submit" disabled={cekaSe}>
        {cekaSe ? 'Ukládám…' : 'Uložit'}
      </button>
    </form>
  )
}
```

Vytvoř `src/app/sprava/texty/page.tsx`:

```tsx
import { nactiSiteTexts } from '@/lib/content/siteTexts'
import { TextyForm } from '@/components/TextyForm'

export default async function SpravaTextyPage() {
  const texty = await nactiSiteTexts()

  return (
    <>
      <h1>Texty stránek</h1>
      <TextyForm vychozi={texty} />
    </>
  )
}
```

Seznam `POLE` musí odpovídat `POVOLENA_POLE` v `src/lib/actions/siteTexts.ts` (Task 6) — pole, které tu chybí, půjde uložit jen přes ruční request, a pole navíc se tiše zahodí.

- [ ] **Step 10: Ověření administrace**

Run: `npm run dev`, přihlas se a projdi:
1. `/sprava` přesměruje na `/sprava/realizace`
2. „+ Přidat realizaci" → vyplň, vlož fotku do popisu, ulož → objeví se v seznamu
3. „Upravit" → změň název → uloží se
4. „Smazat" → potvrzovací dialog → zmizí ze seznamu
5. To samé pro Články
6. „Texty stránek" → ulož → „Uloženo."
7. „Odhlásit" → přesměruje na `/prihlaseni`, `/sprava` už není přístupná

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add /sprava editorial interface for all content types"
```

---

## Task 10: Veřejné stránky — tenký řez

**Files:**
- Create: `src/app/realizace/page.tsx`, `src/app/realizace/[slug]/page.tsx`
- Create: `src/app/realizace/realizace.css`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: čtecí vrstva z Tasku 4.

- [ ] **Step 1: Domovská stránka z databáze**

Přepiš `src/app/page.tsx` — server component, která načte `nactiSiteTexts()` a `vybraneRealizace(4)` a vykreslí hero (nadpis + podnadpis z textů) a mřížku vybraných realizací s odkazem na detail. Kde není foto, vykresli plochu `background: var(--ground-2)` místo `<img>` — placeholdery se doplní později.

- [ ] **Step 2: Výpis realizací**

`src/app/realizace/page.tsx` — server component, `vsechnyRealizace()`, mřížka karet (název, lokalita, rok, kategorie), každá odkazuje na `/realizace/${slug}`.

- [ ] **Step 3: Detail realizace**

`src/app/realizace/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { realizacePodleSlug } from '@/lib/content/realizace'

export default async function RealizaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const realizace = await realizacePodleSlug(slug)
  if (!realizace) notFound()

  return (
    <main className="realizace-detail">
      <h1>{realizace.nazev}</h1>
      <p className="realizace-detail__meta">
        {realizace.lokalita} · {realizace.rok}
      </p>
      <div
        className="realizace-detail__popis"
        dangerouslySetInnerHTML={{ __html: realizace.popis }}
      />
      <div className="realizace-detail__galerie">
        {realizace.fotky.map((fotka) => (
          <img key={fotka.id} src={fotka.url} alt={fotka.popisek} />
        ))}
      </div>
    </main>
  )
}
```

`dangerouslySetInnerHTML` je tu bezpečné jen proto, že obsah prošel `sanitizujObsah` při ukládání (Task 7) — nikdy sem nepouštěj text z jiného zdroje.

- [ ] **Step 4: Ověření**

1. `npm run build` → zelený
2. `npm run dev` → v adminu přidej realizaci s příznakem „Zobrazit na úvodní stránce"
3. Otevři `/` → realizace je vidět **bez restartu serveru** (to ověřuje, že `revalidatePath` funguje)
4. Klikni na detail → `/realizace/<slug>` zobrazí popis i galerii

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: render homepage and Realizace pages from the database"
```

---

## Task 11: Nasazení na hosting (RUČNÍ — přístupy uživatele)

**Files:**
- Create: `docs/nasazeni.md`

- [ ] **Step 1: Zjisti parametry hostingu**

Potřebné informace od uživatele (bez nich nelze pokračovat):
- Poskytuje hosting **Node.js** běhové prostředí (ne jen PHP)? Jakou verzi Node?
- Je k dispozici **PostgreSQL** databáze, nebo ji je potřeba objednat/zřídit zvlášť?
- Jak se na hosting nahrává aplikace — git deploy, FTP, SSH?
- Je persistentní disk pro `public/uploads/` (na serverless by fotky mizely)?

- [ ] **Step 2: Env proměnné na hostingu**

Nastavit `DATABASE_URL`, `ADMIN_PASSWORD` (silné, ne to lokální) a `SESSION_SECRET` (`openssl rand -hex 32`). Nikdy je necommitovat.

- [ ] **Step 3: Migrace na produkci**

```bash
npx prisma migrate deploy
```

- [ ] **Step 4: Sepiš postup**

Do `docs/nasazeni.md` zapiš skutečně provedené kroky pro tento konkrétní hosting, ať jsou zopakovatelné.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: describe deployment to the company hosting"
```
