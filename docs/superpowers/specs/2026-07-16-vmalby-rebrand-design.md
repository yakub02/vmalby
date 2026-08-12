# V Malby — rebrand webu vmalby.cz — design doc

Datum: 2026-07-16
Aktualizováno: 2026-08-12 — bod 6 (technická architektura) přepsán: **místo Sanity (headless CMS)
se staví vlastní redakční systém uvnitř téže Next.js aplikace.** Body 1–5 (cíl, IA, content model,
vizuální směr) platí beze změny — mění se jen to, čím se obsah spravuje a kde leží.
Stav: schváleno (viz rozhodnutí níže), čeká na implementační plán

## 1. Kontext a cíl

Vmalby s.r.o. je pražská malířská/řemeslná firma (od 1992) — malování a lakování, tapetování,
dekorativní povrchy (benátský štuk, imitace kovů), designové betonové/cementové stěrky, luxusní
nátěry. Firma má prestižní realizace (např. Campus Science Park — umělecká stěna 3×8 m ve
spolupráci s výtvarníkem Pavlem Hayekem, ocenění Best of Realty), ale současný web
(vmalby.cz) tuto úroveň nekomunikuje: je čistě český, bez blogu/CMS, vizuálně skromný.

**Cíl rebrandu:** nový web, který úrovní realizací odpovídá, s administrací, přes kterou otec
(bez technických znalostí) samostatně přidává a upravuje obsah — a změna se rovnou promítne
na živém webu.

**Mimo rozsah:** nové logo / vizuální identita firmy mimo web, tiskoviny, jiné jazykové mutace.
Web zůstává jen v češtině, doména vmalby.cz se nemění.

## 2. Rozhodnutí z brainstormingu (proč tak, ne jinak)

| Otázka | Rozhodnutí | Důvod |
|---|---|---|
| Rozsah rebrandu | jen web, ne celá identita firmy | rychlejší, levnější, méně rizika pro zavedenou značku |
| Administrace | omezená jen na obsah (články/fotky/texty), ne plnohodnotné CMS s editací layoutu | otec nemá spravovat design, jen obsah |
| Editovatelný obsah | realizace, články **i** texty hlavních stránek | širší rozsah než jen portfolio — viz content model níže |
| Jazyk | jen čeština | cílovka (čeští investoři/developeři/stavební firmy) komunikuje česky, jednodušší admin bez duplicitních překladů |
| Účel dokumentu | budeme stavět společně v Claude Code | plán může být konkrétní o zvoleném stacku, ne jen obecný brief |
| Vizuální nálada | teplejší/řemeslné, blíž Lupoi Design Studio než Penta | odpovídá hodnotě "honest craftsmanship", kterou firma už komunikuje |
| Foto podklady | zatím placeholdery, doplní se později | není blokující pro start stavby webu |

## 3. Sitemapa / informační architektura

- **Domů** — fullbleed foto realizace, jednověté positioning, 3–4 vybrané realizace, pruh "od 1992", teaser aktualit, kontakt CTA
- **Ateliér / O nás** — historie od 1992, hodnoty, tým, průběh zakázky
- **Realizace** — filtrovatelné portfolio podle kategorie (malba, štuky, beton, kovy, tapety) → detail realizace jako mini case-study (galerie + popis)
- **Služby** — malba/lakování, tapetování, dekorativní štuky, imitace kovů, designový beton, luxusní nátěry (každá vlastní krátká stránka/sekce s fotkami)
- **Aktuality** — editorialní články: novinky, postupy, realizace v procesu
- **Kontakt**

## 4. Content model a rozsah administrace

Administrace je **úmyslně omezená na obsah** — otec nemůže rozbít layout, protože layout není
editovatelný, jen jednotlivá pole.

### Kolekce: Realizace
- Název realizace (text)
- Lokalita (text)
- Rok (číslo)
- Kategorie (výběr z předdefinovaných chipů: malba, štuk, beton, kovy, tapety)
- Popis (rich text — jen tučně/odstavce, žádné volné HTML)
- Fotky (galerie, drag&drop upload, automatický resize/crop)
- Příznak "vybraná realizace" (zobrazí se na Domů)

### Kolekce: Články / Aktuality
- Nadpis, perex, titulní foto, datum
- Obsah (rich text s možností vložit foto do textu)

### Singleton: Texty hlavních stránek
- Strukturovaná pole per sekce (hero text na Domů, text O nás + foto týmu, popisy jednotlivých
  služeb, kontaktní údaje) — ne jedno volné textové pole, aby nešlo omylem rozbít vzhled sekce.

### Mimo dosah administrace
Design, typografie, barvy, struktura stránek, navigace — mění se jen při další společné práci
na webu, ne přes admin.

## 5. Vizuální směr

Viz publikovaná vizuální nástěnka (paleta, typografie, hero koncept, karty realizací, mockup
administrace, seznam čeho se vyhýbáme/čeho se držíme):
https://claude.ai/code/artifact/124da2a5-b8b4-4a5f-ad39-a8a41b5b4d33

Shrnutí:
- **Paleta** odvozená z materiálů firmy (vápno, uhel, oxidový pigment, měděnka, kámen, sádra) —
  ne obecná "krémová + terakota" kombinace.
