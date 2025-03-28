'use client'
import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/Navbar"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Election Management System",
//   description: "Manage your elections with ease",
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()

  // Conditionally render Navbar based on the route
  const isLoginPage = pathname ===  "/pages/login"

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isLoginPage && <Navbar />}
          {children}
          <Toaster />
      </body>
    </html>
  )
}

