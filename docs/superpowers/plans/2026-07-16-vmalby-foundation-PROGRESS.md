# V Malby — stav exekuce

Aktualizováno: 2026-08-21 (session 6, vyřešen exFAT blocker)

## ⚠️ Projekt se přesunul z `E:\_WORK\_VMALBY` na `C:\Users\kvrag\Documents\vmalby`

exFAT blocker popsaný níže je vyřešen — **repo je teď na GitHubu
(`https://github.com/yakub02/vmalby`, remote `origin`, branch `master`) a
klonováno na `C:\Users\kvrag\Documents\vmalby`, kde `C:` je NTFS.** Ověřeno
přímo: `npm install`, `npx prisma generate`, `npm run build` (zelený, včetně
`ƒ Proxy (Middleware)` řádku), `npm run dev` + `/sprava/*` routy přes `curl`
s ručně podepsaným session cookie — všechny vrátily 200 (dřív 500 na `E:`).
`.env.local` (lokální tajemství, není v gitu) zkopírováno ručně do nového
klonu, `DATABASE_URL` pořád ukazuje na stejný Docker kontejner `vmalby-pg`
(port 5433) — funguje mezidiskově, protože je to jen TCP spojení.
**Další sessions by měly začínat s working directory `C:\Users\kvrag\Documents\vmalby`,
ne `E:\_WORK\_VMALBY`.** `E:\_WORK\_VMALBY` zůstává jako historická kopie se
stejnou historií (pushnuto před klonováním), ale nepokračuj v ní dál — commituj
a pushuj z `C:`, aby oba adresáře nerozjely rozdílnou historii.

## Session 6 (2026-08-21), pokračování — Task 9 (redakční rozhraní /sprava)

Implementováno kompletně dle plánu, žádné odchylky v kódu: Tiptap editor
(`src/components/Editor.tsx`), `SmazatTlacitko`, `RealizaceForm`, `ClanekForm`,
`TextyForm`, layout + CSS administrace (`src/app/sprava/`), seznamy a detaily
pro Realizace i Články (`[id]/page.tsx`, `id === 'novy'` = nový záznam),
`src/app/sprava/texty/page.tsx`. `npx tsc --noEmit` a `npx eslint .` čisté.

**Krok 10 (manuální průchod adminem přes `npm run dev`) je BLOKOVANÝ** —
stejný kořenový problém jako Task 8 (exFAT na `E:` nepodporuje NTFS junction
pointy), tentokrát ne při `next build`, ale přímo při `next dev`: jakákoli
`/sprava` routa, která sáhne na Prisma (tzn. všechny kromě `/sprava` samotné,
což jen redirectuje), vrací HTTP 500, protože Turbopack se snaží vytvořit
junction point pro `pg` (Prisma driver adapter) a exFAT to nedovolí. Ověřeno
v `.next/dev/logs/next-development.log`: `TurbopackInternalError: failed to
create junction point ... node_modules\pg ... Nesprávná funkce. (os error 1)`.
Přihlašovací stránka (`/prihlaseni`, nesahá na Prisma) i redirect z `/sprava`
fungovaly normálně (307), samotné admin stránky ne. Otestováno ručně podepsaným
session cookie přes `curl` (bez nutnosti procházet React Server Action
protokol prohlížečem) — potvrzeno, že padá kód, ne moje test metoda.

