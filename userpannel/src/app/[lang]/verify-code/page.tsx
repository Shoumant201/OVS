// Example: app/[lang]/verify-code/page.tsx

import { type Locale, getDictionary } from "@/lib/dictionary";
import VerifyCodePageClient from "@/components/verify(code)/verifycode"; // Adjust path as needed

export default async function VerifyCode({
  params,
}: {
  params: { lang: Locale };
}) {
  const lang = params?.lang || "en";
  const dictionary = await getDictionary(lang);

  return <VerifyCodePageClient dictionary={dictionary} locale={lang} />;
}