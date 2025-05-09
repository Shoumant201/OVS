"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button" // Assuming this is from your ui library
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import axiosInstance from "@/services/axiosInstance"
import { jwtDecode, type JwtPayload } from "jwt-decode" // Import JwtPayload
import { LanguageSwitcher } from "./language-switcher"
import { useLanguage } from "@/lib/language-provider"
import ENDPOINTS from "@/services/Endpoints"
import ThemeToggle from "./themeToggle"
import { UserIcon, LogIn } from "lucide-react" // Added LogIn icon

interface DecodedToken extends JwtPayload { // Extend JwtPayload for standard claims like exp, iat
  id: string;
  user_id?: string; // If your token uses user_id
  name?: string;
  full_name?: string;
  email?: string;
  profile_image?: string; // If profile image URL is in the token
}

interface UserProfile {
  full_name?: string
  email?: string
  phone?: string
  profile_image?: string
  // Add other fields that might come from your API's user profile structure
  image?: string; // Common alternative for profile_image
  [key: string]: any // Allow any other properties
}

// Props for the Navbar component
interface NavbarProps {
  dictionary: any;
  // locale is now derived from useLanguage, so not needed as a direct prop here
  // but if you pass it from a server component, you can keep it.
}

const Navbar = ({ dictionary }: NavbarProps) => {
  const router = useRouter()
  const { locale } = useLanguage() // Get current locale from provider
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)

  // Translations
  const tNavbar = dictionary?.navbar || {};
  const DEFAULT_USER_NAME = tNavbar.guestUser || "Guest User";

  const DEFAULT_USER: UserProfile = {
    full_name: DEFAULT_USER_NAME,
    email: "",
    phone: "",
    profile_image: "",
  }

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
      setLoading(true); // Start loading
      let resolvedUser: UserProfile | null = null;
      const cachedUser = getUserFromLocalStorage();

      if (cachedUser) {
        resolvedUser = cachedUser;
        setUser(resolvedUser); // Optimistically set from cache
      }

      const token = Cookies.get("token");

      if (!token) {
        if (!resolvedUser) setUser(DEFAULT_USER);
        setLoading(false);
        return;
      }

      // Try to decode token and get basic info
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const tokenUserUpdate: UserProfile = {
          full_name: decoded.full_name || decoded.name,
          email: decoded.email,
          profile_image: decoded.profile_image || resolvedUser?.profile_image, // Prioritize token image if present
        };
        // Merge with cached user or default, prioritizing token data for key fields
        resolvedUser = { ...(cachedUser || DEFAULT_USER), ...tokenUserUpdate };
        setUser(resolvedUser);
        // No need to save to localStorage here yet, API call might provide more complete data
      } catch (tokenError) {
        console.error("Error decoding token:", tokenError);
        // If token is invalid, treat as logged out, unless we have a valid cached user (less likely)
        if (!cachedUser) {
            Cookies.remove("token"); // Clean up invalid token
            localStorage.removeItem("userProfile");
            setUser(DEFAULT_USER);
        }
        // If there's a cached user, we might still try the API call below if a token "exists"
      }

      // Attempt to fetch full profile from API
      try {
        const decodedForApi = jwtDecode<DecodedToken>(token); // Re-decode or ensure 'id' is available
        const userId = decodedForApi.id || decodedForApi.user_id;

        if (userId) {
          const url = ENDPOINTS.AUTH.getProfile.replace(":id", userId);
          const response = await axiosInstance.get(url);
          let apiUserData: UserProfile | null = null;

          if (response.data && response.data.user) {
            apiUserData = response.data.user;
          } else if (response.data && response.data.data && response.data.data.user) {
            apiUserData = response.data.data.user;
          } else if (response.data && typeof response.data === "object" && (response.data.full_name || response.data.email)) {
            apiUserData = response.data;
          }
          
          // Map 'image' to 'profile_image' if backend uses 'image'
          if (apiUserData && apiUserData.image && !apiUserData.profile_image) {
            apiUserData.profile_image = apiUserData.image;
          }


          const isEmptyApiUser = apiUserData && Object.values(apiUserData).every((val) => val === "" || val === undefined || val === null);

          if (apiUserData && !isEmptyApiUser) {
            setUser(apiUserData);
            saveUserToLocalStorage(apiUserData);
            resolvedUser = apiUserData; // Update resolvedUser with fresh API data
          } else if (!resolvedUser) { // If API returned empty and no user from token/cache
            setUser(DEFAULT_USER);
            saveUserToLocalStorage(DEFAULT_USER);
          }
          // If API data is empty but we had a user from token/cache, keep that.
        } else if (!resolvedUser) { // No userId from token and no resolved user yet
            setUser(DEFAULT_USER);
            saveUserToLocalStorage(DEFAULT_USER);
        }
      } catch (apiError) {
        console.error("API request for profile failed:", apiError);
        // If API fails, rely on user info from token/cache if available, otherwise default
        if (!resolvedUser) {
          setUser(DEFAULT_USER);
          saveUserToLocalStorage(DEFAULT_USER);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [locale]); // Re-fetch if locale changes, though user profile itself might not be locale-dependent

  const handleLogout = () => {
    Cookies.remove("token", { path: '/' }); // Ensure path is set for removal
    localStorage.removeItem("userProfile");
    setUser(DEFAULT_USER); // Reset to default user state
    setAvatarError(false); // Reset avatar error state
    router.replace(`/${locale}/login`); // Use replace to prevent back navigation to authenticated state
  }

  const getInitials = (name?: string) => {
    const effectiveName = name || DEFAULT_USER_NAME;
    if (!effectiveName || typeof effectiveName !== "string" || effectiveName.trim() === "") return DEFAULT_USER_NAME.substring(0,2).toUpperCase();

    return effectiveName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleImageError = () => {
    setAvatarError(true)
  }

  // Safe navigation (already good, just ensuring locale is used)
  const goToProfile = () => router.push(`/${locale}/profile`)
  const goToSettings = () => router.push(`/${locale}/setting`) // Assuming 'setting' is the correct path

  // Determine if we should show the user as logged in
  // Check both token and if user state is not the default one (or has an email, for example)
  const isLoggedIn = !!Cookies.get("token") && (user && user.email !== DEFAULT_USER.email);


  // Fallback if dictionary isn't fully loaded for navbar specific keys
  if (!tNavbar.title) {
      return (
        <header className="bg-white border-b dark:bg-black">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
                <h1 className="text-2xl font-bold text-[#26C6B0] cursor-pointer">Loading...</h1>
            </div>
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <ThemeToggle />
            </div>
          </div>
        </header>
      )
  }

  return (
    <header className="bg-white border-b dark:bg-black dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 onClick={() => router.push(`/${locale}/`)} className="text-xl sm:text-2xl font-bold text-[#26C6B0] cursor-pointer hover:opacity-80 transition-opacity">
            {tNavbar.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {!loading && (
            <>
              {isLoggedIn && user ? (
                <>
                  <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                    {user.full_name || DEFAULT_USER_NAME}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 p-0 overflow-hidden focus-visible:ring-2 focus-visible:ring-[#26C6B0] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black">
                        <Avatar className="h-full w-full">
                          {user.profile_image && !avatarError ? (
                            <AvatarImage
                              src={user.profile_image} // Removed placeholder.svg logic here, AvatarFallback handles it
                              alt={user.full_name || DEFAULT_USER_NAME}
                              className="h-full w-full object-cover"
                              onError={handleImageError}
                            />
                          ) : (
                            <AvatarFallback className="bg-[#26C6B0] text-white dark:bg-teal-700 text-sm">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                      <DropdownMenuItem onClick={goToProfile} className="cursor-pointer dark:hover:bg-gray-700">{tNavbar.profile}</DropdownMenuItem>
                      <DropdownMenuItem onClick={goToSettings} className="cursor-pointer dark:hover:bg-gray-700">{tNavbar.settings}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-red-700/50 focus:bg-red-100 dark:focus:bg-red-700/60 focus:text-red-700 dark:focus:text-red-300">
                        {tNavbar.logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // Render Login button or simplified guest view
                <Button 
                    variant="ghost" 
                    onClick={() => router.push(`/${locale}/login`)} 
                    className="text-sm px-3 py-1.5 h-auto text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label={tNavbar.login}
                >
                  <LogIn size={18} className="mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tNavbar.login}</span>
                </Button>
              )}
            </>
          )}
          {loading && ( // Simple spinner or placeholder while loading
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
export default Navbar