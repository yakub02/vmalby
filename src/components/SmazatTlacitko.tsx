'use client'

export function SmazatTlacitko({
  id,
  popis,
  akce,
}: {
  id: string
  popis: string
  akce: (id: string) => Promise<void>
}) {
  return (
    <form
      action={async () => {
        await akce(id)
      }}
      onSubmit={(e) => {
        if (!confirm(`Opravdu smazat „${popis}"? Tuto akci nelze vrátit.`)) {
          e.preventDefault()
        }
      }}
    >
      <button type="submit" className="editor__nastroj">
        Smazat
      </button>
    </form>
  )
}
