"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Mail, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import {jwtDecode} from "jwt-decode"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("adminToken")
    localStorage.removeItem("adminToken")
    router.replace("/pages/login")
  }

  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const adminTokenCookie = Cookies.get("adminToken")
    const adminTokenLocalStorage = localStorage.getItem("adminToken")

    const token = adminTokenCookie || adminTokenLocalStorage
    if (token) {
      try {
        const decodedPayload: any = jwtDecode(token) // Decode JWT
        const name = decodedPayload?.name || "Guest"
        setUserName(name)
      } catch (error) {
        console.error("Error decoding adminToken:", error)
        setUserName("Guest")
      }
    } else {
      setUserName("Guest")
    }
  }, [])

  const handelSetting = () => {
    router.replace("/Setting")
  }

  useEffect(() => {
    const updateUserName = () => {
      setUserName(localStorage.getItem("userName") || "Guest");
    };
  
    window.addEventListener("userNameUpdated", updateUserName);
  
    return () => {
      window.removeEventListener("userNameUpdated", updateUserName);
    };
  }, []);


  return (
    <header className="w-full bg-[#00a8ff] text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="text-white lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="mr-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8H24V12H8V8Z" fill="white" />
                  <path d="M10 14H26V18H10V14Z" fill="white" />
                  <path d="M6 20H22V24H6V20Z" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-bold">Online Voting System</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden space-x-6 lg:flex">
            <Link href="/Dashboard" className="text-white hover:text-gray-200">
              Dashboard
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <Link href="/messages" className="text-white hover:text-gray-200">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span>{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Button  className="w-full" onClick={handelSetting}>
                    Account Settings
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button onClick={handleLogout} variant="outline" className="text-sm text-red-500 hover:text-red-600 w-full hover:bg-red-50">
                    Logout
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-blue-400 px-4 py-2 lg:hidden">
          <nav className="flex flex-col space-y-2">
            <Link href="/dashboard" className="py-2 text-white hover:text-gray-200" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link href="/settings" className="py-2 text-white hover:text-gray-200" onClick={() => setIsOpen(false)}>
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

