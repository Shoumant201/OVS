
// Example: app/[lang]/forgot-password/page.tsx

import { type Locale, getDictionary } from "@/lib/dictionary";
import ForgotPasswordPageClient from "@/components/forgot-password/forgotpassword"; // Adjust path as needed

export default async function ForgotPassword({
  params,
}: {
  params: { lang: Locale };
}) {
  const lang = params?.lang || "en"; // Default to English if lang is not present
  const dictionary = await getDictionary(lang);

  // Store the current locale in a global variable for client components (if needed, similar to your page.tsx)
  // This is less common now with props, but if you have legacy code relying on it:
  // if (typeof window !== "undefined") {
  //   window.__NEXT_LOCALE = lang;
  // }

  return <ForgotPasswordPageClient dictionary={dictionary} locale={lang} />;
}
