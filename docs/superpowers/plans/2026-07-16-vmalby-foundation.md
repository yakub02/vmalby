# V Malby — Foundation (Next.js + Sanity) Implementation Plan

> ## ⛔ NEPLATNÝ PLÁN — NEEXEKVOVAT
>
> 2026-08-12 uživatel rozhodl, že nechce headless CMS. Sanity bylo z projektu odstraněno.
> Platný plán je **`2026-08-12-vmalby-redakcni-system.md`** (vlastní redakční systém nad
> Postgres + Prisma uvnitř téže Next.js aplikace).
>
> Z tohoto dokumentu zůstává platný jen **Task 1** (scaffold + design tokeny) — ten je hotový
> a commitnutý. Tasky 2–11 se neexekvují. Soubor je tu jen jako historie rozhodnutí.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the technical foundation for vmalby.cz — a Next.js site backed by an embedded Sanity Studio — with the content model (Realizace, Články, Texty stránek) and an instant publish → live-site pipeline, proven end-to-end on a real deployment.

**Architecture:** Single Next.js (App Router, TypeScript) repo. Sanity Studio is embedded at `/studio` in the same app (no separate admin deployment). Public pages read content via typed GROQ fetchers. Publishing in Studio fires a Sanity webhook to `/api/revalidate`, which verifies the request and calls `revalidatePath` so the live site updates within seconds — no rebuild, no redeploy.

**Tech Stack:** Next.js 15 (App Router) + TypeScript, Sanity 3 + `next-sanity` (embedded Studio), `@sanity/image-url`, `@sanity/webhook` (webhook signature verification), Vitest (unit tests), Vercel (hosting).

**Scope of this plan (roadmap phases 1–2 only):** project setup, content model, live-update pipeline, and a thin vertical slice of pages (Domů, Realizace list + detail) proving the pipeline works. **Not in this plan:** full visual design system, Ateliér/Služby/Aktuality/Kontakt pages, content migration, launch/DNS cutover — these are phases 3–8 of `docs/superpowers/specs/2026-07-16-vmalby-rebrand-design.md` and get their own follow-up plan(s) once this foundation is verified live.

---

## Task 1: Scaffold the Next.js project + design tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/tokens.css`
- Create: `.env.local.example`

- [ ] **Step 1: Scaffold with create-next-app**

Run (this directory already contains `docs/` and `.claude/`, which is fine — create-next-app only refuses on conflicting files like an existing `package.json`):

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --no-tailwind --use-npm
```

Expected: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx` created; `npm install` finishes without errors.

- [ ] **Step 2: Add design tokens from the approved style direction**

Create `src/app/tokens.css`:

```css
:root {
  --ground: #E7E1D3;
  --ground-2: #DED6C4;
  --ink: #211D18;
  --ink-soft: #4A4238;
  --oxide: #8C3B2A;
  --oxide-soft: #B8735F;
  --verdigris: #5C6B5D;
  --line: #C7BCA6;
  --card-bg: #F1ECE0;
  --serif: "Iowan Old Style", "Sitka Text", "Palatino Linotype", Georgia, serif;
  --sans: "Neue Haas Grotesk Text Pro", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ground: #211D18;
    --ground-2: #2A251E;
    --ink: #EDE6D6;
    --ink-soft: #C9BFAC;
    --oxide: #C97157;
    --oxide-soft: #8C3B2A;
    --verdigris: #8CA491;
    --line: #4A4238;
    --card-bg: #2A251E;
  }
}
```

These are the same values used in the approved style direction board, so pages built later stay visually consistent without redefining colors per component.

- [ ] **Step 3: Wire tokens into globals and layout**

Replace the contents of `src/app/globals.css` with:

```css
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--ground);
  color: var(--ink);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
```

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import './tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'V Malby — malířské a řemeslné práce od 1992',
  description: 'Malba, štuky, designový beton a dekorativní povrchy. Praha a okolí.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify it builds and runs**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with design tokens"
