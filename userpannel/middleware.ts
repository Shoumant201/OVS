import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Supported languages
export const locales = ["en", "ne"]
export const defaultLocale = "en"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const pathname = request.nextUrl.pathname

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get the preferred locale from cookie or default to 'en'
    const locale = request.cookies.get("NEXT_LOCALE")?.value || defaultLocale

    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url))
  }
}

// Matcher ignoring /_next/ and /api/
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
