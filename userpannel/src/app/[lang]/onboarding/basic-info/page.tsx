// Example: app/[lang]/onboarding/basic-info/page.tsx

import { type Locale, getDictionary } from "@/lib/dictionary";
import BasicInfoPageClient from "@/components/basicinfo/basicinfo"; // Adjust path as needed

export default async function OnboardingBasicInfo({
  params,
}: {
  params: { lang: Locale };
}) {
  const lang = params?.lang || "en";
  const dictionary = await getDictionary(lang);

  return <BasicInfoPageClient dictionary={dictionary} locale={lang} />;
}