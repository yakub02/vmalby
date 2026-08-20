'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Obalí obsah, který se má při scrollu jemně objevit (fade + posun nahoru).
 * Bez JS/s vypnutým IntersectionObserverem zůstává obsah ve výchozím
 * viditelném stavu z `.odhaleni` — třída `--viditelna` jen odkryje dřív
 * schovaný stav, nikdy naopak.
 */
export function Odhaleni({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [viditelna, setViditelna] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setViditelna(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`odhaleni${viditelna ? ' odhaleni--viditelna' : ''}`}>
      {children}
    </div>
  )
}
