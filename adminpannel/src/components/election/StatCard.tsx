"use client"

import type React from "react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`${color} text-white rounded-md p-4 flex items-center justify-between`}>
      <div className="flex items-center">
        <div className="mr-3">{icon}</div>
        <div>{label}</div>
      </div>
      <div className="text-4xl font-bold">{value}</div>
    </div>
  )
}

