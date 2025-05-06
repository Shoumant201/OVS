'use client'

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import axiosInstance from "@/services/axiosInstance"
import { jwtDecode } from "jwt-decode"
import { LanguageSwitcher } from "./language-switcher"
import { type Locale } from "@/lib/dictionary"
import ENDPOINTS from "@/services/Endpoints"
import ThemeToggle from "./themeToggle"

interface UserProfile {
  full_name: string
  profile_image?: string
}

const Navbar = ({
  locale,
  dictionary,
}: {
  locale: Locale
  dictionary: any
}) => {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          setLoading(false)
          return
        }

        const decoded = jwtDecode<{ id: string }>(token)
        const id = decoded.id
        const url = ENDPOINTS.AUTH.getProfile.replace(":id", id)
        const response = await axiosInstance.get(url)
        setUser(response.data.user)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleLogout = () => {
    Cookies.remove("token")
    router.replace("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="bg-white border-b dark:bg-black">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1
            onClick={() => router.push(`/${locale}/`)}
            className="text-2xl font-bold text-[#26C6B0] cursor-pointer"
          >
            Online Voting System
          </h1>
        </div>
        {!loading && user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-amber-50">{user.full_name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                  <Avatar>
                    <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.full_name} />
                    <AvatarFallback>{user.full_name ? getInitials(user.full_name) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/setting")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <LanguageSwitcher locale={locale} dictionary={dictionary} />
            <ThemeToggle/>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
