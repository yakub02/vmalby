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
  // Přípona se ořízne jen z posledního segmentu cesty — jinak by ".." v cestě
  // typu "../../etc/passwd" spolklo regexem na příponu skoro celý řetězec.
  const posledniLomeno = puvodni.lastIndexOf('/')
  const adresar = posledniLomeno >= 0 ? puvodni.slice(0, posledniLomeno + 1) : ''
  const soubor = posledniLomeno >= 0 ? puvodni.slice(posledniLomeno + 1) : puvodni
  const bezPripony = adresar + soubor.replace(/\.[^.]*$/, '')
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