```

---

## Task 2: Embed Sanity Studio with a father-friendly nav

**Files:**
- Create: `sanity.config.ts`, `sanity/schemaTypes/index.ts`, `sanity/structure.ts`
- Create: `src/app/studio/[[...tool]]/page.tsx`
- Modify: `.env.local.example`, `.gitignore`

- [ ] **Step 1: Install Sanity dependencies**

```bash
npm install sanity next-sanity @sanity/image-url @sanity/webhook
```

- [ ] **Step 2: Create the Sanity project (manual — requires your Sanity account)**

This step needs your own login and can't be run unattended. In your own terminal (or via `! npx sanity@latest init` in this session if you want the output captured here):

```bash
npx sanity@latest init
```

When prompted:
- Log in (opens a browser)
- "Create new project" → name it `V Malby`
- Use the default dataset name `production`
- When asked whether to write configuration files into this folder, say **no** — this plan writes `sanity.config.ts` by hand in the next step, so an auto-generated one would just be overwritten.

Note the **Project ID** it prints — you'll need it in Step 6.

- [ ] **Step 3: Define an empty schema registry (filled in Tasks 3–5)**

Create `sanity/schemaTypes/index.ts`:

```ts
export const schemaTypes: never[] = []
```

- [ ] **Step 4: Define the restricted desk structure**

Create `sanity/structure.ts`:

```ts
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Obsah webu')
    .items([
      S.listItem()
        .title('Realizace')
        .child(S.documentTypeList('realizace').title('Realizace')),
      S.listItem()
        .title('Články')
        .child(S.documentTypeList('clanek').title('Články')),
      S.listItem()
        .title('Texty stránek')
        .child(S.document().schemaType('siteTexts').documentId('siteTexts')),
    ])
```

This is what keeps the admin scoped to content only: the nav only ever lists these three items, regardless of what schema types exist in code, and there is no "add new document type" option in Studio — schema is code, not something an editor can touch.

- [ ] **Step 5: Wire up the Studio config**

Create `sanity.config.ts` (repo root):

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'vmalby',
  title: 'V Malby — administrace',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 6: Add environment variables**

Create `.env.local` (not committed) with the Project ID from Step 2:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<project id from step 2>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=<run: openssl rand -hex 32>
```

Create `.env.local.example` (committed, no real values):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_REVALIDATE_SECRET=
```

Confirm `.gitignore` contains `.env.local` (create-next-app adds this by default — check, don't duplicate).

- [ ] **Step 7: Mount the Studio route**

Create `src/app/studio/[[...tool]]/page.tsx`:

```tsx
import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 8: Verify Studio loads**

Run: `npm run dev`, open `http://localhost:3000/studio`
Expected: Studio loads showing "Obsah webu" with three empty-looking nav items (Realizace, Články, Texty stránek) — empty because no schema exists yet (next tasks).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: embed Sanity Studio with restricted content-only navigation"
```

---

## Task 3: Sanity schema — Realizace

**Files:**
- Create: `sanity/schemaTypes/realizace.ts`
- Modify: `sanity/schemaTypes/index.ts`

- [ ] **Step 1: Define the schema**

Create `sanity/schemaTypes/realizace.ts`:

```ts
import { defineField, defineType } from 'sanity'

export const realizace = defineType({
  name: 'realizace',
  title: 'Realizace',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Název realizace',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL adresa',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Lokalita',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Rok',
      type: 'number',
      validation: (Rule) => Rule.min(1990).max(2100),
    }),
    defineField({
      name: 'category',
      title: 'Kategorie',
      type: 'string',
      options: {
        list: [
          { title: 'Malba', value: 'malba' },
          { title: 'Štuk', value: 'stuk' },
          { title: 'Designový beton', value: 'beton' },
          { title: 'Imitace kovů', value: 'kovy' },
          { title: 'Tapety', value: 'tapety' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Popis',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normální', value: 'normal' }],
          lists: [],
          marks: { decorators: [{ title: 'Tučně', value: 'strong' }] },
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Fotky',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Vybraná realizace (zobrazí se na Domů)',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'gallery.0' },
  },
})
```

- [ ] **Step 2: Register it**

Update `sanity/schemaTypes/index.ts`:

```ts
import { realizace } from './realizace'

export const schemaTypes = [realizace]
```

- [ ] **Step 3: Verify in Studio**

Run: `npm run dev`, open `http://localhost:3000/studio`, click "Realizace" → "+"
Expected: a new-document form with all fields above, in the order defined.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Realizace content schema"
```

---

## Task 4: Sanity schema — Články

**Files:**
- Create: `sanity/schemaTypes/clanek.ts`
- Modify: `sanity/schemaTypes/index.ts`

- [ ] **Step 1: Define the schema**

Create `sanity/schemaTypes/clanek.ts`:

```ts
import { defineField, defineType } from 'sanity'

