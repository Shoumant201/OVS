import { type Locale, getDictionary } from "@/lib/dictionary"
import ElectionDetailPage from "@/components/election-detail-page"

export default async function ElectionDetail({
  params,
}: {
  params: { lang: Locale; id: string }
}) {
  // Fix: Await the params object before accessing its properties
  const lang = params?.lang || "en"
  const id = params?.id
  const dictionary = await getDictionary(lang)

  // Store the current locale in a global variable for client components
  if (typeof window !== "undefined") {
    window.__NEXT_LOCALE = lang
  }

  return <ElectionDetailPage dictionary={dictionary} locale={lang} />
}
