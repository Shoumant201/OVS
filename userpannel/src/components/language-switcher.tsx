"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/language-provider"

export function LanguageSwitcher() {
  const { locale, changeLanguage, isChangingLanguage } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [isNepali, setIsNepali] = useState(locale === "ne")

  const switchLanguage = () => {
    const newLang = isNepali ? "en" : "ne"
    setIsNepali(!isNepali)

    startTransition(() => {
      changeLanguage(newLang)
    })
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-toggle" className={isNepali ? "text-gray-500 dark:text-gray-400" : "font-medium"}>
        English
      </Label>
      <Switch
        id="language-toggle"
        checked={isNepali}
        onCheckedChange={switchLanguage}
        disabled={isPending || isChangingLanguage}
        aria-label="Toggle language"
      />
      <Label htmlFor="language-toggle" className={isNepali ? "font-medium" : "text-gray-500 dark:text-gray-400"}>
        नेपाली
      </Label>
      {(isPending || isChangingLanguage) && (
        <div className="ml-2 animate-spin h-4 w-4 border-2 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent"></div>
      )}
    </div>
  )
}
