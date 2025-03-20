"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Axios } from "@/services/axiosInstance";
import { Endpoints } from "@/services/Endpoints";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Facebook } from "lucide-react"
import { Input } from "@/components/ui/input";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleView = () => {
    setIsLogin(!isLogin)
    console.log("TOGGLE VIEW CALLED!", new Date().toISOString());
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await Axios.post(Endpoints.adminLogin, { email, password });
  
      // Store the token securely in cookies
      Cookies.set("token", response.data.token, { expires: 7 });
  
      // Redirect to Dashboard
      router.replace("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid credentials");
    }
  };

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
                    className="w-10 h-10 rounded-full bg-[#db4437] flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="relative">
                    <Input type="email" placeholder="Email" className="bg-gray-100 border-0 h-12 px-4" />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="bg-gray-100 border-0 h-12 px-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <motion.button
                    className="w-full h-12 bg-[#26C6B0] text-white rounded-md font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.button>
                </motion.div>
              </div>
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
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-teal-300 opacity-20 -bottom-20 -left-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                />
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-teal-300 opacity-20 top-1/3 right-1/4"
                  animate={{
                    scale: [1, 1.3, 1],
                    y: [0, -30, 0],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 2,
                  }}
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
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleView();
                      }}
                      className="px-8 py-3 bg-white text-[#26C6B0] rounded-full font-medium relative z-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-teal-300 opacity-20 -bottom-20 -left-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                />
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-teal-300 opacity-20 top-1/3 right-1/4"
                  animate={{
                    scale: [1, 1.3, 1],
                    y: [0, -30, 0],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 2,
                  }}
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
                    onClick={toggleView}
                    className="px-8 py-3 bg-white text-[#26C6B0] rounded-full font-medium relative z-50" // Added z-50
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                    className="w-10 h-10 rounded-full bg-[#db4437] flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="relative">
                    <Input type="text" placeholder="Full Name" className="bg-gray-100 border-0 h-12 px-4" />
                  </div>
                  <div className="relative">
                    <Input type="email" placeholder="Email" className="bg-gray-100 border-0 h-12 px-4" />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="bg-gray-100 border-0 h-12 px-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <motion.button
                    className="w-full h-12 bg-[#26C6B0] text-white rounded-md font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign Up
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button */}
      <div className="md:hidden absolute bottom-8 right-8">
        <motion.button
          onClick={toggleView}
          className="px-6 py-2 bg-[#26C6B0] text-white rounded-full font-medium shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLogin ? "Sign Up" : "Sign In"}
        </motion.button>
      </div>
    </div>
  );
};

export default LoginPage;

