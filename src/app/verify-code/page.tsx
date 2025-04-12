"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { verifyOTP, resendOTP } from "@/services/api/Authentication"

export default function VerifyCodePage() {
  const [code, setCode] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if temp token exists
    const tempToken = localStorage.getItem("tempToken")
    if (!tempToken) {
      router.replace("/login")
    }
  }, [router])

  const handleSubmit = async () => {
    if (!code) {
      setError("Please enter the verification code")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const result = await verifyOTP(code)

      if (result.success) {
        // Redirect to dashboard
        router.replace("/")
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")

    try {
      const result = await resendOTP()

      if (!result.success) {
        setError(result.error || "Failed to resend code")
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError("An unexpected error occurred")
    } finally {
      setTimeout(() => setIsResending(false), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-gray-200 shadow-md rounded-lg p-8 max-w-md w-full border border-gray-400">
        <h2 className="text-lg md:text-xl font-semibold text-center mb-4">Confirm Your Identity for Voting Access</h2>

        <p className="text-sm text-gray-700 mb-2 text-center">Enter the code sent to your device:</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
        )}

        <label className="block text-sm font-medium text-gray-800 mb-1 mt-4">Verification Code:</label>
        <input
          type="text"
          value={code}
          title="OTP"
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition font-semibold disabled:opacity-70"
          >
            {isSubmitting ? "Verifying..." : "Submit"}
          </button>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="flex-1 bg-gray-400 text-white py-2 rounded-md disabled:opacity-50"
          >
            {isResending ? "Resending..." : "Resend Code"}
          </button>
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-600">
          <p>Having trouble?</p>
          <a href="#" className="text-purple-600 hover:underline">
            Get Help
          </a>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 flex items-center text-sm text-purple-500 hover:underline mx-auto"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </button>
      </div>
    </div>
  )
}
