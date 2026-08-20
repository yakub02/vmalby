import type { Clanek, Fotka, Realizace } from '@prisma/client'

/**
 * Dočasný obsah, dokud neběží databáze. Typy jsou schválně odvozené přímo
 * z Prisma modelů, takže až bude migrace hotová, stačí ve stránkách vyměnit
 * import za fetchery z `@/lib/content/*` — tvar dat sedí.
 *
 * Realizace, texty a kontakt níže jsou reálná fakta z aktuálního webu
 * vmalby.cz (reference.html, profil.html, kontakty.php) — ne vymyšlený obsah.
 * Fotky u realizací jsou reálné snímky z fotogalerie vmalby.cz, ale nejsou
 * dohledatelně spárované s konkrétní zakázkou 1:1 — jde o dokladové fotky
 * dané techniky (benátský štuk, designový beton…), ne nutně z uvedené
 * budovy. Výjimka je „Palác Anděl", kde fotka přímo ukazuje nápis
 * „palác anděl" vyrytý do stěrky — tam je spárování ověřené.
 */

export type RealizaceSFotkami = Realizace & { fotky: Fotka[] }

const CAS = new Date('2026-07-16T12:00:00.000Z')

function fotka(realizaceId: string, poradi: number, url: string, popisek: string): Fotka {
  return { id: `${realizaceId}-foto-${poradi + 1}`, url, popisek, poradi, realizaceId }
}

export const UKAZKOVE_REALIZACE: RealizaceSFotkami[] = [
  {
    id: 'campus',
    slug: 'campus-science-park',
    nazev: 'Campus Science Park',
    lokalita: 'Brno',
    rok: 2016,
    kategorie: 'BETON',
    popis:
      '<p>Vstupní lobby budovy C — unikátní realizace výtvarného díla ve spolupráci se ' +
      'známým brněnským umělcem <strong>Pavlem Hayekem</strong>. Přenesli a vyhotovili jsme ' +
      'dva jeho obrazy ve zvětšeném měřítku 3×8 m na motiv černobílých přírodních elementů — ' +
      'vše v designových cementových stěrkách.</p>',
    vybrana: true,
    poradi: 0,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [
      fotka('campus', 0, '/realizace/campus-science-park-1.jpg', 'Designový pohledový beton'),
      fotka('campus', 1, '/realizace/campus-science-park-2.jpg', 'Designová cementová stěrka, schodiště'),
    ],
  },
  {
    id: 'andel',
    slug: 'palac-andel',
    nazev: 'Palác Anděl',
    lokalita: 'Praha 5',
    rok: 2018,
    kategorie: 'BETON',
    popis:
      '<p>Víceletá spolupráce v pěti etapách (2014–2018) — designové cementové stěrky se ' +
      'vzhledem pohledového betonu ve společných prostorách administrativní budovy, ' +
      'postupně přes 800 m² napříč etapami.</p>',
    vybrana: true,
    poradi: 1,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [
      fotka('andel', 0, '/realizace/palac-andel-1.jpg', 'Designová stěrka se vzhledem pohledového betonu'),
      fotka('andel', 1, '/realizace/palac-andel-2.jpg', 'Designová stěrka, detail'),
    ],
  },
  {
    id: 'orechovka',
    slug: 'maison-orechovka',
    nazev: 'Maison Ořechovka',
    lokalita: 'Praha 6',
    rok: 2021,
    kategorie: 'BETON',
    popis:
      '<p>Výjimečný rezidenční projekt, oceněný cenou za první místo Real Estate Awards 2021 ' +
      '(Best of Realty 2021). Designové cementové stěrky společných prostor — 257 m², ' +
      'malby 37 000 m².</p>',
    vybrana: false,
    poradi: 2,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [fotka('orechovka', 0, '/realizace/maison-orechovka-1.jpg', 'Designová cementová stěrka')],
  },
  {
    id: 'klementinum',
    slug: 'narodni-knihovna-klementinum',
    nazev: 'Národní knihovna ČR — Klementinum',
    lokalita: 'Praha 1',
    rok: 2017,
    kategorie: 'STUK',
    popis:
      '<p>Revitalizace areálu Klementina (etapa 2013–2017) — benátské štuky na ploše ' +
      '1 700 m² a designové cementové stěrky se vzhledem pohledového betonu.</p>',
    vybrana: true,
    poradi: 3,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [
      fotka('klementinum', 0, '/realizace/klementinum-1.jpg', 'Benátský štuk, kuchyňský kout'),
      fotka('klementinum', 1, '/realizace/klementinum-2.jpg', 'Benátský štuk, schodiště'),
    ],
  },
  {
    id: 'vitkov',
    slug: 'armadni-muzeum-vitkov',
    nazev: 'Armádní muzeum Žižkov — Vítkov',
    lokalita: 'Praha 3',
    rok: 2021,
    kategorie: 'STUK',
    popis:
      '<p>Vojenský historický ústav, etapa 2019–2021. Designové cementové a ' +
      'cementoepoxidové stěrky stěn (2 200 m²) i podlah (970 m²), benátské štuky na ' +
      '620 m² a malby na 25 000 m².</p>',
    vybrana: false,
    poradi: 4,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [fotka('vitkov', 0, '/realizace/vitkov-1.jpg', 'Designová stěrka, chodba')],
  },
  {
    id: 'hrad',
    slug: 'prazsky-hrad-vikarka',
    nazev: 'Pražský hrad — Vikárka',
    lokalita: 'Praha 1',
    rok: 2021,
    kategorie: 'MALBA',
    popis:
      '<p>Vápenné malby historických objektů v areálu Pražského hradu na ploše 9 000 m² — ' +
      'válečkování, ozdobné linkování a napodobení ozdobných tapet.</p>',
    vybrana: true,
    poradi: 5,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [
      fotka('hrad', 0, '/realizace/prazsky-hrad-1.jpg', 'Fládrování, imitace dřeva'),
      fotka('hrad', 1, '/realizace/prazsky-hrad-2.jpg', 'Malba štukové výzdoby'),
    ],
  },
  {
    id: 'afi',
    slug: 'afi-vokovice',
    nazev: 'AFI Vokovice',
    lokalita: 'Praha 6',
    rok: 2018,
    kategorie: 'KOVY',
    popis:
      '<p>Moderní administrativní komplex na Evropské — designová metalická stěrka s ' +
      'kovovým efektem ve vstupním lobby budov A a B, 600 m².</p>',
    vybrana: false,
    poradi: 6,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [
      fotka('afi', 0, '/realizace/afi-vokovice-1.jpg', 'Kovová omítka, detail'),
      fotka('afi', 1, '/realizace/afi-vokovice-2.jpg', 'Omítka s kovovým efektem'),
    ],
  },
  {
    id: 'mamaison',
    slug: 'hotel-mamaison-downtown',
    nazev: 'Hotel Mamaison Residence Downtown Prague',
    lokalita: 'Praha 2',
    rok: 2019,
    kategorie: 'KOVY',
    popis:
      '<p>Lobby hotelu — designová cementová stěrka s kovovým efektem Bronze na ploše ' +
      '160 m².</p>',
    vybrana: false,
    poradi: 7,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [
      fotka('mamaison', 0, '/realizace/mamaison-1.jpg', 'Kovová plastická stěrka'),
      fotka('mamaison', 1, '/realizace/mamaison-2.jpg', 'Patinovaná malba'),
    ],
  },
  {
    id: 'erv',
    slug: 'erv-pojistovna-karlin',
    nazev: 'ERV Evropská pojišťovna',
    lokalita: 'Praha 8',
    rok: 2015,
    kategorie: 'TAPETY',
    popis: '<p>Karlín — lepení designových tapet na ploše 285 m².</p>',
    vybrana: false,
    poradi: 8,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: [fotka('erv', 0, '/realizace/erv-1.jpg', 'Designová tapeta')],
  },
]

