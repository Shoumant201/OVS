"use client"

import { useRouter } from "next/navigation"
import { useLanguage } from "./language-provider"

export function useLocalizedNavigation() {
  const router = useRouter()
  const { locale } = useLanguage()

  const navigate = (path: string) => {
    // Ensure path doesn't already have locale
    const cleanPath = path.replace(/^\/(en|ne)\//, "/")

    // Construct full path with locale
    const fullPath = `/${locale}${cleanPath}`

    // Perform navigation
    router.push(fullPath)
  }

  return { navigate }
}
