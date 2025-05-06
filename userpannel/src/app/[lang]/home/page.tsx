"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, CheckSquare, Users, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DateTime } from "luxon"
import axiosInstance from "@/services/axiosInstance"
import ENDPOINTS from "@/services/Endpoints"
import { type Locale } from '@/lib/dictionary'

interface Election {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  status: string
  voters: number
  ballot_questions: number
  options: number
  created_at: string
  updated_at: string
  created_by_admin: number | null
  created_by_commissioner: number | null
  launched: boolean
}

export default function ElectionsPage({
  dictionary,
  locale,
}: {
  dictionary: any
  locale: Locale
}) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching elections from API
    const fetchElections = async () => {
      setLoading(true)
      try {
        const response = await axiosInstance.get(ENDPOINTS.ELECTION.getUserElections)
        console.log(response.data);

        setElections(response.data)
      } catch (error) {
        console.error("Error fetching elections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchElections()
  }, [])

  const filteredElections = elections.filter((election) => {
    // Apply search filter
    const matchesSearch =
      searchTerm === "" ||
      election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //election.organization.toLowerCase().includes(searchTerm.toLowerCase())
      false

    // Apply status filter
    const matchesStatus = statusFilter === null || election.status === statusFilter

    return matchesSearch && matchesStatus
  })


  const handleElectionClick = (id: number) => {
    router.push(`/${locale}/home/${id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "finished":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available Elections</h2>
          <p className="text-gray-600">Browse and participate in elections you're eligible for</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search elections..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter || "All Statuses"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>Scheduled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("ongoing")}>Ongoing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("finished")}>Finished</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Elections Grid */}
        {loading ? (
          <div className="text-center py-12">Loading elections...</div>
        ) : filteredElections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No elections found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredElections.map((election) => (
              <div
                key={election.id}
                className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer dark:bg-[#292828]"
                onClick={() => handleElectionClick(election.id)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold">{election.title}</h3>
                        <Badge className={getStatusColor(election.status)}>{election.status}</Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{election.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {DateTime.fromISO(election.start_date).toFormat("MMM dd")} -{" "}
                            {DateTime.fromISO(election.end_date).toFormat("MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{election.voters} voters</span>
                        </div>
                        <div className="flex items-center">
                          <CheckSquare className="h-4 w-4 mr-1" />
                          <span>{election.ballot_questions} questions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t px-6 py-3 bg-gray-50 rounded-b-lg dark:bg-[#3b3b3b]">
                  <div className="flex justify-end">
                    <Button className="bg-[#26C6B0] hover:bg-[#269bc6] ">
                      {election.status.toLowerCase() === "ongoing"
                        ? "Vote Now"
                        : election.status.toLowerCase() === "scheduled"
                          ? "View Details"
                          : "View Results"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
