"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Axios from "@/services/axiosInstance"
import Cookies from "js-cookie"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import ENDPOINTS from "@/services/Endpoints"
import { type Locale } from '@/lib/dictionary'
import { useLocalizedNavigation } from "@/lib/use-localized-navigation"
import { useLanguage } from "@/lib/language-provider"
import { LocalizedLink } from "@/components/LocalizedLink"

const LoginPage = ({
  dictionary,
  locale,
}: {
  dictionary: any
  locale: Locale
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  // Debug logging on component mount
  useEffect(() => {
    // Log the endpoints to verify they're correct
    console.log("Auth endpoints:", ENDPOINTS.AUTH)
  }, [])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleView = () => {
    setIsLogin(!isLogin)
    console.log("TOGGLE VIEW CALLED!", new Date().toISOString())
  }

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login form submitted")
    setError("")
    setLoading(true)

    try {
      // Log the exact URL and payload being sent
      console.log("Login URL:", ENDPOINTS.AUTH.LOGIN)
      console.log("Login payload:", { email: loginEmail, password: loginPassword })

      // Try with the correct endpoint structure
      const response = await Axios.post(ENDPOINTS.AUTH.LOGIN, {
        email: loginEmail,
        password: loginPassword,
      })

      console.log("Login response:", response.data)

      if (response.data.require2FA) {
        // Store temporary token and redirect to OTP verification page
        localStorage.setItem("tempToken", response.data.tempToken)
        router.push(`/${locale}/verify-code`)
      } else {
        // Store token and redirect to dashboard
        Cookies.set("token", response.data.token, { expires: 30 })
        router.push(`/${locale}`)
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Try to get detailed error information
      if (error.response) {
        console.error("Error status:", error.response.status)
        console.error("Error data:", error.response.data)
      }

      setError(error.response?.data?.message || "Login failed. Please check your credentials.")

      // If the endpoint is not found (404), log a helpful message
      if (error.response?.status === 404) {
        console.error("The login endpoint was not found. Please check your API configuration.")
      }
    } finally {
      setLoading(false)
    }
  }

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register form submitted")
    setError("")
    setLoading(true)

    try {
      // Log the exact URL and payload being sent
      console.log("Register URL:", ENDPOINTS.AUTH.REGISTER)
      console.log("Register payload:", {
        name,
        email: signupEmail,
        password: signupPassword,
      })

      // Try with the correct endpoint structure
      const response = await Axios.post(ENDPOINTS.AUTH.REGISTER, {
        name,
        email: signupEmail,
        password: signupPassword,
      })

      console.log("Registration response:", response.data)

      // Show success message and switch to login view
      alert("Registration successful! Please log in.")
      setIsLogin(true)
    } catch (error: any) {
      console.error("Registration error:", error)

      // Try to get detailed error information
      if (error.response) {
        console.error("Error status:", error.response.status)
        console.error("Error data:", error.response.data)
      }

      // For 400 Bad Request, the API might be expecting different field names
      if (error.response?.status === 400) {
        console.error("The server rejected the registration data. Check the required fields and format.")
      }

      setError(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <AnimatePresence initial={false} mode="wait">
        {isLogin ? (
          <>
            {/* Left Side - Login Form */}
            <motion.div
              key="login-form"
              className="w-full md:w-1/2 p-8 md:p-12 flex flex-col"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-12">
                <div className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-md mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="8" height="8" rx="2" fill="#26C6B0" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="13" y="13" width="8" height="8" rx="2" fill="#26C6B0" />
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-800">Online Voting System</span>
              </div>

              <form onSubmit={handleLogin}>
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Login to Your Account</h1>
                    <p className="text-gray-600">Login using social networks</p>
                  </motion.div>

                  <motion.div
                    className="flex gap-3 mb-6 justify-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.button
                      type="button"
                      className="w-10 h-10 rounded-full bg-[#db4437] flex items-center justify-center text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Login with Google"
                    >
                      <span className="font-bold">G</span>
                    </motion.button>
                  </motion.div>

                  <motion.div
                    className="flex items-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500 uppercase">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </motion.div>

                  {/* Display error message if any */}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                  )}

                  <motion.div
                    className="space-y-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="relative">
                      <Input
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        type="email"
                        placeholder="Email"
                        className="bg-gray-100 border-0 h-12 px-4"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-gray-100 border-0 h-12 px-4 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="flex justify-end -mt-2">
                      <a href={`/${locale}/forgot-password`} className="text-sm text-blue-500 hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <motion.button
                      type="submit"
                      className="w-full h-12 bg-[#26C6B0] text-white rounded-md font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Sign in"
                      title="Sign in"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </motion.button>
                  </motion.div>
                </div>
              </form>
            </motion.div>

            {/* Right Side - Sign Up CTA */}
            <motion.div
              key="signup-cta"
              className="hidden md:block w-1/2 bg-[#26C6B0] p-12 relative"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Background Patterns */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-64 h-64 rounded-full bg-teal-300 opacity-20 -top-10 -right-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-teal-300 opacity-20 -bottom-20 -left-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-teal-300 opacity-20 top-1/3 right-1/4"
                  animate={{
                    scale: [1, 1.3, 1],
                    y: [0, -30, 0],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 2,
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Content */}
              <div className="h-full flex flex-col justify-center items-center text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-xs"
                >
                  <h2 className="text-3xl font-bold text-white mb-4">New Here?</h2>
                  <p className="text-white text-opacity-90 mb-8">
                    Sign up and discover a great amount of new opportunities!
                  </p>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleView()
                    }}
                    className="px-8 py-3 bg-white text-[#26C6B0] rounded-full font-medium relative z-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Go to sign up"
                  >
                    Sign Up
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Left Side - Sign Up CTA */}
            <motion.div
              key="login-cta"
              className="hidden md:block w-1/2 bg-[#26C6B0] p-12 relative"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Background Patterns */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-64 h-64 rounded-full bg-teal-300 opacity-20 -top-10 -right-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-teal-300 opacity-20 -bottom-20 -left-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-teal-300 opacity-20 top-1/3 right-1/4"
                  animate={{
                    scale: [1, 1.3, 1],
                    y: [0, -30, 0],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 2,
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Content */}
              <div className="h-full flex flex-col justify-center items-center text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-xs"
                >
                  <h2 className="text-3xl font-bold text-white mb-4">Already a Member?</h2>
                  <p className="text-white text-opacity-90 mb-8">
                    Login to access your account and continue your journey!
                  </p>
                  <motion.button
                    type="button"
                    onClick={toggleView}
                    className="px-8 py-3 bg-white text-[#26C6B0] rounded-full font-medium relative z-50" // Added z-50
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Go to sign in"
                  >
                    Sign In
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Sign Up Form */}
            <motion.div
              key="signup-form"
              className="w-full md:w-1/2 p-8 md:p-12 flex flex-col"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-12">
                <div className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-md mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="8" height="8" rx="2" fill="#26C6B0" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="13" y="13" width="8" height="8" rx="2" fill="#26C6B0" />
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-800">Online Voting System</span>
              </div>

              <form onSubmit={registerUser}>
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                    <p className="text-gray-600">Sign up using social networks</p>
                  </motion.div>

                  <motion.div
                    className="flex gap-3 mb-6 justify-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <motion.button
                      type="button"
                      className="w-10 h-10 rounded-full bg-[#db4437] flex items-center justify-center text-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Sign up with Google"
                    >
                      <span className="font-bold">G</span>
                    </motion.button>
                  </motion.div>

                  <motion.div
                    className="flex items-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-4 text-sm text-gray-500 uppercase">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </motion.div>

                  {/* Display error message if any */}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                  )}

                  <motion.div
                    className="space-y-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="relative">
                      <Input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                        }}
                        type="text"
                        placeholder="Full Name"
                        className="bg-gray-100 border-0 h-12 px-4"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Input
                        value={signupEmail}
                        onChange={(e) => {
                          setSignupEmail(e.target.value)
                        }}
                        type="email"
                        placeholder="Email"
                        className="bg-gray-100 border-0 h-12 px-4"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value)
                        }}
                        placeholder="Password"
                        className="bg-gray-100 border-0 h-12 px-4 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <motion.button
                      type="submit"
                      className="w-full h-12 bg-[#26C6B0] text-white rounded-md font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Sign up"
                      title="Sign up"
                      disabled={loading}
                    >
                      {loading ? "Signing up..." : "Sign Up"}
                    </motion.button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <div className="md:hidden absolute bottom-8 right-8">
        <motion.button
          type="button"
          onClick={toggleView}
          className="px-6 py-2 bg-[#26C6B0] text-white rounded-full font-medium shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isLogin ? "Go to sign up" : "Go to sign in"}
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </motion.button>
      </div>
    </div>
  )
}

export default LoginPage
