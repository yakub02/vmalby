# Průzkum referenčních webů — Lupoi Design Studio a Penta

Datum: 2026-08-12
Důvod: design doc říká „vizuální nálada teplejší/řemeslné, **blíž Lupoi Design Studio než Penta**",
nástěnka doplňuje „Penta — **jen struktura**". Tenhle dokument rozebírá, co konkrétně z každého
webu brát, protože první pokus o frontend to nedodržel.

## 1. Lupoi Design Studio — lupoidesignstudio.com

Interiérový a architektonický ateliér (Londýn, Milán, Řím, Dubaj), zaměřený na hotely a
historické budovy. Web běží na Readymag.

### Co dělá vizuálně

**Úvodní obrazovka nemá vůbec žádné rozhraní.** Celý viewport zabírají dvě fotografie na sraz,
od kraje ke kraji, bez okrajů a bez kontejneru — sušená tráva a řasená látka v západu slunce.
Materiál a textura *jsou* obsah. Přes ně je jediné slovo nahoře uprostřed (`LDS`, serif, velmi
rozpáleně prostrkaný) a jediný odkaz dole (`enter`, malé písmo, lowercase). Žádná navigační lišta,
žádné tlačítko, žádná karta, žádný nadpis, žádný odstavec.

**Typografie:** ve zdroji jsou `Austin` (vysokokontrastní editorial serif od Commercial Type —
didonovská kresba, používá ho třeba Vanity Fair) a `Graphik` (neutrální grotesque od téže
slévárny), doplňkově `Nobel` a `Spektra`, s fallbackem na Georgii a Arial.

**Barvy:** ve zdroji jen `#282828` (téměř černá) a `#A2A2A2` (šedá). Veškerou barvu na stránku
přináší fotografie, ne paleta rozhraní.

**Copy je zredukované na minimum.** Celý web obsahuje jen: `ABOUT US`, `WORKS`, `INTERIOR DESIGN`,
`BRAND DESIGN`, `contacts`, tagline `DESIGNING EMOTION, REDEFINING EXPERIENCES` a adresy poboček.
Žádné marketingové odstavce, žádné „proč my", žádné odrážky. Popisky a navigace jsou verzálky
s výrazným prostrkáním.

### Co si z toho vzít pro V Malby

| Prvek | Aplikace |
|---|---|
| Fotografie od kraje ke kraji, bez kontejneru | Hero i galerie realizací musí být fullbleed, ne dlaždice v mřížce o šířce 68rem |
| Text jako minorita | Na úvodu stačí jedna věta. Žádné „naše hodnoty", žádné trojice benefitů |
| Verzálky s velkým prostrkáním jako jediný grafický prvek | Kategorie, lokalita, rok, navigace |
| Vysoký kontrast display serifu vůči klidnému textu | Nadpis realizace výrazně větší, než jsem měl (teď je 1.19rem na kartě — má být násobně víc) |
| Barvu nese fotka, ne rozhraní | Oxidový akcent používat vyloženě úsporně |
| Žádné karty | Realizace prezentovat jako fotografie s popiskem pod ní, ne jako orámovaný box s pozadím |

**Pozor na licence:** Austin i Graphik jsou komerční fonty Commercial Type, nejsou zdarma.
Buď je koupit, nebo najít náhradu s podobnou kresbou (vysoký kontrast, didonovský serif).

## 2. Penta Real Estate — pentarealestate.com

Největší developer v ČR/SR/PL. Bereme **jen strukturu**, ne vzhled — jejich web je korporátní,
chladný a přesně to je ta poloha, které se chceme vyhnout.

### Skladba domovské stránky (odshora dolů)

1. Hlavička s logem, navigací a přepínačem jazyků
2. Tagline „Courage to Create" + čtyři vybrané projekty
3. Sekce s posláním firmy
4. **Blok čísel** — 39 projektů, 50+ ocenění, objem aktiv
5. Šest vlajkových projektů jako prokliknutelné dlaždice s tematickým podtitulkem
   („In Tune with Nature", „Masaryčka Connects")
6. **Architekti-partneři** s portréty a citacemi + kolotoč log spolupracujících studií
7. Ocenění
8. ESG ve třech záložkách
9. Aktuality jako karty
10. Nábor do týmu
11. Patička s kontakty, newsletterem a klientským portálem

Navigace dělí projekty na **rezidenční** a **komerční**, k tomu O nás, Aktuality, Kariéra, ESG,
Kontakt.

### Co si z toho vzít

- **Rozdělení portfolia podle typu** — u nás podle techniky (malba / štuk / beton / kovy / tapety),
  to už v content modelu máme.
- **Důkazní bloky.** Penta staví důvěryhodnost na číslech, oceněních a jménech architektů.
  V Malby mají přesně tohle: rok 1992, Best of Realty, spolupráce s Pavlem Hayekem.
  Patří to na úvodní stránku, ale jako věcný řádek, ne jako „hero metric" dlaždice.
- **Projekt má tematický podtitulek**, ne jen název — dává kartě příběh.
- Aktuality a kontakt na konci domovské stránky.

### Co si z toho výslovně nebrat

Chladnou korporátní paletu, kolotoče log, záložkové sekce, newsletter, stat-bloky jako
grafický prvek, obecný firemní jazyk.

## 3. Shrnutí do jedné věty

**Skelet Penty, kůže Lupoi:** obsahová struktura, kterou od dodavatele čeká developer
(portfolio podle techniky, doklady kvality, aktuality, kontakt), podaná jako tichý fotografický
web s minimem textu, fullbleed snímky, prostrkanými verzálkami a jedním výrazným serifem.

## 4. Co je potřeba rozhodnout, než se staví

1. **Fonty.** Austin/Graphik jsou placené. Koupit, nebo vybrat volnou náhradu?
2. **Fotografie.** Celý tenhle směr stojí a padá s fotkami realizací. Dokud nejsou, hero bude
   jen zástupná plocha a web bude působit prázdně — u Lupoi je prázdno záměr, u nás by to byl
   nedodělek. Stojí za zvážení dofotit aspoň tři realizace před spuštěním (bod 8 design docu).
