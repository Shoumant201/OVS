import { type Locale, getDictionary } from "@/lib/dictionary"
import ResultsPage from "@/components/results/results-page"

export default async function Results({
  params,
}: {
  params: { lang: Locale; id: string }
}) {
  // Fix: Await the params object before accessing its properties
  const lang = params?.lang || "en"
  const id = params?.id
  const dictionary = await getDictionary(lang)

  return <ResultsPage dictionary={dictionary} locale={lang} id={id} />
}
