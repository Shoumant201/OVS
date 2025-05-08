import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google"
import { getDictionary, Locale as LocaleType } from "@/lib/dictionary";
// import LayoutWrapper from "@/components/layout-wrapper"; // NEW COMPONENT
import { ThemeProvider } from "../../../theme-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/lib/language-provider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Online Voting System",
  description: "A secure online voting platform",
}

// Define the supported languages
export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ne" }]
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: LocaleType }
}) {
  // Fix: Await the params object before accessing its properties
  const lang = params?.lang || "en"
  const dictionary = await getDictionary(lang)

  return (
    <html lang={lang}>
      <body className="antialiased">
        <LanguageProvider initialLocale={lang}>
          <ThemeProvider>
            <Navbar locale={lang} dictionary={dictionary} />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}