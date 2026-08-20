import Image from 'next/image'

/**
 * Fotografie realizace, nebo zástupná plocha, dokud fotka není nahraná.
 * Rodič určuje poměr stran (aspect-ratio na .polozka__media / .galerie__snimek).
 */
export function FotoPlocha({
  src,
  alt,
  stitek,
}: {
  src?: string
  alt?: string
  stitek?: string
}) {
  return (
    <div className="foto">
      {src && (
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          sizes="(max-width: 52rem) 100vw, 66vw"
          className="foto__obrazek"
        />
      )}
      {stitek && <span className="foto__stitek">{stitek}</span>}
    </div>
  )
}
