import sanitizeHtml from 'sanitize-html'

export function sanitizujObsah(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'strong', 'em', 'br', 'img'],
    allowedAttributes: { img: ['src', 'alt'] },
    allowedSchemes: ['http', 'https'],
    allowedSchemesByTag: { img: ['http', 'https'] },
  })
}
