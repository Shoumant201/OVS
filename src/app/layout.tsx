import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { SonnerProvider } from "@/components/sonner-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Election Management System",
  description: "Manage your elections with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <SonnerProvider />
          {children}
      </body>
    </html>
  )
}

