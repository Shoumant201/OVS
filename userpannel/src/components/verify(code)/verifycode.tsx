"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Use regular useRouter
import { ArrowLeft, Loader2 } from "lucide-react"
import { verifyOTP, resendOTP } from "@/services/api/Authentication" // Assuming these functions are correctly defined
// import { useLocalizedNavigation } from "@/lib/use-localized-navigation" // Not needed if passing locale and using router directly
// import { useLanguage } from "@/lib/language-provider" // Not needed if passing locale
import { LocalizedLink } from "@/components/LocalizedLink" // Can be used for static links
import { type Locale } from '@/lib/dictionary'

// Props for the page component
interface VerifyCodePageProps {
  dictionary: any;
  locale: Locale;
}

export default function VerifyCodePage({ dictionary, locale }: VerifyCodePageProps) {
  const [code, setCode] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Translations
  const t = dictionary?.['verify-code'] || {}

  // Effect to check for tempToken and redirect if not found
  useEffect(() => {
    const tempToken = localStorage.getItem("tempToken")
    if (!tempToken) {
      // Redirect to localized login page
      router.replace(`/${locale}/login`)
    }
  }, [router, locale])

  const handleSubmit = async (e: React.FormEvent) => { // Added event type
    e.preventDefault(); // Prevent default form submission
    if (!code) {
      setError(t.errorEmptyCode || "Please enter the verification code")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const tempToken = localStorage.getItem("tempToken"); // Get tempToken for verification
      if (!tempToken) {
        setError(t.errorUnexpected || "Session expired. Please login again."); // Or a more specific error
        router.replace(`/${locale}/login`);
        setIsSubmitting(false);
        return;
      }
      // Assuming verifyOTP needs the tempToken, adjust if it's handled internally by verifyOTP
      const result = await verifyOTP(code, tempToken); 

      if (result.success && result.token) { // Assuming verifyOTP returns the final token
        localStorage.removeItem("tempToken"); // Clear temp token
        localStorage.setItem("token", result.token); // Store final token (or Cookies.set)
        router.push(`/${locale}/`) // Navigate to localized home/dashboard
      } else {
        setError(result.error || t.errorInvalidCode || "Invalid verification code")
      }
    } catch (err) { // Changed error to err to avoid conflict with state variable
      console.error("Verification error:", err)
      setError(t.errorUnexpected || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")

    try {
      const tempToken = localStorage.getItem("tempToken");
      if (!tempToken) {
          setError(t.errorUnexpected || "Session expired. Please login again.");
          router.replace(`/${locale}/login`);
          setIsResending(false);
          return;
      }
      // Assuming resendOTP needs the tempToken from localStorage
      const result = await resendOTP(tempToken);

      if (!result.success) {
        setError(result.error || t.errorResendFailed || "Failed to resend code")
      }
      // Optionally show a success message for resend
    } catch (err) {
      console.error("Resend error:", err)
      setError(t.errorUnexpected || "An unexpected error occurred")
    } finally {
      // Keep the button disabled for a bit longer to prevent spamming
      setTimeout(() => setIsResending(false), 5000) 
    }
  }

  // Fallback if dictionary is not loaded
  if (Object.keys(t).length === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-100 dark:bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-[#26C6B0] mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      );
  }

  const commonInputClass = "w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E27B8] dark:focus:ring-purple-400";
  const primaryButtonClass = "flex-1 bg-[#5E27B8] text-white py-3 rounded-md hover:bg-[#4A1F92] transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed";
  const secondaryButtonClass = "flex-1 bg-gray-400 dark:bg-gray-600 text-white py-3 rounded-md hover:bg-gray-500 dark:hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed";


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-2 text-gray-800 dark:text-gray-100">{t.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">{t.instruction}</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400 px-4 py-3 rounded mb-6 text-sm" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}> {/* Added form element */}
            <Label htmlFor="verificationCode" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            {t.labelCode}
            </Label>
            <Input
            id="verificationCode"
            type="text"
            value={code}
            title="OTP" // Consider translating this if it's user-visible, or remove if not
            onChange={(e) => setCode(e.target.value)}
            className={commonInputClass}
            maxLength={6} // Common OTP length
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            />

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
                type="submit" // Changed to submit for form
                disabled={isSubmitting || !code}
                className={primaryButtonClass}
            >
                {isSubmitting ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block"/> {t.buttonVerifying} </>
                ) : ( t.buttonSubmit )}
            </button>
            <button
                type="button" // Keep as button
                onClick={handleResend}
                disabled={isResending}
                className={secondaryButtonClass}
            >
                {isResending ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block"/> {t.buttonResending} </>
                ) : ( t.buttonResend )}
            </button>
            </div>
        </form>


        <div className="flex justify-between items-center mt-6 text-xs text-gray-600 dark:text-gray-400">
          <p>{t.havingTrouble}</p>
          {/* Assuming you have a help page or contact link */}
          <LocalizedLink href="/help" className="text-[#5E27B8] dark:text-purple-400 hover:underline">
            {t.getHelp}
          </LocalizedLink>
        </div>

        <LocalizedLink
          href="/login"
          className="mt-8 flex items-center justify-center text-sm text-[#5E27B8] dark:text-purple-400 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          {t.backToLogin}
        </LocalizedLink>
      </div>
    </div>
  )
}