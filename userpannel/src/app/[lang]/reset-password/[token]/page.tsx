// Example: app/[lang]/reset-password/[token]/page.tsx
// Note: The folder structure [token] captures the token from the URL.

import { type Locale, getDictionary } from "@/lib/dictionary";
import ResetPasswordPageClient from "@/components/Reset-password/resetpassword"; // Adjust path

export default async function ResetPassword({
  params,
}: {
  params: { lang: Locale; token: string }; // token is also part of params here
}) {
  const lang = params?.lang || "en";
  // The token is already available in params.clientToken, no need to extract it again here for the client component
  // The client component will get it from its own useParams()
  const dictionary = await getDictionary(lang);

  return <ResetPasswordPageClient dictionary={dictionary} locale={lang} />;
}