import type { Metadata } from 'next'
import './tokens.css'
import './globals.css'
import './stranky.css'

export const metadata: Metadata = {
  title: 'V Malby — malířské a řemeslné práce od 1992',
  description: 'Malba, štuky, designový beton a dekorativní povrchy. Praha a okolí.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
