# V Malby — stav exekuce

Aktualizováno: 2026-08-12 (session 2)

## ⚠️ Změna architektury — Sanity je mimo hru

V session 2 uživatel rozhodl, že **nechce headless CMS**. Chce jen redakční úpravu textů a článků
po přihlášení admina, s obsahem ve vlastní databázi na vlastním hostingu (firma už běžící webhosting má).

Co to znamenalo:
- Sanity bylo odinstalováno (`sanity`, `next-sanity`, `@sanity/image-url`, `@sanity/webhook`)
  a smazáno (`sanity.config.ts`, `sanity/`, `src/app/studio/`). Nic z toho se nestihlo commitnout.
- **Starý plán `2026-07-16-vmalby-foundation.md` je neplatný od Tasku 2 dál.** Task 1 (scaffold
  + design tokeny) platí a je commitnutý.
- Design doc `specs/2026-07-16-vmalby-rebrand-design.md` má přepsaný bod 6 (technická architektura)
  a bod 7 (fáze 1–2). Body 1–5 — cíl, IA, content model, vizuální směr — platí beze změny.
- Nový plán: **`plans/2026-08-12-vmalby-redakcni-system.md`** (11 tasků).

## Klíčové dokumenty
- Design doc (schválený, aktualizovaný): `docs/superpowers/specs/2026-07-16-vmalby-rebrand-design.md`
- Platný plán: `docs/superpowers/plans/2026-08-12-vmalby-redakcni-system.md`
- Neplatný plán (historie): `docs/superpowers/plans/2026-07-16-vmalby-foundation.md`
- Vizuální nástěnka (schválený směr): https://claude.ai/code/artifact/124da2a5-b8b4-4a5f-ad39-a8a41b5b4d33

## Stav tasků nového plánu
| # | Úkol | Stav |
|---|------|------|
| 1 | Prisma, databáze a obsahové modely | ⚠️ ČÁSTEČNĚ (commit `2f61e01`) — schéma, `prisma.config.ts`, klient s adapterem a `prisma generate` hotové; **chybí migrace, blokuje ji přístup k databázi** |
| 2 | Vitest a testovací kostra | ✅ HOTOVO (commit `2f61e01`) — `slugify` + 4 testy |
| 3 | Přihlášení, podepsané session cookie, ochrana /sprava | ✅ HOTOVO — 6 testů podpisu, ochrana ověřená za běhu (307 na `/prihlaseni`) |
| 4 | Čtecí vrstva obsahu | čeká |
| 5 | Server actions Realizace + revalidace | čeká |
| 6 | Server actions Články a Texty stránek | čeká |
| 7 | Sanitizace rich textu | čeká |
| 8 | Nahrávání fotek (sharp) | čeká |
| 9 | Redakční rozhraní /sprava | čeká |
| 10 | Veřejné stránky — tenký řez | čeká |
| 11 | Nasazení na hosting (RUČNÍ) | čeká |

## Co je hotové z původní práce
Task 1 starého plánu, commity `76a7444` a `107df97`:
- Next.js **16.2.10** (ne 15), React 19.2.4, TypeScript, App Router, src-dir, alias `@/*`,
  bez Tailwindu, npm, Turbopack.
- `src/app/tokens.css` — design tokeny dle nástěnky (světlý + dark režim).
- `src/app/globals.css` — reset, body na tokenech. `src/app/layout.tsx` — lang="cs", metadata V Malby.
- `src/app/page.tsx` je zatím placeholder (přestaví Task 10 nového plánu).

## Co uživatel musí udělat (odblokuje Task 1 a Task 11)
- **Přístup k Postgresu pro vývoj.** Na portu 5432 už něco poslouchá — vypadá to na lokálně
  nainstalovaný Postgres, ale přihlašovací údaje k němu neznáme a `psql` na stroji není.
  Buď dodej správné `DATABASE_URL` do `.env.local`, nebo spusť čistou instanci v Dockeru
  (Docker Desktop teď neběží): `docker run --name vmalby-pg -e POSTGRES_USER=vmalby
  -e POSTGRES_PASSWORD=vmalby -e POSTGRES_DB=vmalby -p 5433:5432 -d postgres:16`
  (port 5433, aby nekolidoval se stávající instancí — pak i v `DATABASE_URL` uveď 5433).
  Pak stačí `npx prisma migrate dev --name init`.
- **Silné `ADMIN_PASSWORD` a `SESSION_SECRET`** v `.env.local` (teď tam jsou vývojové
  placeholdery). `SESSION_SECRET` vygeneruj `openssl rand -hex 32`.
- **Parametry hostingu** (Task 11): má hosting Node.js runtime? Je tam PostgreSQL? Jak se nahrává
  (git/FTP/SSH)? Je persistentní disk pro `public/uploads/`?

## Zjištění o Next 16, která plán zohledňuje
- `middleware.ts` je **deprecated a přejmenovaný na `proxy.ts`**; soubor exportuje funkci `proxy`.
  **Proxy běží defaultně v Node.js runtime**, takže `node:crypto` v něm funguje a `runtime` config
  v něm vyhodí chybu.
- `dynamic = 'force-static'` je pořád platné — odstraněné je jen při zapnutém Cache Components,
  které tenhle projekt nepoužívá.
- `params` v dynamických routách je `Promise` — vždy `await params`.
- Soubor s `'use server'` smí exportovat jen async funkce; typy proto žijí v `src/lib/forms.ts`.
- **`proxy.ts` musí být v `src/`, ne v rootu** (protože `app/` je v `src/`). V rootu se tiše
  ignoruje — build je zelený a `/sprava` zůstane nechráněná. Kontrola: výpis `npm run build`
  musí obsahovat řádek `ƒ Proxy (Middleware)`.
- Prisma 7: `url` v `datasource` neexistuje (patří do `prisma.config.ts`), klient vyžaduje
  driver adapter `@prisma/adapter-pg`, a Prisma nečte `.env.local` — načítá se
  `process.loadEnvFile('.env.local')` v configu.
- Vitest config pojmenuj `vitest.config.mts`, jinak Vite hlásí varování o ESM v CJS.

## Mrtvá větev: proč Sanity build padal (kdyby se k tomu někdo vracel)
`sanity` importuje `useSWR` jako default z `swr`. Pod exportní podmínkou `react-server` má swr 2.5.1
build bez default exportu, takže Turbopack build spadl na „Export default doesn't exist in target
module". Příčina: `sanity.config.ts` bez `'use client'` vtáhl celý graf `sanity` do RSC vrstvy.
Oprava byla `'use client'` na první řádek `sanity.config.ts` (oficiální Sanity dokumentace to
vyžaduje, plán to vynechal). Ověřeno — build i `/studio` (HTTP 200) pak fungovaly.
