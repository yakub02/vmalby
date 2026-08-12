import type { Clanek, Fotka, Realizace } from '@prisma/client'

/**
 * Dočasný obsah, dokud neběží databáze. Typy jsou schválně odvozené přímo
 * z Prisma modelů, takže až bude migrace hotová, stačí ve stránkách vyměnit
 * import za fetchery z `@/lib/content/*` — tvar dat sedí.
 */

export type RealizaceSFotkami = Realizace & { fotky: Fotka[] }

const CAS = new Date('2026-07-16T12:00:00.000Z')

function fotky(realizaceId: string, pocet: number): Fotka[] {
  return Array.from({ length: pocet }, (_, i) => ({
    id: `${realizaceId}-foto-${i + 1}`,
    url: '',
    popisek: '',
    poradi: i,
    realizaceId,
  }))
}

export const UKAZKOVE_REALIZACE: RealizaceSFotkami[] = [
  {
    id: 'campus',
    slug: 'campus-science-park',
    nazev: 'Campus Science Park',
    lokalita: 'Praha',
    rok: 2023,
    kategorie: 'BETON',
    popis:
      '<p>Umělecká stěna 3×8 m ve spolupráci s výtvarníkem <strong>Pavlem Hayekem</strong>. ' +
      'Motiv vznikal přímo na místě, vrstvením probarvených cementových stěrek — ' +
      'každá vrstva se musela nechat vyzrát, než přišla další.</p>' +
      '<p>Realizace byla součástí projektu oceněného v soutěži Best of Realty.</p>',
    vybrana: true,
    poradi: 0,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: fotky('campus', 3),
  },
  {
    id: 'vinohrady',
    slug: 'rezidence-vinohrady',
    nazev: 'Rezidence Vinohrady',
    lokalita: 'Praha 2',
    rok: 2024,
    kategorie: 'STUK',
    popis:
      '<p>Benátský štuk ve společných prostorách činžovního domu z roku 1908. ' +
      'Odstín jsme míchali podle dochovaného fragmentu původní omítky ve světlíku.</p>',
    vybrana: true,
    poradi: 1,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: fotky('vinohrady', 2),
  },
  {
    id: 'karlin',
    slug: 'showroom-karlin',
    nazev: 'Showroom Karlín',
    lokalita: 'Praha 8',
    rok: 2022,
    kategorie: 'KOVY',
    popis:
      '<p>Imitace patinované mosazi na čelní stěně showroomu. ' +
      'Povrch se dodělával ručně tak, aby patina reagovala na bodové osvětlení a měnila se podle úhlu pohledu.</p>',
    vybrana: true,
    poradi: 2,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: fotky('karlin', 4),
  },
  {
    id: 'smichov',
    slug: 'byt-na-smichove',
    nazev: 'Byt na Smíchově',
    lokalita: 'Praha 5',
    rok: 2025,
    kategorie: 'MALBA',
    popis: '<p>Kompletní malba a lakování truhlářských prvků po rekonstrukci bytu 4+kk.</p>',
    vybrana: false,
    poradi: 3,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: fotky('smichov', 2),
  },
  {
    id: 'hotel',
    slug: 'hotelovy-apartman-stare-mesto',
    nazev: 'Hotelový apartmán, Staré Město',
    lokalita: 'Praha 1',
    rok: 2024,
    kategorie: 'TAPETY',
    popis: '<p>Ruční tapetování textilní tapetou v apartmánu s klenutými stropy.</p>',
    vybrana: false,
    poradi: 4,
    createdAt: CAS,
    updatedAt: CAS,
    fotky: fotky('hotel', 2),
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
    'Od roku 1992 se věnujeme malířským a natěračským pracím, tapetování a dekorativním ' +
    'povrchovým úpravám — od benátského štuku po designové betonové stěrky. Pracujeme pro ' +
    'developery, architekty i soukromé investory, kterým nejde o nejlevnější nabídku, ' +
    'ale o povrch, který za pět let nebude vypadat jako chyba.',
  kontaktEmail: 'info@vmalby.cz',
  kontaktTelefon: '+420 000 000 000',
  kontaktAdresa: 'Praha',
}
