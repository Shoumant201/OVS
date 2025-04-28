"use client"

import type React from "react"

import { StatCard } from "./StatCard"
import { Users, HelpCircle } from "lucide-react"

interface StatsSectionProps {
  votersCount: number
  questionsCount: number
  optionsCount: number
}

export function StatsSection({ votersCount, questionsCount, optionsCount }: StatsSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <StatCard icon={<Users className="h-10 w-10" />} label="Voters" value={votersCount} color="bg-orange-500" />

      <StatCard
        icon={<HelpCircle className="h-10 w-10" />}
        label="Ballot Questions"
        value={questionsCount}
        color="bg-pink-500"
      />

      <StatCard icon={<List className="h-10 w-10" />} label="Options" value={optionsCount} color="bg-indigo-600" />
    </div>
  )
}

function List(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  )
}

