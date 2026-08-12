import { Navigace } from '@/components/Navigace'
import { Paticka } from '@/components/Paticka'

/**
 * Chrome veřejného webu. Administrace ani přihlášení sem nespadají — mají
 * vlastní větev, aby se do nich netahala navigace pro návštěvníky.
 */
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigace />
      {children}
      <Paticka />
    </>
  )
}
