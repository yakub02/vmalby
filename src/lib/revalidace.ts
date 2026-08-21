export function cestyProRealizaci(slug: string): string[] {
  return ['/', '/realizace', `/realizace/${slug}`]
}

export function cestyProClanek(slug: string): string[] {
  return ['/', '/aktuality', `/aktuality/${slug}`]
}

export function cestyProSiteTexts(): string[] {
  return ['/', '/atelier', '/sluzby', '/kontakt']
}
