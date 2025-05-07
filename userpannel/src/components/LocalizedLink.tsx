"use client"

import type React from "react"

import Link from "next/link"
import { useLanguage } from "@/lib/language-provider"

interface LocalizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  [key: string]: any // Allow any other props
}

export function LocalizedLink({ href, children, ...props }: LocalizedLinkProps) {
  const { locale } = useLanguage()

  // Ensure href doesn't already have locale
  const cleanHref = href.replace(/^\/(en|ne)\//, "/")

  // Construct full path with locale
  const fullPath = `/${locale}${cleanHref}`

  return (
    <Link href={fullPath} {...props}>
      {children}
    </Link>
  )
}