**Tohle dál blokuje i Task 10 a Task 8's Step 7, oboje vyžadují `npm run
build` nebo funkční `/sprava`/`npm run dev` s daty z DB.** Dokud se filesystém
nevyřeší (přesun na NTFS, nebo WSL), nejde lokálně ověřit nic, co se dotkne
Prisma přes Turbopack — ani dev, ani build. `next dev` fungoval dřív (session
4) jen proto, že tehdy žádná stránka ještě nesahala na Prisma/pg za běhu.

Další na řadě: Task 10 (veřejné stránky z databáze) z
`plans/2026-08-12-vmalby-redakcni-system.md` — počítej s tím, že i jeho
Step 4 (ověření přes `npm run dev`) bude stejně blokované, dokud se nevyřeší
filesystém. Doporučuju při další session nejdřív probrat s uživatelem, jestli
přesunout projekt na NTFS/WSL, než se pokračuje dál naslepo bez možnosti
cokoliv reálně proklikat.

## Session 6 (2026-08-21), první část — Task 1 dokončen (Prisma migrace)

Blocker z předchozích sessions vyřešen: Docker Desktop nastartován, čistá
instance Postgresu spuštěná v kontejneru `vmalby-pg` (`postgres:16`, port
**5433**, aby nekolidovala s neznámou instancí na 5432 na stroji). `DATABASE_URL`
v `.env.local` přepnuto na port 5433. `npx prisma migrate dev --name init`
proběhla čistě (`prisma/migrations/20260821095539_init/`), `npx prisma generate`
taky. Task 1 je tím kompletní — commitnuto. **Pozor:** kontejner `vmalby-pg`
je bez `--restart`, takže po restartu Dockeru/stroje ho bude potřeba znovu
spustit ručně (`docker start vmalby-pg`, ne `docker run` — jméno je obsazené).

Navazně dokončen i **Task 4 (čtecí vrstva obsahu)** — `src/lib/content/realizace.ts`,
`clanek.ts`, `siteTexts.ts` přesně dle plánu, žádné odchylky. `npx tsc --noEmit`,
`npx eslint .` i `npx vitest run` (10 testů) čisté. Commitnuto zvlášť.

A rovnou i **Task 5 (server actions Realizace + revalidace)** — `src/lib/revalidace.ts`
(cesty pro revalidaci) a `src/lib/actions/realizace.ts` (`ulozRealizaci`/`smazRealizaci`,
Prisma a `next/cache` mockované v testech). Žádné odchylky od plánu. `npx tsc --noEmit`,
`npx eslint .` i `npx vitest run` (19 testů) čisté. Commitnuto zvlášť.
A rovnou i **Task 6 (server actions Články a Texty stránek)** — `src/lib/actions/clanek.ts`
(`ulozClanek`/`smazClanek`) a `src/lib/actions/siteTexts.ts` (`ulozSiteTexts`, s
whitelistem povolených polí proti přepsání `id` singletonu). Žádné odchylky od plánu.
`npx tsc --noEmit`, `npx eslint .` i `npx vitest run` (26 testů) čisté. Commitnuto zvlášť.
A rovnou i **Task 7 (sanitizace rich textu)** — `src/lib/sanitizace.ts` (`sanitizujObsah`,
`sanitize-html` s allowlistem `p/strong/em/br/img`), zapojeno do `popis` v Realizace
a `obsah` v Článku actions. Drobná odchylka od plánu: knihovna vrací `<img ... />`
místo `<img ...>` a u `javascript:` URL nechává prázdný `<img />` (atribut zahozen,
tag ne) — dle poznámky v plánu upraveno **očekávání testů**, ne sanitizační pravidla.
`npx tsc --noEmit`, `npx eslint .` i `npx vitest run` (33 testů) čisté. Commitnuto zvlášť.

**Vedlejší zjištění (mimo scope Tasku 7):** `npm audit` po instalaci `sanitize-html`
hlásí 8 high-severity zranitelností, ale všechny jsou v existujících závislostech
nesouvisejících s touto instalací — `next` (16.2.10, plán pinuje verzi a zakazuje
upgrade), `postcss`, `sharp`, `prisma`/`@prisma/config`, `brace-expansion`, `js-yaml`.
Neřešeno, protože oprava (`npm audit fix --force`) by upgradovala `next` na 16.3.2 a
`prisma` na 6.12.0 — mimo scope a proti global constraint plánu. Řekni uživateli, ať
rozhodne, jestli/kdy tohle řešit samostatně.

A rovnou i **Task 8 (nahrávání fotek)** — `src/lib/uploads.ts` (`nazevSouboru`,
`ulozFotku` se `sharp` resize+webp), `src/app/api/upload/route.ts` (chráněno session
cookie zvlášť, protože `proxy.ts` hlídá jen `/sprava`), `public/uploads/.gitkeep`.
**Skutečný bug objevený testem** (ne formátovací rozdíl): plánová implementace
`nazevSouboru` používala `puvodni.replace(/\.[^.]*$/, '')` na celý vstup včetně
cesty — u `../../etc/passwd` regex sežral skoro celý řetězec jako "příponu" a
skončilo to na fallbacku `foto-*.webp` místo `etc-passwd-*.webp`. Opraveno: přípona
se teď ořezává jen z posledního segmentu za `/`, zbytek cesty jde do `slugify`
beze změny — **implementace opravena, ne test** (na rozdíl od Tasku 7, kde šlo
jen o formát výstupu knihovny).

**⚠️ Zásadní infrastrukturní zjištění, netýká se Tasku 8 samotného:**
`npm run build` (Turbopack i `--webpack`) na tomhle stroji **nejde spustit vůbec**,
nezávisle na kódu. `E:` je **naformátovaný jako exFAT**, ne NTFS. Turbopack build
padá na `failed to create junction point` (NTFS junction pro nativní balíček
`sharp` — exFAT junction pointy nepodporuje vůbec, to není otázka oprávnění).
`next build --webpack` padá jinak: `EISDIR: illegal operation on a directory,
readlink`, a to i na starých souborech (`src/app/prihlaseni/page.tsx`, existující
před touto session) — ověřeno přímo přes `fs.readlinkSync()` v Node: na téhle
exFAT+Node kombinaci vrací `readlink()` na běžný soubor `EISDIR` místo očekávaného
`EINVAL`, a webpack to bere jako fatal error místo "není symlink, pokračuj".
**Tohle není regrese z téhle session** — `npm run build` zřejmě nikdy předtím
neproběhl úspěšně na tomhle stroji, jen `next dev` (ověřováno přes `curl`).
Uživatel rozhodl pokračovat bez lokálního `npm run build` ověření (nahrazeno
`tsc --noEmit` + `eslint .`, které oboje projdou) a řešit to případně až na
hostingu v Tasku 11 (pravděpodobně Linux/NTFS, kde tenhle problém nejspíš
nenastane). **Než se půjde na Task 11 nebo cokoliv, co vyžaduje `npm run build`
lokálně, tohle je potřeba vyřešit** — buď přesunout projekt na NTFS disk/složku,
nebo pracovat z WSL.

`npx tsc --noEmit` a `npx eslint .` čisté. Commitnuto zvlášť.

Další na řadě: Task 9 (redakční rozhraní /sprava) z `plans/2026-08-12-vmalby-redakcni-system.md`.

## Session 5 (2026-08-20) — commit session 3/4 práce

Stav ze session 4 (redesign + reálný obsah z vmalby.cz) byl beze změny —
`git status` odpovídal přesně tomu, co popisuje session 3/4 níže. Znovu ověřeno
`npx tsc --noEmit` a `npx eslint .` (oba čisté) a commitnuto jako `a3adf07`
(vyjma `.claude/` a `.impeccable.md`, což je lokální nástrojová konfigurace,
ne obsah projektu). Další na řadě: Task 1 (Prisma migrace, čeká na přístup
k Postgresu) nebo Task 4 (čtecí vrstva obsahu) z `plans/2026-08-12-vmalby-redakcni-system.md`.

## Session 3 (2026-08-13) — redesign dotažen, reálný obsah z vmalby.cz

Vše z téhle sekce je **necommitnuté** (`git status` ukazuje jen modified/untracked,
žádný nový commit od `8066326`). Než cokoliv dalšího, zvaž commit — je toho hodně
a je to funkční, ověřené stavem popsaným níže.

**Co se stalo, v pořadí:**

1. Navázali jsme na session 2's "první pass" (commit `8066326`) — dokončili jsme
   redesign podle `specs/2026-08-12-vyzkum-referencnich-webu.md` (Lupoi fullbleed foto,
   Penta skladba stránky). `RealizaceKarta` → `RealizacePolozka` (fotka+popisek, ne karta),
   asymetrická mřížka realizací, `.popisek` mikrolabel systém.
2. `/critique` (design-critique skill) našel 4 problémy, všechny opravené:
   hlavní nav neukazovala aktuální stránku, nav nebyla sticky (mizela při scrollu),
   `/realizace/neexistuje` padala na necobrandovanou anglickou Next.js 404 stránku,
   `.popisek` mikrotext měl kontrast ~2.9:1 (potřeba 4.5 AA) — opraveno v `tokens.css`
   (`--ink-mute` ztmavena) + nové `src/app/not-found.tsx` a `src/app/(web)/not-found.tsx`
   (pozor: musí být OBA, jinak se `<Paticka/>` renderuje dvakrát — `(web)/layout.tsx` ji
   přidává pro cokoli uvnitř skupiny, root not-found.tsx potřebuje vlastní jen pro
   URL mimo `(web)`).
3. Uživatel chtěl jinou vizuální náladu — pryč od serifu, **bold sans, velká typografie,
   sleek animace/hover efekty**. Font vybraný z 3 živých náhledů (screenshoty se skutečným
   textem stránky): **Bricolage Grotesque** (ne Archivo Expanded, ne Unbounded) pro nadpisy,
   Archivo zůstává pro text/mikrotypografii. `--serif` token přejmenován na `--display`.
   Paleta zůstala — jen typografie a pohyb, žádná barevná revoluce (uživatel to tak chtěl).
   Nový `src/components/Odhaleni.tsx` (IntersectionObserver reveal, `'use client'`),
   sticky/underline-sweep nav, hover scale na fotkách realizací, load-in animace hero.
   **Bug po cestě:** háček nad Ř/Č/Š/Ž ve velkém řezu (`line-height` < 1) přesahoval
   nad vlastní řádkový box a bil se s popiskem nad nadpisem — typický problém velké
   bold typografie s českou diakritikou. Oprava: `line-height` zpět k ~1.0–1.05 a víc
   `margin-top` na všech nadpisech co mají popisek nad sebou (`.uvod__nadpis`,
   `.zahlavi__nadpis`, `.detail__nadpis`, `.blok__nadpis`, `.polozka__nazev`).
4. Uživatel chtěl reálná data z **vmalby.cz** (starý web, pořád live) místo vymyšlených
   placeholderů — barvy, texty, fotky. `WebFetch` na živé HTML nefungovalo pro barvy/fotky
   (markdown konverze je ořeže), takže raw `curl` + `iconv -f ISO-8859-2 -t UTF-8`
   (starý web je v Latin-2, ne UTF-8). Zjištěno:
   - **Skutečná značková tmavě červená: `#a31e3e`** (`css/style.css`, h1 i hover odkazy),
     tmavší varianta `#75142a`. V `tokens.css` teď `--oxide: #A31E3E` (light),
     `#D9748C` (dark, pro kontrast na tmavém pozadí), `--oxide-soft` odvozené.
   - `reference.html` má **reálný, bohatý seznam zakázek 2000–2025** (Pražský hrad,
     Národní knihovna Klementinum, Campus Science Park + Pavel Hayek, Palác Anděl,
     Maison Ořechovka…) — nahradil vymyšlených 5 položek v `ukazkovyObsah.ts` za
     9 reálných (`UKAZKOVE_REALIZACE`), 4 označené `vybrana: true`.
   - Reálné kontaktní údaje (tel. `+420 775 242 809`, `vmalby@vmalby.cz`) i fakturační
     (IČ/DIČ/účet z `kontakty.php`) — nahradily placeholdery, nové `FIREMNI_UDAJE` export
     zobrazený na `/kontakt`.
   - **Fotky:** staré galerie (`fotogalerie.html`, `designove-povrchy.html`,
     `zajimave-projekty.html`) mají reálné fotky, ale **nízké rozlišení** (většina
     700×525 nebo míň, foceno 2005–2015 mobilem/kompaktem). 15 vybraných stažených do
     `public/realizace/*.jpg`, `FotoPlocha.tsx` rozšířen o `next/image` (`src`/`alt` props,
     fallback na texturu placeholder když `src` chybí). **Hero na Domů zůstal texturový
     placeholder** — žádná ze stažených fotek nemá rozlišení na fullbleed 100vh hero,
     stažené 2000×500 slideshow fotky mají navíc vypálenou vinětu ze starého designu.
   - **Fotky nejsou spárované 1:1 s konkrétní jmenovanou zakázkou** (galerie je organizovaná
     podle techniky, ne podle projektu) — výjimka je "Palác Anděl", kde fotka doslova
     ukazuje nápis "palác anděl" vyrytý do stěrky. Ostatní fotky jsou dokladové ukázky dané
     techniky (benátský štuk, kovová stěrka…), captions (`foto__stitek`/`alt`) proto popisují
     techniku, ne tvrdí "tohle je přesně ta budova". Řečeno uživateli přímo, ne zamlčeno.

**Ověřeno v této session:** `npx tsc --noEmit` čistý po všech změnách výše (byl přerušen
uprostřed finálního běhu eslint + vizuální kontroly dev serverem — **eslint a screenshot
kontrola nového obsahu ještě neproběhly, udělej to před commitem**).

**Ověřeno v session 4 (2026-08-15):** `npx eslint .` čisté (exit 0), `npx tsc --noEmit`
čisté. Dev server nastartován a ověřen přes `curl`: `/realizace` má 9 položek, `/kontakt`
obsahuje fakturační blok (IČ, DIČ, bankovní účet, e-mail), `--oxide` (`#A31E3E`) je v
`tokens.css`, `/realizace/neexistuje` vrací HTTP 404 s vlastní stránkou a footer se
nerenderuje dvakrát. Homepage `vybrana` filtr (4 položky: Campus Science Park, Palác
Anděl, Klementinum, Pražský hrad — Vikárka) — ponecháno na 4, jsou to nejsilnější/
nejznámější zakázky, na homepage grid to sedí. **Připraveno na commit.**

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
