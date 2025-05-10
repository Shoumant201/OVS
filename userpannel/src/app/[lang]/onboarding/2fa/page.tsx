import { type Locale, getDictionary } from "@/lib/dictionary";
import TwoFAPageClient from "@/components/2fa/2fa"; // Adjust path as needed

export default async function Setup2FA({
  params,
}: {
  params: { lang: Locale };
}) {
  const lang = params?.lang || "en";
  const dictionary = await getDictionary(lang);

  return <TwoFAPageClient dictionary={dictionary} locale={lang} />;
}