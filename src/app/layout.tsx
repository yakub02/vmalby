import type { Metadata } from 'next'
import { Archivo, Bricolage_Grotesque } from 'next/font/google'
import './tokens.css'
import './globals.css'
import './stranky.css'

/* Bricolage Grotesque pro nadpisy — variabilní bold grotesque s opticky
   odstupňovanou kresbou (opsz), takže drží ostrost i ve velkých display
   řezech. Archivo pro text a mikrotypografii. Obojí včetně latin-ext
   kvůli české diakritice. */
const displaySans = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display',
})

const textSans = Archivo({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'V Malby — malířské a řemeslné práce od 1992',
  description: 'Malba, štuky, designový beton a dekorativní povrchy. Praha a okolí.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={`${displaySans.variable} ${textSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
