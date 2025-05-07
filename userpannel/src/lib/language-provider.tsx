"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"
import type { Locale } from "@/lib/dictionary"

type LanguageContextType = {
  locale: Locale
  changeLanguage: (newLocale: Locale) => void
  isChangingLanguage: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const [locale, setLocale] = useState<Locale>(initialLocale as Locale)
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)

  // Initialize from cookie or sessionStorage on mount
  useEffect(() => {
    const savedLocale = Cookies.get("NEXT_LOCALE") || sessionStorage.getItem("currentLocale")
    if (savedLocale && (savedLocale === "en" || savedLocale === "ne")) {
      setLocale(savedLocale as Locale)
    }
  }, [])

  // Store locale in sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("currentLocale", locale)
  }, [locale])

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return

    setIsChangingLanguage(true)

    // Store the language preference in a cookie
    Cookies.set("NEXT_LOCALE", newLocale, { expires: 365 })

    // Update state
    setLocale(newLocale)

    // Get the path without the language prefix
    const pathWithoutLang = pathname.replace(/^\/(en|ne)/, "") || "/"
    const newPath = `/${newLocale}${pathWithoutLang}`

    // Navigate to the new path
    router.push(newPath)

    // Reset loading state after navigation
    setTimeout(() => {
      setIsChangingLanguage(false)
    }, 500)
  }

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, isChangingLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
