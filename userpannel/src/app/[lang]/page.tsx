import Link from "next/link"
import { type Locale, getDictionary } from "@/lib/dictionary"
import HomePage from "./home/page"

export default async function Home({
  params,
}: {
  params: { lang: Locale }
}) {
  // Fix: Await the params object before accessing its properties
  const lang = params?.lang || "en"
  const dictionary = await getDictionary(lang)

  return <HomePage dictionary={dictionary} locale={lang} />
}

