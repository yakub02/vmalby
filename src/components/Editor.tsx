'use client'

import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

export function Editor({ name, vychozi }: { name: string; vychozi: string }) {
  const [html, setHtml] = useState(vychozi)
  const [nahravaSe, setNahravaSe] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
      }),
      Image,
    ],
    content: vychozi,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  })

  async function nahrajFotku(soubor: File) {
    setNahravaSe(true)
    try {
      const fd = new FormData()
      fd.set('soubor', soubor)
      const odpoved = await fetch('/api/upload', { method: 'POST', body: fd })
      const vysledek = await odpoved.json()
      if (!odpoved.ok) throw new Error(vysledek.chyba ?? 'Nahrání se nezdařilo.')
      editor?.chain().focus().setImage({ src: vysledek.url }).run()
    } catch (chyba) {
      alert(chyba instanceof Error ? chyba.message : 'Nahrání se nezdařilo.')
    } finally {
      setNahravaSe(false)
    }
  }

  return (
    <div className="editor">
      <div className="editor__panel">
        <button
          type="button"
          className="editor__nastroj"
          aria-pressed={editor?.isActive('bold') ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Tučně
        </button>
        <label className="editor__nastroj">
          {nahravaSe ? 'Nahrávám…' : 'Vložit fotku'}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={nahravaSe}
            onChange={(e) => {
              const soubor = e.target.files?.[0]
              if (soubor) void nahrajFotku(soubor)
              e.target.value = ''
            }}
          />
        </label>
      </div>
      <EditorContent editor={editor} className="editor__plocha" />
      <input type="hidden" name={name} value={html} />
    </div>
  )
}
