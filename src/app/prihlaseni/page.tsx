import { Suspense } from 'react'
import { PrihlaseniForm } from '@/components/PrihlaseniForm'
import './prihlaseni.css'

export const metadata = {
  title: 'Přihlášení — správa obsahu',
  robots: 'noindex',
}

export default function PrihlaseniPage() {
  return (
    <main className="prihlaseni">
      <Suspense fallback={null}>
        <PrihlaseniForm />
      </Suspense>
    </main>
  )
}
