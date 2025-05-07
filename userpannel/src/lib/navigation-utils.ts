/**
 * Utility functions for handling navigation with language support
 */

// Get the current locale with fallbacks
export function getCurrentLocale(): string {
    // Try to get from sessionStorage first
    if (typeof window !== "undefined") {
      const storedLocale = sessionStorage.getItem("currentLocale")
      if (storedLocale) return storedLocale
    }
  
    // Try to extract from URL
    if (typeof window !== "undefined") {
      const path = window.location.pathname
      const match = path.match(/^\/(en|ne)\//)
      if (match && match[1]) return match[1]
    }
  
    // Default fallback
    return "en"
  }
  
  // Navigate to a route with proper locale
  export function navigateWithLocale(router: any, path: string, locale?: string): void {
    const currentLocale = locale || getCurrentLocale()
  
    // Ensure path doesn't already have locale
    const cleanPath = path.replace(/^\/(en|ne)\//, "/")
  
    // Construct full path with locale
    const fullPath = `/${currentLocale}${cleanPath}`
  
    // Log for debugging
    console.log(`Navigating to: ${fullPath} (locale: ${currentLocale})`)
  
    // Perform navigation
    router.push(fullPath)
  }
  