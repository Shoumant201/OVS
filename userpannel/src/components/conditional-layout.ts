"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Locale } from "@/lib/dictionary"

interface ConditionalLayoutProps {
  children: React.ReactNode
  locale: Locale
  dictionary: any // You can replace 'any' with a more specific type if available
}

export default function ConditionalLayout({ children, locale, dictionary }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Define paths where navbar and footer should be hidden
  const hiddenPaths = [`/${locale}/login`, `/${locale}/register`, `/${locale}/onboarding`]

  // Check if current path is in the hidden paths list
  const shouldHideLayout = hiddenPaths.some((path) => pathname === path)

  if (shouldHideLayout) {
    // Return only the children without navbar and footer
    return <>{children}</>
  }

  // Return the full layout with navbar and footer
  return (
    <>
      <Navbar locale={locale} dictionary={dictionary} />
      {children}
      <Footer />
    </>
  )
}
