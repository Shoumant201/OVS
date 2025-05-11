"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VotingForm } from "@/components/voting/VotingForm"
import { getElectionById, getQuestionsByElectionId, getCandidatesByQuestionId } from "@/services/api/Authentication"

interface Question {
  id: number
  title: string
  description?: string
  type: string
  election_id: number
  min_selections?: number
  max_selections?: number
  shuffle?: boolean
}

interface Candidate {
  id: number
  candidate_name: string
  candidate_bio?: string
  description?: string
  photo?: string
  question_id: number
}

interface Election {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  status: string
  // Other election fields
}

export default function VotePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [election, setElection] = useState<Election | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [candidates, setCandidates] = useState<Record<number, Candidate[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch election details
        const electionData = await getElectionById(id)
        if (!electionData) {
          setError("Election not found")
          return
        }
        setElection(electionData)

        // Check if election is active
        const now = new Date()
        const startDate = new Date(electionData.start_date)
        const endDate = new Date(electionData.end_date)

        if (now < startDate) {
          setError("This election has not started yet")
          return
        }

        if (now > endDate) {
          setError("This election has ended")
          return
        }

        // Fetch questions for this election
        const questionsData = await getQuestionsByElectionId(id)
        setQuestions(questionsData)

        // Fetch candidates for each question
        const candidatesMap: Record<number, Candidate[]> = {}

        await Promise.all(
          questionsData.map(async (question) => {
            const questionCandidates = await getCandidatesByQuestionId(question.id)
            candidatesMap[question.id] = questionCandidates
          }),
        )

        setCandidates(candidatesMap)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load election data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading election data...</p>
      </div>
    )
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/elections")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error || "Election not found"}</p>
            <Button className="mt-4" onClick={() => router.push("/elections")}>
              Return to Elections
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.push(`/elections/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
        </Button>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{election.title}</h1>
          <p className="text-gray-600 mb-4">{election.description}</p>
        </div>

        <VotingForm electionId={id} questions={questions} candidates={candidates} />
      </div>
    </div>
  )
}
