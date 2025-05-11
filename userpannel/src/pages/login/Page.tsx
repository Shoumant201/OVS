"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Axios from "@/services/axiosInstance"
import Cookies from "js-cookie"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react" // Added Loader2
import { Input } from "@/components/ui/input"
import ENDPOINTS from "@/services/Endpoints"
import type { Locale } from "@/lib/dictionary"
import { LocalizedLink } from "@/components/LocalizedLink"

// Interface for the decoded JWT payload, assuming it might contain an 'onboarding' flag
interface DecodedTokenPayload {
  onboarding?: boolean;
  // Add other standard JWT claims or custom claims your token might have
  exp?: number;
  iat?: number;
  sub?: string; // Typically user ID
  // Add other fields from your token like id, name, email if they exist and are useful
  id?: string;
  name?: string;
  email?: string;
}


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

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Corrected state variables for signup
  const [name, setName] = useState("") // For user's full name during signup
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("") // For signup password

  const [error, setError] = useState("")
  const router = useRouter()

  // Translations - Destructure for easier access
  const tLogin = dictionary["login-page"] || {}
  const tAuth = dictionary["auth"] || {}
  const tAuthButtons = dictionary["auth-buttons"] || {}
  // const tErrorDict = dictionary["error"] || {} // If you have a separate error section in dictionary
  const tNavbar = dictionary["navbar"] || {}
  const tMessages = dictionary["messages"] || {}
  const tBasicInfo = dictionary["basic-info"] || {} // For "Full Name" placeholder

  useEffect(() => {
    // Optional: Store locale in sessionStorage if needed for other client-side logic
    if (locale) {
      sessionStorage.setItem("currentLocale", locale)
    }
  }, [locale])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleView = () => {
    setIsLogin(!isLogin)
    setError("") // Clear error when toggling view
    // Clear form fields when toggling
    setLoginEmail("")
    setLoginPassword("")
    setName("")
    setSignupEmail("")
    setSignupPassword("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await Axios.post(ENDPOINTS.AUTH.LOGIN, {
        email: loginEmail,
        password: loginPassword,
      })

      if (response.data.require2FA) {
        localStorage.setItem("tempToken", response.data.tempToken)
        router.push(`/${locale}/verify-code`)
      } else {
        Cookies.set("token", response.data.token, { expires: 30, path: "/" })

        try {
          const tokenParts = response.data.token.split(".")
          if (tokenParts.length === 3) {
            const payloadString = atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')); // Handle URL-safe base64
            const payload: DecodedTokenPayload = JSON.parse(payloadString)

            if (payload && payload.onboarding === false) {
              router.push(`/${locale}/onboarding/basic-info`)
              setLoading(false); // Ensure loading is false before return
              return
            }
          }
        } catch (decodeError) {
          console.error("Error decoding token for onboarding check:", decodeError)
        }
        router.push(`/${locale}/`) // Default: redirect to localized home
      }
    } catch (err: any) {
      console.error("Login error:", err)
      let errorMessage = tLogin.errorLoginDefault || "Login failed. Please check your credentials."
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage
        if (err.response.status === 404) {
          errorMessage = tLogin.errorApiNotFound || "API endpoint not found."
          console.error(errorMessage)
        }
      }
      setError(errorMessage)
    } finally {
      // Ensure loading is set to false even if redirection happens earlier
      // This might already be handled if router.push causes unmount, but good practice
      if (loading) setLoading(false);
    }
  }

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await Axios.post(ENDPOINTS.AUTH.REGISTER, {
        name, // Uses the 'name' state variable
        email: signupEmail,
        password: signupPassword, // Uses the 'signupPassword' state variable
      })

      alert(
        `${tLogin.registrationSuccessTitle || "Registration Successful!"}\n${tLogin.registrationSuccessMessage || "Please log in."}`,
      )
      setIsLogin(true)
      // Clear signup form fields after successful registration and toggle
      setName("")
      setSignupEmail("")
      setSignupPassword("")
    } catch (err: any) {
      console.error("Registration error:", err)
      let errorMessage = tLogin.errorRegisterDefault || "Registration failed. Please try again."
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage
        if (err.response.status === 400) {
          errorMessage = tLogin.errorBadRequest || "Server rejected data. Check fields."
          console.error(errorMessage)
        } else if (err.response.status === 404) {
          errorMessage = tLogin.errorApiNotFound || "API endpoint not found."
          console.error(errorMessage)
        }
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fallback if dictionary is not loaded properly
  if (!tLogin.loginToAccount) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-[#26C6B0]" />
        </div>
    );
  }

  const commonInputClass =
    "bg-gray-100 dark:bg-gray-700 border-0 dark:border-gray-600 h-12 px-4 text-gray-800 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-[#26C6B0] focus:border-transparent outline-none rounded-md"
  const commonButtonClass =
    "w-full h-12 bg-[#26C6B0] text-white rounded-md font-medium hover:bg-[#20A090] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
  const ctaButtonClass =
    "px-8 py-3 bg-white text-[#26C6B0] rounded-full font-medium relative z-10 hover:bg-gray-100 transition-colors"

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black">
      <AnimatePresence initial={false} mode="wait">
        {isLogin ? (
          <>
            {/* Left Side - Login Form */}
            <motion.div
              key="login-form"
              className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col dark:bg-black overflow-y-auto"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-md mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="8" height="8" rx="2" fill="#26C6B0" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="13" y="13" width="8" height="8" rx="2" fill="#26C6B0" />
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {tNavbar.title || "Online Voting System"}
                </span>
              </div>

              <form onSubmit={handleLogin} className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tLogin.loginToAccount}</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{tLogin.loginUsingSocial}</p>
                </motion.div>

                <motion.div
                  className="flex gap-3 mb-6 justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <motion.button
                    type="button"
                    className="w-10 h-10 rounded-full bg-[#db4437] flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={tAuthButtons.loginWithGoogle || "Login with Google"}
                    // onClick={handleGoogleLogin} // Implement this function if needed
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
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <span className="px-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase">{tLogin.or}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </motion.div>

                {error && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400 px-4 py-3 rounded mb-4 text-sm"
                    role="alert"
                  >
                    {error}
                  </div>
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
                      placeholder={tAuth.email || "Email"}
                      className={commonInputClass}
                      required
                      aria-label={tAuth.email || "Email"}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={tAuth.password || "Password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`${commonInputClass} pr-12`}
                      required
                      aria-label={tAuth.password || "Password"}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 focus:outline-none"
                      aria-label={
                        showPassword
                          ? tMessages.hidePassword || "Hide password"
                          : tMessages.showPassword || "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end -mt-2">
                    <LocalizedLink
                      href="/forgot-password"
                      className="text-sm text-[#26C6B0] hover:underline dark:text-teal-400"
                    >
                      {tLogin.forgotPassword}
                    </LocalizedLink>
                  </div>
                  <motion.button
                    type="submit"
                    className={commonButtonClass}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={tLogin.loginButton}
                    title={tLogin.loginButton}
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tLogin.loggingIn}</> : tLogin.loginButton}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>

            {/* Right Side - Sign Up CTA */}
            <motion.div
              key="signup-cta"
              className="hidden md:flex w-1/2 bg-[#26C6B0] p-12 relative flex-col justify-center items-center text-center overflow-hidden"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 overflow-hidden z-0">
                <motion.div
                  className="absolute w-64 h-64 rounded-full bg-teal-300/20 -top-10 -right-10"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-teal-300/20 -bottom-20 -left-20"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 0] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 1 }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-teal-300/20 top-1/3 right-1/4"
                  animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
                  transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 2 }}
                  aria-hidden="true"
                />
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xs relative z-10"
              >
                <h2 className="text-3xl font-bold text-white mb-4">{tLogin.newHere}</h2>
                <p className="text-white text-opacity-90 mb-8">{tLogin.signUpMessage}</p>
                <motion.button
                  type="button"
                  onClick={toggleView}
                  className={ctaButtonClass}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={tLogin.signUp}
                >
                  {tLogin.signUp}
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Left Side - Sign In CTA */}
            <motion.div
              key="login-cta"
              className="hidden md:flex w-1/2 bg-[#26C6B0] p-12 relative flex-col justify-center items-center text-center overflow-hidden"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 overflow-hidden z-0">
                <motion.div
                  className="absolute w-64 h-64 rounded-full bg-teal-300/20 -top-10 -right-10"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-teal-300/20 -bottom-20 -left-20"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, -10, 0] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 1 }}
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-teal-300/20 top-1/3 right-1/4"
                  animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
                  transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 2 }}
                  aria-hidden="true"
                />
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xs relative z-10"
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  {tLogin.alreadyMemberTitle || "Already a Member?"}
                </h2>
                <p className="text-white text-opacity-90 mb-8">
                  {tLogin.alreadyMemberMessage || "Login to access your account and continue your journey!"}
                </p>
                <motion.button
                  type="button"
                  onClick={toggleView}
                  className={ctaButtonClass}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={tLogin.loginButton}
                >
                  {tLogin.loginButton}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Side - Sign Up Form */}
            <motion.div
              key="signup-form"
              className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col dark:bg-black overflow-y-auto"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-8 sm:mb-12">
                <div className="flex items-center justify-center w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-md mr-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="8" height="8" rx="2" fill="#26C6B0" />
                    <rect x="13" y="3" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="3" y="13" width="8" height="8" rx="2" fill="#26C6B0" opacity="0.5" />
                    <rect x="13" y="13" width="8" height="8" rx="2" fill="#26C6B0" />
                  </svg>
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {tNavbar.title || "Online Voting System"}
                </span>
              </div>

              <form onSubmit={registerUser} className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {tLogin.createAccountTitle || "Create Your Account"}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {tLogin.signupUsingSocial || "Sign up using social networks"}
                  </p>
                </motion.div>

                <motion.div
                  className="flex gap-3 mb-6 justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <motion.button
                    type="button"
                    className="w-10 h-10 rounded-full bg-[#db4437] flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={tAuthButtons.loginWithGoogle || "Sign up with Google"}
                     // onClick={handleGoogleSignup} // Implement this function if needed
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
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <span className="px-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase">{tLogin.or}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </motion.div>

                {error && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-500 dark:text-red-400 px-4 py-3 rounded mb-4 text-sm"
                    role="alert"
                  >
                    {error}
                  </div>
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
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder={tBasicInfo.fullName || tAuth.fullName || "Full Name"}
                      className={commonInputClass}
                      required
                      aria-label={tBasicInfo.fullName || tAuth.fullName || "Full Name"}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      type="email"
                      placeholder={tAuth.email || "Email"}
                      className={commonInputClass}
                      required
                      aria-label={tAuth.email || "Email"}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder={tAuth.password || "Password"}
                      className={`${commonInputClass} pr-12`}
                      required
                      aria-label={tAuth.password || "Password"}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 focus:outline-none"
                      aria-label={
                        showPassword
                          ? tMessages.hidePassword || "Hide password"
                          : tMessages.showPassword || "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <motion.button
                    type="submit"
                    className={commonButtonClass}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={tLogin.signUp}
                    title={tLogin.signUp}
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{tLogin.signingUp || "Signing up..."}</> : tLogin.signUp}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-20">
        <motion.button
          type="button"
          onClick={toggleView}
          className="px-6 py-3 bg-[#26C6B0] text-white rounded-full font-semibold shadow-lg hover:bg-[#20A090] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#26C6B0] dark:focus:ring-offset-black"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isLogin ? tLogin.signUp : tLogin.loginButton}
        >
          {isLogin ? tLogin.signUp : tLogin.loginButton}
        </motion.button>
      </div>
    </div>
  )
}

export default LoginPage