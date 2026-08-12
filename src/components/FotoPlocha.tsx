/**
 * Zástupná plocha za fotku realizace. Textura vychází z vizuální nástěnky —
 * záměrně to není ikonka ani prázdný obdélník, aby bylo na první pohled jasné,
 * že sem přijde skutečná fotografie (doplní se ve fázi 7).
 */
export function FotoPlocha({
  stitek,
  pomer = '4 / 3',
}: {
  stitek?: string
  pomer?: string
}) {
  return (
    <div className="foto" style={{ aspectRatio: pomer }}>
      {stitek && <span className="foto__stitek">{stitek}</span>}
    </div>
  )
}