- **Typografie**: serif pro nadpisy (charakter, ne PowerPoint), grotesque sans pro text a
  administraci.
- **Fotografie nese příběh** — fullbleed, minimum textu přes foto, žádné generické ikonky místo
  fotek realizací.
- Vyhýbáme se: gradientovým hero pozadím, Inter/Space Grotesk jako výchozí volbě bez rozmyslu,
  emoji jako odrážkám, "vše na střed", kartám s barevným proužkem nahoře.

## 6. Technická architektura — self-hosted redakční systém

**Zvolený stack:** jedna Next.js aplikace (App Router) + PostgreSQL přes Prisma. Žádný samostatný
CMS proces, žádná cloudová CMS služba. Nasazení na existující webhosting firmy (Node hosting).

**Architektura:** veřejné stránky (Domů, Ateliér, Realizace, Služby, Aktuality, Kontakt) čtou obsah
přímo z vlastní databáze přes server components. Redakční část (`/sprava`) je součástí té samé
aplikace, chráněná přihlášením.

- **Databáze:** PostgreSQL + Prisma (typované modely, migrace). Postgres zvolen místo SQLite kvůli
  přenositelnosti — SQLite má problém na běžném shared/serverless hostingu.
- **Obsahové modely** (stejné tři jako v bodu 4, teď jako Prisma tabulky): `Realizace` (název,
  lokalita, rok, kategorie, popis, galerie fotek, příznak „vybraná"), `Clanek` (nadpis, perex,
  titulní foto, datum, obsah), `SiteTexts` (jeden řádek — hero texty, O nás, kontakt, popisy služeb;
  strukturovaná pole, ne jedno volné textové pole, aby nešlo omylem rozbít vzhled).
- **Přihlášení:** jedno sdílené heslo (`ADMIN_PASSWORD` v env). Po zadání se nastaví podepsané
  session cookie (httpOnly), `middleware.ts` chrání celou větev `/sprava`.
- **Rozsah administrace:** seznam Realizací a Článků s tlačítky Přidat / Upravit / Smazat a jeden
  formulář pro Texty stránek. Žádný přístup ke schématu ani vzhledu, jen k obsahovým polím —
  stejné omezení, jaké mělo mít Sanity Studio.
- **Publikování bez webhooků:** admin i web běží ve stejné aplikaci, takže uložení formuláře
  (server action) rovnou zavolá `revalidatePath()` na dotčené stránky. Jednodušší než webhook
  s ověřeným podpisem, stejný efekt — změna na webu za pár vteřin.
- **Rich text:** lehký editor (Tiptap) omezený jen na odstavce / tučné / vložení fotky. Žádné volné
  HTML pole; obsah se před uložením sanitizuje na serveru.
- **Fotky:** ukládají se na disk aplikace (`public/uploads/`) s automatickým resizem přes `sharp`.
  Funguje na klasickém Node hostingu. Pokud by se aplikace nakonec nasazovala na serverless
  platformu (Vercel apod.), bude nutné přehodit na objektové úložiště — řeší se až u deploye.
- **Testování:** Vitest na server actions (create/update/delete pro každý typ obsahu) a na
  revalidační logiku.
- Frontend je 100% custom kód (Next.js + vlastní CSS), žádná šablona — vizuální směr z bodu 5 se
  implementuje napřímo, ne přes témata/pluginy.

**Zvážené alternativy:**
- **Sanity (headless CMS)** — původní volba tohoto dokumentu, zamítnuta: zbytečná komplexita se
  schématy jako kódem a závislost na externí službě pro tři jednoduché typy obsahu. Obsah má ležet
  ve vlastní databázi na vlastním hostingu.
- **Payload CMS (self-hosted framework)** — ušetřil by psaní auth/CRUD/editoru, ale pořád je to
  forma schématu v kódu a další závislost k naučení. Pro tři typy obsahu je vlastní minimální admin
  přímočařejší.

## 7. Fáze rebrandu (roadmap)

1. Nastavení projektu — Next.js kostra, Postgres + Prisma, git repo
2. Content model — tabulky Realizace/Články/Texty stránek dle bodu 4 + redakční část `/sprava`
3. Design systém — komponenty (hero, karta realizace, článek, nav, footer) dle bodu 5
4. Stránky — Domů, Ateliér, Realizace (list+detail), Služby, Aktuality, Kontakt, s placeholder fotkami
5. Onboarding administrace — zaškolení otce (přidání realizace/článku)
6. Migrace obsahu — přenos textů a existujících referencí ze starého webu
7. Fotky realizací — nahrazení placeholderů reálnými fotkami (může dělat otec přímo přes admin)
8. Launch — přepnutí DNS na vmalby.cz, redirecty ze starých URL kvůli SEO

## 8. Otevřené body / rizika

- **Fotografie realizací**: zatím jen placeholdery. Doporučeno aspoň část realizací (např.
  Campus Science Park) profesionálně dofotit před launchem — nebrání to ale zahájení stavby
  webu, může se doplnit ve fázi 7.
- Doména a hosting DNS zůstávají beze změny, mění se jen to, co za nimi běží.
