import { Paticka } from '@/components/Paticka'

/**
 * Chrome veřejného webu. Navigaci si vykresluje každá stránka sama — na úvodu
 * plave přes fotografii, na vnitřních stránkách stojí v toku.
 */
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Paticka />
    </>
  )
}
