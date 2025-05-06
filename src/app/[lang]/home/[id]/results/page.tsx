"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getElectionById } from "@/services/api/Authentication"
import { getElectionResults } from "@/services/api/Authentication"
import { DateTime } from "luxon"

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
  hide_result: boolean
  results_published: boolean
}

interface ElectionResult {
  election_id: number | string
  title: string
  end_date: string
  results: {
    question_id: number
    title: string
    candidates: {
      id: number
      name: string
      votes: number
      photo?: string
    }[]
  }[]
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [election, setElection] = useState<Election | null>(null)

  const [results, setResults] = useState<ElectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch election details
        const electionData = await getElectionById(id) as Election
        if (!electionData) {
          setError("Election not found")
          return
        }
        setElection(electionData)

        // Check if election has ended
        const now = new Date()
        const endDate = new Date(electionData.end_date)

        if (now < endDate) {
          if (electionData.hide_result) {
            setError('Live results are hidden for this election.')
            return
          }
        }

        // Fetch election results
        const resultsData = await getElectionResults(id)
        setResults(resultsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load election results")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading election results...</p>
      </div>
    )
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => router.push("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error || "Election not found"}</p>
            <Button className="mt-4" onClick={() => router.push("/home")}>
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
        <Button variant="ghost" className="mb-6" onClick={() => router.push(`/home/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
        </Button>

        <div className="bg-white rounded-lg border p-6 mb-6">
        {new Date() < new Date(election.end_date) && !election.hide_result && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-4 text-center">
              Live results are being displayed. These may change until the election ends.
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">{election.title} - Results</h1>
          <p className="text-gray-600 mb-4">
            Election ended on {DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}
          </p>
        </div>

        {results ? (
          <div className="space-y-6">
            {results.results.map((questionResult) => (
              <Card key={questionResult.question_id}>
                <CardHeader>
                  <CardTitle>{questionResult.title}</CardTitle>
                  <CardDescription>
                    Total votes: {questionResult.candidates.reduce((sum, c) => sum + c.votes, 0)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {questionResult.candidates.map((candidate) => {
                      const totalVotes = questionResult.candidates.reduce((sum, c) => sum + c.votes, 0)
                      const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0

                      return (
                        <div key={candidate.id} className="space-y-2">
                          <div className="flex items-center gap-4">
                            {candidate.photo && (
                              <Image
                                src={candidate.photo || "/placeholder.svg"}
                                alt={candidate.name}
                                width={60}
                                height={60}
                                className="rounded-md object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{candidate.name}</span>
                                <span className="text-gray-500">
                                  {candidate.votes} votes ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Results Not Available</h2>
            <p className="text-yellow-700">
              The results for this election are not available yet. Results will be published after the election ends.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
