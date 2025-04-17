import Link from "next/link"
import { type Locale, getDictionary } from "@/lib/dictionary"
import HomePage from "./home/page"

export default async function Home({
  params: {lang},
}: {
  params: {lang: Locale}
}) {

  const dictionary = await getDictionary(lang)

  return (

      <HomePage dictionary={dictionary} locale={lang} />
    
  )
}

