import { nactiSiteTexts } from '@/lib/content/siteTexts'
import { TextyForm } from '@/components/TextyForm'

export default async function SpravaTextyPage() {
  const texty = await nactiSiteTexts()

  return (
    <>
      <h1>Texty stránek</h1>
      <TextyForm vychozi={texty} />
    </>
  )
}
