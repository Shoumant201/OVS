import type { Metadata } from "next";
import "./globals.css";
import { getDictionary, type Locale } from "@/lib/dictionary";
import { locales } from "../../../middleware";
import LayoutWrapper from "@/components/layout-wrapper"; // NEW COMPONENT

export const metadata: Metadata = {
  title: "Online Voting System",
  description: "Online voting system created by group C for collabration project",
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params: { lang },
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang}>
      <body className="antialiased">
        <LayoutWrapper lang={lang} dictionary={dictionary}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
