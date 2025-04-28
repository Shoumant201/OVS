'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from "@/components/ui/switch"


interface LanguageSwitcherProps {
  locale: string
  dictionary: {
    common: {
      language: string
      english: string
      nepali: string
    }
  }
}

export function LanguageSwitcher({ locale, dictionary }: LanguageSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname() ?? ''
  
    const toggleLanguage = useCallback(() => {
      const newLocale = locale === 'en' ? 'ne' : 'en'
      const pathWithoutLocale = pathname.replace(`/${locale}`, '')
      router.push(`/${newLocale}${pathWithoutLocale}`)
    }, [locale, pathname, router])
  
    const isNepali = locale === 'ne'
  
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="flex items-center gap-1">
          <img alt='ENG Flag' src="/flags/en.png" className="w-5 h-5 mr-1" /> {dictionary.common.english}
          </span>
          <Switch checked={isNepali} onCheckedChange={toggleLanguage} />
          <span className="flex items-center gap-1">
          <img alt="NP Flag" src="/flags/ne.png" className="w-5 h-5 mr-1" /> {dictionary.common.nepali}
          </span>
        </div>
      </div>
    )
  }