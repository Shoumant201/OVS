"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BarChart3, PieChart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getElectionById } from "@/services/api/Authentication"
import { getElectionResults } from "@/services/api/Authentication"
import { DateTime } from "luxon"
import { ResultsSummary } from "./results-summary"
import { DemographicCharts } from "./demographics-chart"
import { VoterTurnout } from "./voter-turnout"
import { useLanguage } from "@/lib/language-provider"
import type { Locale } from "@/lib/dictionary"

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

interface ResultsPageProps {
  dictionary: any
  locale: Locale
  id: string
}

export default function ResultsPage({ dictionary, locale, id }: ResultsPageProps) {
  const router = useRouter()
  const { locale: contextLocale } = useLanguage()
  const [election, setElection] = useState<Election | null>(null)
  const [results, setResults] = useState<ElectionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  // Use the locale from context if available, otherwise use the prop
  const currentLocale = contextLocale || locale

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch election details
        const electionData = (await getElectionById(id)) as Election
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
            setError("Live results are hidden for this election.")
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

  const handleBackNavigation = () => {
    router.push(`/${currentLocale}/home/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-[#121212]">
        <p>Loading election results...</p>
      </div>
    )
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-[#121212]">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => router.push(`/${currentLocale}/home`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center dark:bg-red-900 dark:border-red-800">
            <h2 className="text-xl font-semibold text-red-800 mb-2 dark:text-red-100">Error</h2>
            <p className="text-red-700 dark:text-red-200">{error || "Election not found"}</p>
            <Button className="mt-4" onClick={() => router.push(`/${currentLocale}/home`)}>
              Return to Elections
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-[#121212]">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={handleBackNavigation}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
        </Button>

        <div className="bg-white rounded-lg border p-6 mb-6 dark:bg-black dark:border-gray-800">
          {new Date() < new Date(election.end_date) && !election.hide_result && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded mb-4 text-center dark:bg-blue-900 dark:border-blue-800 dark:text-blue-100">
              Live results are being displayed. These may change until the election ends.
            </div>
          )}
          <h1 className="text-2xl font-bold mb-2">{election.title} - Results</h1>
          <p className="text-gray-600 mb-4 dark:text-gray-400">
            Election ended on {DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}
          </p>
        </div>

        {results ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span>Summary</span>
              </TabsTrigger>
              <TabsTrigger value="demographics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Demographics</span>
              </TabsTrigger>
              <TabsTrigger value="turnout" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Turnout</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6">
              <ResultsSummary results={results.results} />
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
              <DemographicCharts results={results.results} />
            </TabsContent>

            <TabsContent value="turnout" className="space-y-6">
              <VoterTurnout
                totalVoters={election.voters}
                actualVoters={
                  results.results.length > 0 ? results.results[0].candidates.reduce((sum, c) => sum + c.votes, 0) : 0
                }
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center dark:bg-yellow-900 dark:border-yellow-800">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2 dark:text-yellow-100">Results Not Available</h2>
            <p className="text-yellow-700 dark:text-yellow-200">
              The results for this election are not available yet. Results will be published after the election ends.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