export const clanek = defineType({
  name: 'clanek',
  title: 'Článek',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nadpis',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL adresa',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Perex',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Titulní foto',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Datum',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'body',
      title: 'Obsah',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normální', value: 'normal' },
            { title: 'Nadpis', value: 'h2' },
          ],
          marks: { decorators: [{ title: 'Tučně', value: 'strong' }] },
        },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' },
  },
})
```

- [ ] **Step 2: Register it**

Update `sanity/schemaTypes/index.ts`:

```ts
import { realizace } from './realizace'
import { clanek } from './clanek'

export const schemaTypes = [realizace, clanek]
```

- [ ] **Step 3: Verify in Studio**

Run: `npm run dev`, open `/studio`, click "Články" → "+"
Expected: new-document form with title, slug, perex, titulní foto, datum, obsah (with a working "add image" option inside the body editor).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Clanek content schema"
```

---

## Task 5: Sanity schema — Texty stránek (singleton)

**Files:**
- Create: `sanity/schemaTypes/siteTexts.ts`
- Modify: `sanity/schemaTypes/index.ts`, `sanity/structure.ts`

- [ ] **Step 1: Define the schema**

Create `sanity/schemaTypes/siteTexts.ts`:

```ts
import { defineField, defineType, defineArrayMember } from 'sanity'

export const siteTexts = defineType({
  name: 'siteTexts',
  title: 'Texty stránek',
  type: 'document',
  fields: [
    defineField({ name: 'heroTitle', title: 'Nadpis na Domů', type: 'string' }),
    defineField({ name: 'heroSubtitle', title: 'Podnadpis na Domů', type: 'string' }),
    defineField({ name: 'aboutTitle', title: 'Nadpis O nás', type: 'string' }),
    defineField({ name: 'aboutText', title: 'Text O nás', type: 'text', rows: 6 }),
    defineField({ name: 'aboutImage', title: 'Foto k O nás', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'contactEmail', title: 'E-mail', type: 'string' }),
    defineField({ name: 'contactPhone', title: 'Telefon', type: 'string' }),
    defineField({ name: 'contactAddress', title: 'Adresa', type: 'string' }),
    defineField({
      name: 'services',
      title: 'Služby',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'service',
          fields: [
            defineField({ name: 'name', title: 'Název služby', type: 'string' }),
            defineField({ name: 'description', title: 'Popis', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'name' } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Texty stránek' }),
  },
})
```

- [ ] **Step 2: Register it and lock it to a single document**

Update `sanity/schemaTypes/index.ts`:

```ts
import { realizace } from './realizace'
import { clanek } from './clanek'
import { siteTexts } from './siteTexts'

export const schemaTypes = [realizace, clanek, siteTexts]
```

`sanity/structure.ts` already points "Texty stránek" at a fixed `documentId('siteTexts')` (Task 2, Step 4), so there's exactly one instance — no way to accidentally create a second one.

- [ ] **Step 3: Verify in Studio**

Run: `npm run dev`, open `/studio`, click "Texty stránek"
Expected: opens directly into an editable form (no list, no "+" button) with all fields above.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add singleton siteTexts schema for editable page copy"
```

---

## Task 6: Typed Sanity client and content fetchers

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/sanity/client.ts`, `src/lib/sanity/image.ts`, `src/lib/sanity/types.ts`, `src/lib/sanity/queries.ts`, `src/lib/sanity/fetchers.ts`
- Test: `tests/lib/sanity/fetchers.test.ts`
- Modify: `package.json` (test script)

- [ ] **Step 1: Install and configure Vitest**

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
  },
})
```

Add to `package.json` `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Add types and the Sanity client**

Create `src/lib/sanity/types.ts`:

```ts
export type Category = 'malba' | 'stuk' | 'beton' | 'kovy' | 'tapety'

export interface SanityImage {
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
}

export interface RealizaceListItem {
  _id: string
  title: string
  slug: string
  location: string
  year: number
  category: Category
  coverImage: SanityImage | null
}

export interface RealizaceDetail {
  title: string
  location: string
  year: number
  category: Category
  description: unknown[]
  gallery: SanityImage[]
}

export interface ServiceEntry {
  name: string
  description: string
}

export interface SiteTexts {
  heroTitle: string
  heroSubtitle: string
  aboutTitle: string
  aboutText: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  services: ServiceEntry[]
}
```

