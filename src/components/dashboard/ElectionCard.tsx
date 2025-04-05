"use client"

import { useRouter } from "next/navigation"
import { Calendar, Users, CheckSquare } from "lucide-react"
import { DateTime } from "luxon"
import { Badge } from "@/components/ui/badge"

export interface Election {
  id: string
  title: string
  start_date: string
  end_date: string
  status?: string
  launched?: boolean
  description?: string
  candidates?: number
  voters?: number
  ballot_questions?: number
  options?: number
}

export function getElectionStatus(start_date: string, end_date: string): string {
  const now = DateTime.now()

  const start = DateTime.fromISO(start_date)
  const end = DateTime.fromISO(end_date)

  if (!start.isValid || !end.isValid) {
    console.error("Invalid date format:", { start_date, end_date })
    return "Unknown"
  }

  if (now < start) return "Scheduled"
  if (now >= start && now <= end) return "Ongoing"
  return "Finished"
}

export function ElectionCard({ election }: { election: Election }) {
  const router = useRouter()
  const status = election.status || "Unknown"

  const statusColors = {
    building: "bg-gray-100 text-gray-800",
    scheduled: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    finished: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
    Unknown: "bg-yellow-100 text-yellow-800",
  }

  const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.Unknown

  const handleClick = () => {
    router.push(`/election/${election.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="border-b last:border-b-0 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
            <Badge className={`${statusColor} font-medium`}>{status}</Badge>
          </div>
          {election.description && <p className="text-gray-600 mt-1 text-sm">{election.description}</p>}
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Start: {DateTime.fromISO(election.start_date).toFormat("LLL dd, yyyy, h:mm a")}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>End: {DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-500" />
            <span>{election.voters || 0} Voters</span>
          </div>
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-1 text-green-500" />
            <span>{election.candidates || 0} Candidates</span>
          </div>
        </div>
      </div>
    </div>
  )
}