import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Skip if the pathname already has a locale
  if (pathname.match(/^\/(en|ne)(\/|$)/)) {
    return NextResponse.next()
  }

  // Check if we're navigating to a page that should have a locale
  if (
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/api") &&
    !pathname.includes(".") // Skip files like favicon.ico
  ) {
    // Get locale from cookie or default to 'en'
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "en"

    // Rewrite the URL to include the locale
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|_vercel|.*\\..*).*)",
  ],
}
