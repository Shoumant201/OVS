"use client"
import withAuth from "@/hoc/withAuth"
import type React from "react"
import { useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { ElectionCard, type Election } from "@/components/dashboard/ElectionCard"
import { Search, Plus, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/hoc/withAuth"

interface DashboardPageProps {
  userRole: UserRole
  userId: string
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userRole, userId }) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample election data
  const elections: Election[] = [
    {
      id: 1,
      title: "Test Election",
      status: "Scheduled",
      startDate: "03/26/25, 8:00 PM",
      endDate: "04/03/25, 7:00 PM",
    },
    {
      id: 2,
      title: "Board Election 2025",
      status: "Ongoing",
      startDate: "03/20/25, 9:00 AM",
      endDate: "03/30/25, 5:00 PM",
    },
    {
      id: 3,
      title: "Student Council 2024",
      status: "Finished",
      startDate: "02/15/25, 8:00 AM",
      endDate: "02/20/25, 4:00 PM",
    },
  ]

  // Filter elections based on search query and status
  const filteredElections = elections.filter((election) => {
    const matchesSearch = election.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || election.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  // Check if user is admin or superadmin (has commissioner management permission)
  const canManageCommissioners = userRole === "admin" || userRole === "super_admin"

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Header */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div className="relative">
                <div className="text-black text-2xl font-bold">OVS</div>
                <div className="absolute -top-1 -right-3 flex">
                  <div className="w-1.5 h-1.5 bg-red-500"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500"></div>
                  <div className="w-1.5 h-1.5 bg-yellow-500"></div>
                </div>
              </div>
              {userRole === "commissioner" ? "Commissioner Dashboard" : "Admin Dashboard"}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="text-sm">
                Manage Users
              </Button>

              {/* Only show Manage Commissioners button for admin/superadmin users */}
              {canManageCommissioners && (
                <Button
                  onClick={() => router.push("/ManageCommissioner")}
                  variant="outline"
                  className="text-sm"
                >
                  Manage Commissioners
                </Button>
              )}

              <Button onClick={() => router.replace("/CreateElection")} className="bg-green-500 hover:bg-green-600 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Election
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Search Box */}
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search by election title..."
                className="pl-3 pr-10 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* Filter by Status */}
            <div className="w-full md:w-80">
              <Select onValueChange={(value) => setStatusFilter(value)} value={statusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Elections List */}
          <div className="border rounded-lg overflow-hidden mb-6">
            {filteredElections.length > 0 ? (
              filteredElections.map((election) => <ElectionCard key={election.id} election={election} />)
            ) : (
              <p className="text-center text-gray-500 py-4">No elections found</p>
            )}
          </div>

          {/* Pagination */}
          <div className="text-sm text-gray-500">
            Showing {filteredElections.length} of {elections.length} Elections
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="text-sm text-gray-500">
            Copyright © 2025 Election Runner |{" "}
            <a href="#" className="hover:underline">
              Terms of Service
            </a>{" "}
            |{" "}
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
          >
            <HelpCircle className="h-6 w-6" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default withAuth(DashboardPage)

