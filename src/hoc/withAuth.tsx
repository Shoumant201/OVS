"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { AlertCircle } from "lucide-react"

// Define user roles based on your backend
export type UserRole = "admin" | "super_admin" | "commissioner"

// Define the auth state interface
export interface AuthState {
  isAuthenticated: boolean
  role: UserRole | null
  userId: string | null
  loading: boolean
}

// Role-based HOC for protected routes
const withAuth = (WrappedComponent: React.ComponentType, allowedRoles?: UserRole[]) => {
  const WithAuthComponent = (props: any) => {
    const router = useRouter()
    const [authState, setAuthState] = useState<AuthState>({
      isAuthenticated: false,
      role: null,
      userId: null,
      loading: true,
    })
    const [showAccessDenied, setShowAccessDenied] = useState(false)

    useEffect(() => {
      // Check for authentication token
      const token = Cookies.get("adminToken") || localStorage.getItem("adminToken")

      if (!token) {
        router.replace("/pages/login")
        return
      }

      try {
        // Parse the JWT token to get user info (this is safe as we're only doing it client-side)
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        )

        const { id, role } = JSON.parse(jsonPayload)

        // Check if user has permission to access this page
        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role as UserRole)) {
          setShowAccessDenied(true)
          setAuthState({
            isAuthenticated: true,
            role: role as UserRole,
            userId: id,
            loading: false,
          })
          return
        }

        // User is authenticated and has permission
        setAuthState({
          isAuthenticated: true,
          role: role as UserRole,
          userId: id,
          loading: false,
        })
      } catch (error) {
        console.error("Error parsing token:", error)
        // If token is invalid, redirect to login
        Cookies.remove("adminToken")
        localStorage.removeItem("adminToken")
        router.replace("/pages/login")
      }
    }, [router])

    // Show loading state
    if (authState.loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    // Show access denied message
    if (showAccessDenied) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Access Denied</h2>
            </div>
            <p className="text-gray-700 mb-4">
              You don't have permission to access this page. Please contact an administrator if you believe this is an
              error.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => router.replace("/")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Render the protected component
    return <WrappedComponent {...props} userRole={authState.role} userId={authState.userId} />
  }

  return WithAuthComponent
}

export default withAuth

