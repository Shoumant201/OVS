"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Home } from "lucide-react"
import withAuth from "@/hoc/withAuth"
import type { Election } from "@/components/dashboard/ElectionCard"
import { ElectionLayout } from "@/components/election/ElectionLayout"
import { DateSection } from "@/components/election/DateSection"
import { ElectionURLsSection } from "@/components/election/ElectionURLsSection"
import { StatsSection } from "@/components/election/StatsSection"
import { getElectionById } from "@/services/api/Authentication"
import { DateTime } from "luxon"

function ElectionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchElection = async () => {
      try {
        console.log("Fetching election with ID:", id)
        const data = await getElectionById(id)
        if (!data) {
          console.error("Election not found")
          router.push("/Dashboard") // Redirect to dashboard if election not found
          return
        }
        console.log("Election data:", data)
        setElection(data)
      } catch (error) {
        console.error("Error fetching election:", error)
        // router.push("/dashboard") // Redirect to dashboard on error
      } finally {
        setLoading(false)
      }
    }

    fetchElection()
  }, [id, router])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!election) {
    return <div className="flex items-center justify-center h-screen">Election not found</div>
  }

  return (
    <ElectionLayout election={election} activePage="overview">
      <div className="flex items-center mb-4">
        <Home className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <DateSection startDate={election.start_date } endDate={election.end_date} />

          <ElectionURLsSection electionId={election.id} />
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          <StatsSection
              votersCount={election.voters ?? 2}  // Using nullish coalescing to preserve 0
              questionsCount={election.ballot_questions ?? 2}  // Same here
              optionsCount={election.options ?? 2}  // And here
          />
        </div>
      </div>
    </ElectionLayout>
  )
}

export default withAuth(ElectionDetailsPage)

