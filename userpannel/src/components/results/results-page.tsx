"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BarChart3, PieChart, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { DateTime } from "luxon"
import { useLanguage } from "@/lib/language-provider"
import { ResultsSummary } from "./results-summary"
import { DemographicCharts } from "./demographics-chart"
import { VoterTurnout } from "./voter-turnout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import axiosInstance from "@/services/axiosInstance"
import type { Locale } from "@/lib/dictionary"
import type { ElectionResult } from "../../../types/election-types"

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

interface ElectionResultsPageProps {
  dictionary: any
  locale: Locale
  id: string
}

export default function ElectionResultsPage({ dictionary, locale, id }: ElectionResultsPageProps) {
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
        const electionResponse = await axiosInstance.get(`/elections/${id}`)
        const electionData = electionResponse.data

        if (!electionData) {
          setError("Election not found")
          return
        }
        setElection(electionData)

        // Check if election has ended
        const now = new Date()
        const endDate = new Date(electionData.end_date)

        if (now < endDate && electionData.hide_result) {
          setError("Live results are hidden for this election.")
          setLoading(false)
          return
        }

        // Fetch election results
        const resultsResponse = await axiosInstance.get(`/elections/${id}/results`)
        setResults(resultsResponse.data)
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
    router.push(`/${currentLocale}/elections/${id}`)
  }

  const handleExport = async (format: string) => {
    try {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}/export?format=${format}`, "_blank")
    } catch (error) {
      console.error("Error exporting results:", error)
    }
  }

  const handleExportDemographics = async (format: string) => {
    try {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/elections/${id}/demographics/export?format=${format}`, "_blank")
    } catch (error) {
      console.error("Error exporting demographics:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" className="mb-6" onClick={handleBackNavigation}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !election) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" className="mb-6" onClick={() => router.push(`/${currentLocale}/elections`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Elections
        </Button>

        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Election not found"}</AlertDescription>
        </Alert>

        <Button onClick={() => router.push(`/${currentLocale}/elections`)}>Return to Elections</Button>
      </div>
    )
  }

  const isLiveResults = new Date() < new Date(election.end_date) && !election.hide_result

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <Button variant="ghost" onClick={handleBackNavigation} className="self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Election Details
        </Button>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Demographics
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportDemographics("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportDemographics("json")}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">{election.title} - Results</CardTitle>
              <CardDescription>
                {election.status === "finished"
                  ? `Election ended on ${DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}`
                  : `Election ends on ${DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}`}
              </CardDescription>
            </div>
            {election.status === "ongoing" && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Live Results</Badge>
            )}
          </div>
        </CardHeader>
        {isLiveResults && (
          <CardContent>
            <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              <AlertTitle>Live Results</AlertTitle>
              <AlertDescription>These are live results and may change until the election ends.</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

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
            <DemographicCharts results={results.results} electionId={id} />
          </TabsContent>

          <TabsContent value="turnout" className="space-y-6">
            <VoterTurnout electionId={id} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Results Not Available</CardTitle>
            <CardDescription>The results for this election are not available yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-200">
              Results will be published after the election ends or when the administrator makes them available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