export const UKAZKOVE_CLANKY: Clanek[] = [
  {
    id: 'stuk',
    slug: 'proc-benatsky-stuk-neni-jen-omitka',
    nadpis: 'Proč benátský štuk není jen omítka',
    perex:
      'Sedm vrstev, každá tenčí než list papíru. Co se děje mezi nanesením a leštěním a proč to nejde uspěchat.',
    titulniFoto: null,
    datum: new Date('2026-05-14T09:00:00.000Z'),
    obsah: '',
    createdAt: CAS,
    updatedAt: CAS,
  },
  {
    id: 'beton',
    slug: 'designovy-beton-v-bytech',
    nadpis: 'Designový beton v bytech: kde dává smysl a kde ne',
    perex:
      'Stěrka na zdi v koupelně vydrží desítky let. Na podlaze v kuchyni je to jiný příběh.',
    titulniFoto: null,
    datum: new Date('2026-03-02T09:00:00.000Z'),
    obsah: '',
    createdAt: CAS,
    updatedAt: CAS,
  },
]

export const UKAZKOVE_TEXTY = {
  heroNadpis: 'Řemeslo, které se dělá rukama od roku 1992',
  heroPodnadpis: 'Malba · štuky · designový beton · tapetování — Praha a okolí',
  oNasNadpis: 'Třicet let na jednom řemesle',
  oNasText:
    'Sídlíme na Moravě, ale od roku 1992 je naším skutečným působištěm a zázemím Praha — ' +
    'tady realizujeme drtivou většinu zakázek, po dohodě ale kdekoli v ČR. Provádíme ' +
    'profesionálně veškeré malířské, lakýrnické, tapetářské a speciální dekorativní úpravy ' +
    'povrchů, pravidelně a s úspěchem se účastníme veřejných výběrových řízení a podílíme ' +
    'se na těch nejsmělejších a nejprestižnějších projektech současné bytové i komerční ' +
    'výstavby — od Pražského hradu po Národní knihovnu.',
  kontaktEmail: 'vmalby@vmalby.cz',
  kontaktTelefon: '+420 775 242 809',
  kontaktAdresa: 'Praha',
}

/** Fakturační údaje — vmalby.cz/kontakty.php. Zobrazují se jen na Kontakt. */
export const FIREMNI_UDAJE = {
  ic: '29316537',
  dic: 'CZ29316537',
  or: 'Zapsaná v obchodním rejstříku vedeném Krajským soudem v Brně, oddíl C, vložka 77099.',
  ucet: '107-4725800257/0100 (Komerční banka)',
}
