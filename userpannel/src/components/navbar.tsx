"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import axiosInstance from "@/services/axiosInstance"
import { jwtDecode } from "jwt-decode"
import { LanguageSwitcher } from "./language-switcher"
import { useLanguage } from "@/lib/language-provider"
import ENDPOINTS from "@/services/Endpoints"
import ThemeToggle from "./themeToggle"
import { UserIcon } from "lucide-react"

// Define a default user profile for when data is empty
const DEFAULT_USER = {
  full_name: "Guest User",
  email: "",
  phone: "",
  profile_image: "",
  // Add other default fields as needed
}

interface UserProfile {
  full_name?: string
  email?: string
  phone?: string
  dob?: string
  gender?: string
  education?: string
  occupation?: string
  ethnicity?: string
  country?: string
  state?: string
  city?: string
  postal_code?: string
  profile_image?: string
  [key: string]: any // Allow any other properties
}

const Navbar = ({
  dictionary,
}: {
  locale?: string
  dictionary: any
}) => {
  const router = useRouter()
  const { locale } = useLanguage()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)

  // Store user data in localStorage for persistence across pages
  const saveUserToLocalStorage = (userData: UserProfile) => {
    try {
      localStorage.setItem("userProfile", JSON.stringify(userData))
    } catch (error) {
      console.error("Error saving user to localStorage:", error)
    }
  }

  // Get user data from localStorage
  const getUserFromLocalStorage = (): UserProfile | null => {
    try {
      const userData = localStorage.getItem("userProfile")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error getting user from localStorage:", error)
      return null
    }
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First check localStorage for cached user data
        const cachedUser = getUserFromLocalStorage()
        if (cachedUser) {
          console.log("Using cached user data:", cachedUser)
          setUser(cachedUser)
        }

        const token = Cookies.get("token")
        if (!token) {
          if (!cachedUser) setUser(DEFAULT_USER) // Use default user if no token and no cached data
          setLoading(false)
          return
        }

        // Try to get user info from token if possible
        try {
          const decoded = jwtDecode<{ id: string; name?: string; full_name?: string; email?: string }>(token)
          console.log("Token decoded data:", decoded)

          // Create a user from token data if available
          if (decoded.name || decoded.full_name || decoded.email) {
            const tokenUser = {
              ...DEFAULT_USER,
              full_name: decoded.full_name || decoded.name || DEFAULT_USER.full_name,
              email: decoded.email || DEFAULT_USER.email,
            }
            setUser(tokenUser)
            saveUserToLocalStorage(tokenUser)
          }
        } catch (tokenError) {
          console.error("Error decoding token:", tokenError)
        }

        // Still try the API call
        try {
          const decoded = jwtDecode<{ id: string }>(token)
          const id = decoded.id
          const url = ENDPOINTS.AUTH.getProfile.replace(":id", id)
          console.log("Fetching profile from URL:", url)

          const response = await axiosInstance.get(url)
          console.log("Full API response:", response)

          let userData: UserProfile | null = null

          // Check different possible response structures
          if (response.data && response.data.user) {
            userData = response.data.user
          } else if (response.data && response.data.data && response.data.data.user) {
            userData = response.data.data.user
          } else if (response.data && typeof response.data === "object") {
            // If we see profile data directly in the response
            if ("full_name" in response.data || "email" in response.data) {
              userData = response.data
            }
          }

          // Check if the user data is empty (all fields are empty strings or undefined)
          const isEmptyUser =
            userData && Object.values(userData).every((val) => val === "" || val === undefined || val === null)

          if (userData && !isEmptyUser) {
            console.log("Valid user data found:", userData)
            setUser(userData)
            saveUserToLocalStorage(userData)
          } else {
            console.warn("Empty or invalid user data:", userData)
            // If API returned empty data, use default user or keep existing
            if (!user) {
              setUser(DEFAULT_USER)
              saveUserToLocalStorage(DEFAULT_USER)
            }
          }
        } catch (apiError) {
          console.error("API request failed:", apiError)
          // If API call failed, use default user if we don't have one yet
          if (!user) {
            setUser(DEFAULT_USER)
            saveUserToLocalStorage(DEFAULT_USER)
          }
        }
      } catch (error) {
        console.error("Error in user profile fetch:", error)
        if (!user) {
          setUser(DEFAULT_USER)
          saveUserToLocalStorage(DEFAULT_USER)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleLogout = () => {
    Cookies.remove("token")
    localStorage.removeItem("userProfile") // Clear cached user data
    setUser(DEFAULT_USER)
    router.replace(`/${locale}/login`)
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string" || name.trim() === "") return "GU"

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleImageError = () => {
    console.log("Avatar image failed to load")
    setAvatarError(true)
  }

  // Safe navigation to profile page
  const goToProfile = () => {
    try {
      router.push(`/${locale}/profile`)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to direct navigation
      window.location.href = `/${locale}/profile`
    }
  }

  // Safe navigation to settings page
  const goToSettings = () => {
    try {
      router.push(`/${locale}/setting`)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to direct navigation
      window.location.href = `/${locale}/setting`
    }
  }

  // Determine if we should show the user as logged in
  const isLoggedIn = !!Cookies.get("token")

  return (
    <header className="bg-white border-b dark:bg-black">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 onClick={() => router.push(`/${locale}/`)} className="text-2xl font-bold text-[#26C6B0] cursor-pointer">
          {dictionary["navbar"].title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {isLoggedIn ? (
                <>
                  <span className="text-gray-700 dark:text-amber-50">{user?.full_name || DEFAULT_USER.full_name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full h-10 w-10 p-0 overflow-hidden">
                        <Avatar className="h-10 w-10">
                          {user?.profile_image && !avatarError ? (
                            <AvatarImage
                              src={user.profile_image || "/placeholder.svg"}
                              alt={user.full_name || DEFAULT_USER.full_name}
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(user?.full_name || DEFAULT_USER.full_name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={goToProfile}>
                        {dictionary?.common?.profile || dictionary["navbar"].profile}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={goToSettings}>
                        {dictionary?.common?.settings || dictionary["navbar"].settings}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        {dictionary?.common?.logout || dictionary["navbar"].logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Fallback when not logged in */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <UserIcon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/${locale}/login`)}>Login</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
export default Navbar