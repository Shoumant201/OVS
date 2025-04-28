"use client"

import { DateTime } from "luxon"
import { Calendar } from "lucide-react"

interface DateSectionProps {
  startDate: string
  endDate: string
}

export function DateSection({ startDate, endDate }: DateSectionProps) {
  return (
    <div className="space-y-6">
      {/* Start Date */}
      <div className="border rounded-md">
        <div className="border-b px-4 py-3 bg-gray-50 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          <h3 className="font-semibold">Start Date</h3>
        </div>
        <div className="p-4">{DateTime.fromISO(startDate).toFormat("LLL dd, yyyy, h:mm:ss a")}</div>
      </div>

      {/* End Date */}
      <div className="border rounded-md">
        <div className="border-b px-4 py-3 bg-gray-50 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          <h3 className="font-semibold">End Date</h3>
        </div>
        <div className="p-4">{DateTime.fromISO(endDate).toFormat("LLL dd, yyyy, h:mm:ss a")}</div>
      </div>
    </div>
  )
}

