import type { Kategorie } from '@prisma/client'

export const NAZVY_KATEGORII: Record<Kategorie, string> = {
  MALBA: 'Malba a lakování',
  STUK: 'Benátský štuk',
  BETON: 'Designový beton',
  KOVY: 'Imitace kovů',
  TAPETY: 'Tapetování',
}

export const KATEGORIE_PORADI: Kategorie[] = ['MALBA', 'STUK', 'BETON', 'KOVY', 'TAPETY']
