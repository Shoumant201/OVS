// Example: app/[lang]/settings/page.tsx

import { type Locale, getDictionary } from "@/lib/dictionary";
import SettingsPageClient from "@/components/setting/settingpage"; // Adjust path as needed

export default async function AccountSettingsPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const lang = params?.lang || "en";
  const dictionary = await getDictionary(lang);

  return <SettingsPageClient dictionary={dictionary} locale={lang} />;
}