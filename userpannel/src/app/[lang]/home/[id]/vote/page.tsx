"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VotingForm } from "@/components/voting/VotingForm"
import { getElectionById, getQuestionsByElectionId, getCandidatesByQuestionId } from "@/services/api/Authentication"
import { useLocalizedNavigation } from "@/lib/use-localized-navigation"
import type { Locale } from "@/lib/dictionary"

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
}

interface VotePageProps {
  dictionary: any
  locale: Locale
}

export default function VotePage({ dictionary, locale }: VotePageProps) {
  const params = useParams()
  const { navigate } = useLocalizedNavigation()
  const id = params?.id as string // Changed from electionId to id

  const [election, setElection] = useState<Election | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [candidates, setCandidates] = useState<Record<number, Candidate[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError(dictionary["vote-page"].errorElectionNotFound)
        setLoading(false)
        return
      }
      try {
        setLoading(true)

        const electionData = await getElectionById(id)
        if (!electionData) {
          setError(dictionary["vote-page"].errorElectionNotFound)
          setLoading(false)
          return
        }
        setElection(electionData)

        const now = new Date()
        const startDate = new Date(electionData.start_date)
        const endDate = new Date(electionData.end_date)

        if (now < startDate) {
          setError(dictionary["vote-page"].errorNotStarted)
          setLoading(false)
          return
        }

        if (now > endDate) {
          setError(dictionary["vote-page"].errorEnded)
          setLoading(false)
          return
        }

        const questionsData = await getQuestionsByElectionId(id)
        setQuestions(questionsData)

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
        setError(dictionary["vote-page"].errorGeneric)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, dictionary])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{dictionary["vote-page"].loadingElectionData}</p>
      </div>
    )
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/elections")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {dictionary["vote-page"].backToElections}
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">{dictionary["vote-page"].errorTitle}</h2>
            <p className="text-red-700">{error || dictionary["vote-page"].errorElectionNotFound}</p>
            <Button className="mt-4" onClick={() => navigate("/elections")}>
              {dictionary["vote-page"].returnToElections}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const electionDetailPath = `/home/${id}`

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(electionDetailPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {dictionary["vote-page"].backToElectionDetails}
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
