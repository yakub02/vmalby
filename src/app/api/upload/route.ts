import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifySession } from '@/lib/session'
import { ulozFotku } from '@/lib/uploads'

export async function POST(request: Request) {
  const secret = process.env.SESSION_SECRET
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value

  if (!secret || !verifySession(cookie, secret)) {
    return NextResponse.json({ chyba: 'Nepřihlášeno.' }, { status: 401 })
  }

  const formData = await request.formData()
  const soubor = formData.get('soubor')

  if (!(soubor instanceof File) || soubor.size === 0) {
    return NextResponse.json({ chyba: 'Chybí soubor.' }, { status: 400 })
  }

  if (!soubor.type.startsWith('image/')) {
    return NextResponse.json({ chyba: 'Nahrát lze jen obrázek.' }, { status: 400 })
  }

  try {
    const url = await ulozFotku(soubor)
    return NextResponse.json({ url })
  } catch (chyba) {
    const zprava = chyba instanceof Error ? chyba.message : 'Nahrání se nezdařilo.'
    return NextResponse.json({ chyba: zprava }, { status: 400 })
  }
}
