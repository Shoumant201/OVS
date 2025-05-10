// Example: app/[lang]/verify-email/[token]/page.tsx 
// The [token] part in the folder name captures the token from the URL.

import { type Locale, getDictionary } from "@/lib/dictionary";
import VerifyPageClient from "@/components/verify(token)/verifytoken"; // Adjust path as needed

export default async function VerifyEmail({
  params,
}: {
  params: { lang: Locale; token: string }; // token is part of params from the route
}) {
  const lang = params?.lang || "en";
  const dictionary = await getDictionary(lang);

  // The client component will use `useParams` to get the token
  return <VerifyPageClient dictionary={dictionary} locale={lang} />;
}