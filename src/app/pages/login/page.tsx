"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AxiosInstance from "@/services/axiosInstance"
import { Endpoints } from "@/services/Endpoints"
import Cookies from "js-cookie"
import { Key, User } from "lucide-react"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const token = Cookies.get("adminToken") || localStorage.getItem("adminToken")
    if (token) {
      // If token exists, redirect to dashboard
      router.replace("/")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Login URL:", Endpoints.ADMIN.adminLogin)
      console.log("Login payload:", { email, password })

      const response = await AxiosInstance.post(Endpoints.ADMIN.adminLogin, {
        email,
        password,
      })

      console.log("Login response:", response.data)

      // Store the token in both cookies and localStorage for consistency
      // The backend returns adminToken, not token
      const token = response.data.adminToken

      if (!token) {
        throw new Error("No token received from server")
      }

      // Store in cookies for cross-tab persistence
      Cookies.set("adminToken", token, { expires: 30 })

      // Also store in localStorage for the axios interceptor
      localStorage.setItem("adminToken", token)

      // Add a small delay before redirecting to ensure token is saved
      setTimeout(() => {
        // Redirect to Dashboard - use the correct path
        router.replace("/")
      }, 100)
    } catch (error: any) {
      console.error("Login error:", error)

      // Detailed error logging
      if (error.response) {
        console.error("Error status:", error.response.status)
        console.error("Error data:", error.response.data)

        // Set a user-friendly error message based on the status code and message
        if (error.response.status === 404) {
          if (error.response.data?.message === "admin not found") {
            setError("No admin account found with this email. Please check your email or contact support.")
          } else {
            setError("Login service not available. Please try again later.")
          }
        } else if (error.response.status === 401) {
          setError("Invalid email or password. Please try again.")
        } else {
          setError(error.response.data?.message || "Login failed. Please check your credentials.")
        }
      } else {
        setError("Network error. Please check your connection and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex w-screen h-screen justify-center items-center bg-[url('/adminLoginBG.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.71)]"></div>
      <div className="w-full max-w-md p-6 pb-16 rounded-lg bg-slate-900 shadow-xl relative overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="text-white text-4xl font-bold">OVS</div>
            <div className="absolute -top-1 -right-3 flex">
              <div className="w-2 h-2 bg-red-500"></div>
              <div className="w-2 h-2 bg-blue-500"></div>
              <div className="w-2 h-2 bg-yellow-500"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-white text-xl font-bold uppercase tracking-wider">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Control panel login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="relative z-10">
          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2 pl-10 pr-3 bg-slate-800 border-b border-slate-700 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Key className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 pl-10 pr-3 bg-slate-800 border-b border-slate-700 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 text-sm mt-2 bg-red-500/10 p-2 rounded">{error}</div>}

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-medium rounded-full hover:from-yellow-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-all disabled:opacity-70"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </form>

        {/* Wave Background */}
        <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden z-0">
          <div className="absolute bottom-0 left-0 right-0 h-40">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0 C150,90 350,0 500,50 C650,100 700,10 850,80 C1000,150 1100,20 1200,80 L1200,120 L0,120 Z"
                className="fill-blue-500/80"
              ></path>
              <path
                d="M0,40 C150,130 350,40 500,90 C650,140 700,50 850,120 L0,120 Z"
                className="fill-blue-600/70"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

