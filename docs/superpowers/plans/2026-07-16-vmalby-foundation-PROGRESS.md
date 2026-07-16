# V Malby foundation — stav exekuce

Aktualizováno: 2026-07-16 (session 1)

## Klíčové dokumenty
- Design doc (schválený): `docs/superpowers/specs/2026-07-16-vmalby-rebrand-design.md`
- Implementační plán (schválený, 11 úkolů): `docs/superpowers/plans/2026-07-16-vmalby-foundation.md`
- Vizuální nástěnka (schválený směr): https://claude.ai/code/artifact/124da2a5-b8b4-4a5f-ad39-a8a41b5b4d33

## Režim exekuce
- superpowers:subagent-driven-development — na každý úkol čerstvý implementer subagent,
  pak spec review subagent, pak code quality review subagent; opravy zpět implementerovi.
- Git: commity do lokálního gitu odsouhlaseny (nic se nepushuje bez souhlasu).
- Nepouštět víc implementerů paralelně nad stejným repem.

## Stav úkolů
| # | Úkol | Stav |
|---|------|------|
| 1 | Scaffold Next.js + design tokens | ✅ HOTOVO (commity `76a7444`, `107df97`; spec ✅, quality ✅ po opravách) |
| 2 | Embed Sanity Studio | ⏸ PŘERUŠENO — dispatch implementera byl připraven, uživatel ho odmítl a session se ukládá |
| 3 | Realizace schema | čeká |
| 4 | Clanek schema | čeká |
| 5 | siteTexts singleton schema | čeká |
| 6 | Typed client + fetchers (TDD) | čeká |
| 7 | Revalidation webhook (TDD) | čeká |
| 8 | Homepage hero + featured grid | čeká |
| 9 | Realizace list + detail | čeká |
| 10 | Deploy + webhook (RUČNÍ — účty uživatele: GitHub/Vercel/Sanity) | čeká |
| 11 | E2E ověření na živém nasazení (RUČNÍ) | čeká |

## Task 1 — co přesně vzniklo
- Next.js **16.2.10** (ne 15 jako v plánu!), React 19.2.4, TypeScript, App Router, src-dir,
  alias `@/*`, bez Tailwindu, npm. Turbopack default.
- `src/app/tokens.css` — design tokeny přesně dle nástěnky (světlý + dark režim).
- `src/app/globals.css` — reset (`*, *::before, *::after { box-sizing: border-box }`), body na tokenech.
- `src/app/layout.tsx` — lang="cs", metadata V Malby, importuje tokens+globals; `page.tsx` je minimální placeholder (přestaví Task 8).
- Hygiena po review: `.claude/settings.local.json` untracknut + gitignorován; `!.env.example` v .gitignore.
- create-next-app odmítl scaffold přímo (název složky `_VMALBY` není validní npm name) —
  scaffoldováno přes podsložku `vmalby` a přesunuto do rootu.
- create-next-app 16 sám vygeneroval `CLAUDE.md` (pointer na `AGENTS.md`) — nejsou naše, ale commitnuté.
- Git vyžadoval `git config --global --add safe.directory D:/_WORK/_VMALBY`.

## Task 2 — jak pokračovat (přesná strategie)
Kódová část je automatizovatelná BEZ přihlášení do Sanity (placeholder env), reálné
Sanity projectId doplní uživatel později:
1. `npm install sanity next-sanity @sanity/image-url @sanity/webhook`
   (pozor na peer-deps s next@16 — neřešit --force bez nahlášení)
2. `sanity/schemaTypes/index.ts` — prázdný registr (`export const schemaTypes: never[] = []`)
3. `sanity/structure.ts` — restriktivní desk structure (Realizace / Články / Texty stránek,
   siteTexts jako singleton s pevným documentId) — přesný kód je v plánu, Task 2 Step 4
4. `sanity.config.ts` v rootu — čte NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET z env, basePath /studio
5. `.env.local` s placeholdery (projectId=placeholder) + `.env.local.example` commitnutý;
   ověřit, že `!.env.example` negace chytí i `.env.local.example`, jinak přidat
6. `src/app/studio/[[...tool]]/page.tsx` — NextStudio mount, `dynamic = 'force-static'`
7. Ověření jen `npm run build` (runtime Studio bez reálného projectId nejde)
8. Commit "feat: embed Sanity Studio with restricted content-only navigation"

**Uživatel musí (kdykoli, odblokuje runtime ověření Studia a Tasky 10–11):**
- spustit `npx sanity@latest init` (interaktivní login) → projekt "V Malby", dataset `production`,
  NEZAPISOVAT config soubory do složky (řekni ne) → opsat Project ID do `.env.local`
- vygenerovat `SANITY_REVALIDATE_SECRET` (openssl rand -hex 32) do `.env.local`

## Tasky 3–9 — poznámky
- Kompletní kód všech kroků je v plánu — subagentům předávat plný text úkolu, ne odkaz na soubor.
- Tasky 3–5 (schémata), 6–7 (TDD s mockovaným klientem), 8–9 (stránky) jsou plně
  automatizovatelné s placeholder env; ověření přes `npm test` / `npm run build`.
- Plán psán pro Next 15; nainstalován Next 16 — detail page v Tasku 9 už používá
  `params: Promise<{slug}>` (správně pro 15+ i 16). Kdyby next-sanity mělo problém
  s next@16 peer-deps, nahlásit místo tichého --legacy-peer-deps.
- Quality review Task 1 poznamenal do budoucna: `--oxide-soft` v dark módu je tmavší
  než `--oxide` (jen dekorativní použití), `a {text-decoration:none}` řešit v komponentách,
  `metadataBase` přidat až bude doména (Task 8+).

## Kontext rozhodnutí (z brainstormingu)
- Jen web, ne celá identita; jen čeština; teplý/řemeslný vizuál (blíž Lupoi, ne Penta).
- Admin (Sanity Studio na /studio) je omezený jen na obsah: Realizace, Články, Texty stránek.
  Otec uživatele edituje obsah, design je mimo jeho dosah.
- Publish → webhook `/api/revalidate` (ověřený podpis) → revalidatePath → změna živě do vteřin.
- Fotky zatím placeholdery, reálné se doplní později (fáze 7 design docu).
- Tento plán = fáze 1–2 design docu + tenký vertikální řez; fáze 3–8 budou další plány.
