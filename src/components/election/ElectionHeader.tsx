"use client"

import { Badge } from "@/components/ui/badge"

interface ElectionHeaderProps {
  title: string
  status: string
  votersCount: number
}

export function ElectionHeader({ title, status, votersCount }: ElectionHeaderProps) {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <Badge className="ml-3 bg-gray-200 text-gray-700 font-normal">{status}</Badge>
        </div>
        <div className="flex items-center">
          {/* <Badge className="bg-green-500 text-white mr-2">FREE</Badge> */}
          <span className="text-gray-600">{votersCount} Voters</span>
        </div>
      </div>
    </header>
  )
}