Create `src/lib/sanity/client.ts`:

```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: true,
})
```

Create `src/lib/sanity/image.ts`:

```ts
import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'
import type { SanityImage } from './types'

const builder = createImageUrlBuilder(client)

export function urlFor(image: SanityImage) {
  return builder.image(image)
}
```

- [ ] **Step 3: Write the queries**

Create `src/lib/sanity/queries.ts`:

```ts
export const featuredRealizaceQuery = `*[_type == "realizace" && featured == true] | order(year desc){
  _id, title, "slug": slug.current, location, year, category, "coverImage": gallery[0]
}`

export const allRealizaceQuery = `*[_type == "realizace"] | order(year desc){
  _id, title, "slug": slug.current, location, year, category, "coverImage": gallery[0]
}`

export const realizaceBySlugQuery = `*[_type == "realizace" && slug.current == $slug][0]{
  title, location, year, category, description, gallery
}`

export const siteTextsQuery = `*[_type == "siteTexts"][0]{
  heroTitle, heroSubtitle, aboutTitle, aboutText, contactEmail, contactPhone, contactAddress, services
}`
```

- [ ] **Step 4: Write the failing test for the fetchers**

Create `tests/lib/sanity/fetchers.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/sanity/client', () => ({
  client: { fetch: vi.fn() },
}))

import { client } from '@/lib/sanity/client'
import { getFeaturedRealizace, getRealizaceBySlug, getSiteTexts } from '@/lib/sanity/fetchers'

describe('getFeaturedRealizace', () => {
  beforeEach(() => vi.mocked(client.fetch).mockReset())

  it('returns realizace fetched from the sanity client', async () => {
    const mockData = [
      {
        _id: '1',
        title: 'Campus Science Park',
        slug: 'campus-science-park',
        location: 'Praha',
        year: 2023,
        category: 'beton',
        coverImage: null,
      },
    ]
    vi.mocked(client.fetch).mockResolvedValueOnce(mockData)

    const result = await getFeaturedRealizace()

    expect(result).toEqual(mockData)
    expect(client.fetch).toHaveBeenCalledWith(expect.stringContaining('featured == true'))
  })
})

describe('getRealizaceBySlug', () => {
  beforeEach(() => vi.mocked(client.fetch).mockReset())

  it('passes the slug as a query param', async () => {
    const mockDetail = {
      title: 'Campus Science Park',
      location: 'Praha',
      year: 2023,
      category: 'beton',
      description: [],
      gallery: [],
    }
    vi.mocked(client.fetch).mockResolvedValueOnce(mockDetail)

    const result = await getRealizaceBySlug('campus-science-park')

    expect(result).toEqual(mockDetail)
    expect(client.fetch).toHaveBeenCalledWith(expect.any(String), { slug: 'campus-science-park' })
  })
})

describe('getSiteTexts', () => {
  beforeEach(() => vi.mocked(client.fetch).mockReset())

  it('returns the singleton site texts document', async () => {
    const mockTexts = { heroTitle: 'V Malby', heroSubtitle: 'Řemeslo od 1992', services: [] }
    vi.mocked(client.fetch).mockResolvedValueOnce(mockTexts)

    const result = await getSiteTexts()

    expect(result).toEqual(mockTexts)
  })
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/sanity/fetchers'` (file doesn't exist yet).

- [ ] **Step 6: Implement the fetchers**

Create `src/lib/sanity/fetchers.ts`:

```ts
import { client } from './client'
import {
  featuredRealizaceQuery,
  allRealizaceQuery,
  realizaceBySlugQuery,
  siteTextsQuery,
} from './queries'
import type { RealizaceListItem, RealizaceDetail, SiteTexts } from './types'

export async function getFeaturedRealizace(): Promise<RealizaceListItem[]> {
  return client.fetch(featuredRealizaceQuery)
}

export async function getAllRealizace(): Promise<RealizaceListItem[]> {
  return client.fetch(allRealizaceQuery)
}

export async function getRealizaceBySlug(slug: string): Promise<RealizaceDetail | null> {
  return client.fetch(realizaceBySlugQuery, { slug })
}

export async function getSiteTexts(): Promise<SiteTexts | null> {
  return client.fetch(siteTextsQuery)
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — 3 test files/suites, all green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add typed Sanity fetchers with unit tests"
```

---

## Task 7: Revalidation webhook

**Files:**
- Create: `src/app/api/revalidate/route.ts`
- Test: `tests/api/revalidate.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/api/revalidate.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@sanity/webhook', () => ({
  isValidSignature: vi.fn(),
  SIGNATURE_HEADER_NAME: 'sanity-webhook-signature',
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { isValidSignature } from '@sanity/webhook'
import { revalidatePath } from 'next/cache'
import { POST, pathsForPayload } from '@/app/api/revalidate/route'

function makeRequest(body: string, signature: string | null) {
  return {
    text: async () => body,
    headers: { get: (name: string) => (name === 'sanity-webhook-signature' ? signature : null) },
  } as unknown as Request
}

describe('pathsForPayload', () => {
  it('returns home, list and detail paths for realizace with a slug', () => {
    expect(pathsForPayload({ _type: 'realizace', slug: 'campus-science-park' })).toEqual([
      '/',
      '/realizace',
      '/realizace/campus-science-park',
    ])
  })

  it('returns home and list paths for realizace without a slug', () => {
    expect(pathsForPayload({ _type: 'realizace' })).toEqual(['/', '/realizace'])
  })

  it('returns aktuality list and detail paths for clanek', () => {
    expect(pathsForPayload({ _type: 'clanek', slug: 'novinka' })).toEqual([
      '/aktuality',
      '/aktuality/novinka',
    ])
  })

  it('returns the home path for siteTexts', () => {
    expect(pathsForPayload({ _type: 'siteTexts' })).toEqual(['/'])
  })

  it('returns an empty array for an unknown type', () => {
    expect(pathsForPayload({ _type: 'unknown' })).toEqual([])
  })
})

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.mocked(isValidSignature).mockReset()
    vi.mocked(revalidatePath).mockReset()
  })

  it('rejects requests without a signature header', async () => {
    const res = await POST(makeRequest('{}', null))
    expect(res.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('rejects requests with an invalid signature', async () => {
    vi.mocked(isValidSignature).mockResolvedValueOnce(false)
    const res = await POST(makeRequest('{"_type":"realizace"}', 'bad-signature'))
    expect(res.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidates the right paths for a valid signature', async () => {
    vi.mocked(isValidSignature).mockResolvedValueOnce(true)
    const body = JSON.stringify({ _type: 'realizace', slug: 'campus-science-park' })
    const res = await POST(makeRequest(body, 'good-signature'))

    expect(res.status).toBe(200)
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/realizace')
    expect(revalidatePath).toHaveBeenCalledWith('/realizace/campus-science-park')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/app/api/revalidate/route'`.

- [ ] **Step 3: Implement the route**

Create `src/app/api/revalidate/route.ts`:

```ts
import { revalidatePath } from 'next/cache'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { NextResponse } from 'next/server'

const SECRET = process.env.SANITY_REVALIDATE_SECRET!

interface WebhookPayload {
  _type: string
  slug?: string
}

export function pathsForPayload(payload: WebhookPayload): string[] {
  switch (payload._type) {
    case 'realizace':
      return payload.slug
        ? ['/', '/realizace', `/realizace/${payload.slug}`]
        : ['/', '/realizace']
    case 'clanek':
      return payload.slug ? ['/aktuality', `/aktuality/${payload.slug}`] : ['/aktuality']
    case 'siteTexts':
      return ['/']
    default:
      return []
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get(SIGNATURE_HEADER_NAME)

  if (!signature || !(await isValidSignature(body, signature, SECRET))) {
    return NextResponse.json({ message: 'Neplatný podpis webhooku' }, { status: 401 })
  }

  const payload = JSON.parse(body) as WebhookPayload
  const paths = pathsForPayload(payload)
  paths.forEach((path) => revalidatePath(path))

  return NextResponse.json({ revalidated: true, paths })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all `pathsForPayload` and `POST` tests green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add signed revalidation webhook for instant content updates"
```

---

## Task 8: Homepage — hero + featured realizace

**Files:**
- Create: `src/components/RealizaceCard/RealizaceCard.tsx`, `src/components/RealizaceCard/RealizaceCard.module.css`
- Modify: `src/app/page.tsx`
- Create: `src/app/page.module.css`

- [ ] **Step 1: Build the RealizaceCard component**

Create `src/components/RealizaceCard/RealizaceCard.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/image'
import type { RealizaceListItem } from '@/lib/sanity/types'
import styles from './RealizaceCard.module.css'

const CATEGORY_LABELS: Record<string, string> = {
  malba: 'Malba',
  stuk: 'Štuk',
  beton: 'Designový beton',
  kovy: 'Imitace kovů',
  tapety: 'Tapety',
}

export function RealizaceCard({ item }: { item: RealizaceListItem }) {
  return (
    <Link href={`/realizace/${item.slug}`} className={styles.card}>
      <div className={styles.thumb}>
        {item.coverImage && (
          <Image
            src={urlFor(item.coverImage).width(600).height(400).url()}
            alt={item.title}
            width={600}
            height={400}
          />
        )}
        <span className={styles.cat}>{CATEGORY_LABELS[item.category]}</span>
      </div>
      <div className={styles.body}>
        <h3>{item.title}</h3>
        <p>{item.location} — {item.year}</p>
      </div>
    </Link>
  )
}
```

Create `src/components/RealizaceCard/RealizaceCard.module.css`:

```css
.card {
  display: block;
  background: var(--card-bg);
  border: 1px solid var(--line);
}

.thumb {
  position: relative;
  aspect-ratio: 3 / 2;
  background: var(--ground-2);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cat {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--ground);
  color: var(--ink);
  padding: 4px 8px;
}

.body {
  padding: 16px;
}

.body h3 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 20px;
  margin: 0 0 6px;
}

.body p {
  font-size: 13px;
  color: var(--ink-soft);
  margin: 0;
}
```

- [ ] **Step 2: Build the homepage**

Replace `src/app/page.tsx`:

```tsx
import { getFeaturedRealizace, getSiteTexts } from '@/lib/sanity/fetchers'
import { RealizaceCard } from '@/components/RealizaceCard/RealizaceCard'
import styles from './page.module.css'

export const revalidate = 3600

export default async function HomePage() {
  const [texts, featured] = await Promise.all([getSiteTexts(), getFeaturedRealizace()])

  return (
    <main className={styles.wrap}>
      <section className={styles.hero}>
        <h1>{texts?.heroTitle ?? 'V Malby'}</h1>
        <p>{texts?.heroSubtitle ?? 'Řemeslo od roku 1992.'}</p>
      </section>
      <section className={styles.grid}>
        {featured.map((item) => (
          <RealizaceCard key={item._id} item={item} />
        ))}
      </section>
    </main>
  )
}
```

Create `src/app/page.module.css`:

```css
.wrap {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 28px;
}

.hero {
  padding: 96px 0 64px;
  border-bottom: 1px solid var(--line);
}

.hero h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(40px, 7vw, 72px);
  margin: 0 0 16px;
}

.hero p {
  font-size: 18px;
  color: var(--ink-soft);
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  padding: 56px 0;
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: build succeeds. (The homepage will render with fallback hero text and an empty grid until content exists in Sanity — that's expected at this point.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build homepage hero and featured realizace grid"
```

---

## Task 9: Realizace list + detail pages

**Files:**
- Create: `src/app/realizace/page.tsx`, `src/app/realizace/page.module.css`
- Create: `src/app/realizace/[slug]/page.tsx`, `src/app/realizace/[slug]/page.module.css`

- [ ] **Step 1: Build the list page**

Create `src/app/realizace/page.tsx`:

```tsx
import { getAllRealizace } from '@/lib/sanity/fetchers'
import { RealizaceCard } from '@/components/RealizaceCard/RealizaceCard'
import styles from './page.module.css'

export const revalidate = 3600

export default async function RealizacePage() {
  const items = await getAllRealizace()

  return (
    <main className={styles.wrap}>
      <h1>Realizace</h1>
      <section className={styles.grid}>
        {items.map((item) => (
          <RealizaceCard key={item._id} item={item} />
        ))}
      </section>
    </main>
  )
}
```

Create `src/app/realizace/page.module.css`:

```css
.wrap {
  max-width: 1040px;
  margin: 0 auto;
  padding: 64px 28px;
}

.wrap h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 48px);
  margin: 0 0 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
```

- [ ] **Step 2: Build the detail page**

Create `src/app/realizace/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getRealizaceBySlug } from '@/lib/sanity/fetchers'
import { urlFor } from '@/lib/sanity/image'
import styles from './page.module.css'

export const revalidate = 3600

export default async function RealizaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await getRealizaceBySlug(slug)
  if (!item) notFound()

  return (
    <main className={styles.wrap}>
      <h1>{item.title}</h1>
      <p className={styles.meta}>{item.location} — {item.year}</p>
      <div className={styles.gallery}>
        {item.gallery.map((image, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={urlFor(image).width(1200).url()} alt={item.title} />
        ))}
      </div>
    </main>
  )
}
```

Create `src/app/realizace/[slug]/page.module.css`:

```css
.wrap {
  max-width: 1040px;
  margin: 0 auto;
  padding: 64px 28px;
}

.wrap h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 48px);
  margin: 0 0 8px;
}

.meta {
  color: var(--ink-soft);
  margin: 0 0 40px;
}

.gallery {
  display: grid;
  gap: 16px;
}

.gallery img {
  width: 100%;
  height: auto;
  display: block;
}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: build succeeds; `/realizace` and `/realizace/[slug]` compile as dynamic routes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build realizace list and detail pages"
```

---

## Task 10: Deploy and connect the webhook (manual — your accounts)

These steps need your GitHub/Vercel/Sanity accounts and can't be run unattended — do them yourself, or ask me to drive while you approve each account-level action.

- [ ] **Step 1: Push to GitHub**

Create a new (private) GitHub repository and push this repo to it.

- [ ] **Step 2: Import into Vercel**

In the Vercel dashboard: "Add New Project" → import the GitHub repo → framework preset "Next.js" (auto-detected).

- [ ] **Step 3: Set environment variables in Vercel**

Project Settings → Environment Variables, add for Production (and Preview):
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — same value as `.env.local`
- `NEXT_PUBLIC_SANITY_DATASET` — `production`
- `SANITY_REVALIDATE_SECRET` — same value as `.env.local`

Deploy. Note the resulting URL (e.g. `https://vmalby.vercel.app`) — this becomes `vmalby.cz` later at launch (phase 8 of the design doc), not in this plan.

- [ ] **Step 4: Create the Sanity webhook**

In [manage.sanity.io](https://manage.sanity.io) → your project → API → Webhooks → "Create webhook":
- **Name:** `Revalidate live site`
- **URL:** `https://<your-vercel-url>/api/revalidate`
- **Dataset:** `production`
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["realizace", "clanek", "siteTexts"]`
- **Projection:** `{"_type": _type, "slug": slug.current}`
- **HTTP method:** POST
- **API version:** latest
- **Secret:** the same value as `SANITY_REVALIDATE_SECRET`

Save.

---

## Task 11: End-to-end verification

**No files** — this task proves the pipeline built in Tasks 1–10 actually works on the live deployment.

- [ ] **Step 1: Fill in the site texts**

Open `https://<your-vercel-url>/studio`, log in, click "Texty stránek", fill in `heroTitle` and `heroSubtitle`, click Publish.

- [ ] **Step 2: Confirm the homepage updates without a redeploy**

Open `https://<your-vercel-url>/` within ~10 seconds of publishing.
Expected: the hero shows the text you just entered, not the fallback strings from Task 8's code.

- [ ] **Step 3: Add a test realizace**

In Studio, create a "Realizace" entry: title `Campus Science Park`, location `Praha`, year `2023`, category `Designový beton`, at least one photo, `featured` = true. Publish.

- [ ] **Step 4: Confirm it appears live**

Reload `/` — expected: the new realizace card appears in the featured grid.
Open `/realizace` — expected: it's listed.
Open `/realizace/campus-science-park` — expected: detail page renders with the photo(s).

- [ ] **Step 5: Confirm the pipeline is genuinely fast, not just cached-away**

Edit the realizace's title in Studio, publish, reload `/realizace/campus-science-park` within ~10 seconds.
Expected: new title shows — this is the "publish → live" promise from the design doc, verified for real, not just in code.

If any of Steps 2, 4, or 5 don't update promptly: check the webhook delivery log in manage.sanity.io (API → Webhooks → your webhook → recent deliveries) for a non-200 response, and check the Vercel function logs for `/api/revalidate` for the rejection reason.
