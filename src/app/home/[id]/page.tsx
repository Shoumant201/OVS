"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, Users, CheckSquare, Clock, ArrowLeft, Share2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DateTime } from "luxon"
import axiosInstance from "@/services/axiosInstance"
import ENDPOINTS from "@/services/Endpoints"

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
    // Additional fields for the detail view
    location?: string
    eligibility?: string[]
    organizer?: {
      name: string
      email: string
      phone: string
    }
  }
  
  interface Question {
    id: number
    title: string
    description?: string
    type: string
    election_id: number
    created_at: string
    updated_at: string
    // Additional fields
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
    created_at: string
    updated_at: string
  }

export default function ElectionDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const [election, setElection] = useState<Election | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [candidates, setCandidates] = useState<Record<number, Candidate[]>>({}) // Keyed by question_id
    const [loading, setLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState<string>("")
    const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate fetching election details from API
    const fetchElectionData = async () => {
        setLoading(true)
        try {
          const urlElection = ENDPOINTS.ELECTION.getElectionById.replace(":id", id)
          const response = await axiosInstance.get(urlElection)
          const electionData = response.data;
          //console.log(response.data)
          setElection(electionData)
  
          const urlQuestion = ENDPOINTS.ELECTION.getQuestionsByElectionId.replace(":id", id)
          const question = await axiosInstance.get(urlQuestion)
          //console.log(question.data)
          const questionsData = question.data;
  
          setQuestions(questionsData)
  
          // Fetch candidates for each question
          const candidatesMap: Record<number, Candidate[]> = {}
  
          const urlCandidate = ENDPOINTS.ELECTION.getCandidatesByQuestionId.replace(":id", id)
          const candidate = await axiosInstance.get(urlCandidate)
          console.log(candidate.data)
          const candidatesData = candidate.data;
  
          setCandidates(candidatesData)
        } catch (error) {
          console.error("Error fetching election data:", error)
        } finally {
          setLoading(false)
        }
      }

    fetchElectionData()
  }, [id])

  useEffect(() => {
    if (!election) return

    // Calculate time remaining and progress
    const updateTimeAndProgress = () => {
      const now = DateTime.now()
      const start = DateTime.fromISO(election.start_date)
      const end = DateTime.fromISO(election.end_date)

      let timeString = ""
      let progressValue = 0

      if (now < start) {
        // Scheduled
        const diff = start.diff(now, ["days", "hours", "minutes"]).toObject()
        timeString = `Starts in ${Math.floor(diff.days || 0)} days, ${Math.floor(diff.hours || 0)} hours`
        progressValue = 0
      } else if (now > end) {
        // Finished
        timeString = "Election has ended"
        progressValue = 100
      } else {
        // Ongoing
        const totalDuration = end.diff(start, "milliseconds").milliseconds
        const elapsed = now.diff(start, "milliseconds").milliseconds
        progressValue = Math.min(100, Math.round((elapsed / totalDuration) * 100))

        const diff = end.diff(now, ["days", "hours", "minutes"]).toObject()
        timeString = `Ends in ${Math.floor(diff.days || 0)} days, ${Math.floor(diff.hours || 0)} hours`
      }

      setTimeRemaining(timeString)
      setProgress(progressValue)
    }

    updateTimeAndProgress()
    const interval = setInterval(updateTimeAndProgress, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [election])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading election details...</p>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Election not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => router.push("/home")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Elections
        </Button>

        {/* Election Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <h2 className="text-2xl font-bold">{election.title}</h2>
                <Badge className={`${getStatusColor(election.status)} text-sm px-3 py-1`}>{election.status}</Badge>
              </div>
              <p className="text-gray-600 mb-4">Organized by: {election.organizer?.name || "University"}</p>
              <p className="text-gray-700 mb-6">{election.description}</p>
              {/* Update the election stats display to use the correct field names */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <div>
                    <div>Start: {DateTime.fromISO(election.start_date).toFormat("LLL dd, yyyy, h:mm a")}</div>
                    <div>End: {DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{election.voters} eligible voters</span>
                </div>
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  <span>{election.ballot_questions} ballot questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Election Progress */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Election Status
            </h3>
            <span className="text-gray-600">{timeRemaining}</span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-[#26C6B0]" />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{DateTime.fromISO(election.start_date).toFormat("LLL dd, yyyy")}</span>
            <span>{DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Ballot Questions */}
            <div className="bg-white rounded-lg border">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Ballot Questions</h3>
              </div>
              <div className="p-6">
                {questions.map((question, index) => (
                  <div key={question.id} className={index !== 0 ? "mt-6 pt-6 border-t" : ""}>
                    <h4 className="font-semibold mb-2">
                      {index + 1}. {question.title}
                      <span className="ml-2 text-sm font-normal text-gray-500">({question.type})</span>
                    </h4>
                    {question.description && <p className="text-gray-600 mb-3 text-sm">{question.description}</p>}
                    <ul className="space-y-2 pl-6">
                      {candidates[question.id]?.map((candidate) => (
                        <li key={candidate.id} className="text-gray-700">
                          • {candidate.candidate_name}
                          {candidate.candidate_bio && (
                            <span className="text-gray-500 text-sm ml-2">({candidate.candidate_bio})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex justify-end">
                  {/* Update the button text based on status */}
                  <Button disabled={election.status.toLowerCase() !== "ongoing"}>
                    {election.status.toLowerCase() === "ongoing"
                      ? "Vote Now"
                      : election.status.toLowerCase() === "scheduled"
                        ? "Not Open Yet"
                        : "Voting Closed"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Election Details */}
            <div className="bg-white rounded-lg border">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Election Details</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Location</h4>
                  <p>{election.location || "Online"}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Eligibility</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {election.eligibility?.map((item, index) => (
                      <li key={index} className="text-gray-600">
                        {item}
                      </li>
                    )) || <li className="text-gray-600">All registered voters are eligible to participate</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Organizer Contact</h4>
                  <p className="text-gray-600">{election.organizer?.name || "Election Administration"}</p>
                  <p className="text-gray-600">{election.organizer?.email || "contact@electionrunner.com"}</p>
                  <p className="text-gray-600">{election.organizer?.phone || "(555) 123-4567"}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Election
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Button>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg border">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-semibold">Important Dates</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Registration Deadline</h4>
                    <p className="text-gray-600">
                      {DateTime.fromISO(election.start_date).minus({ days: 2 }).toFormat("LLL dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Voting Opens</h4>
                    <p className="text-gray-600">
                      {DateTime.fromISO(election.start_date).toFormat("LLL dd, yyyy, h:mm a")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Voting Closes</h4>
                    <p className="text-gray-600">
                      {DateTime.fromISO(election.end_date).toFormat("LLL dd, yyyy, h:mm a")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Results Announced</h4>
                    <p className="text-gray-600">
                      {DateTime.fromISO(election.end_date).plus({ days: 1 }).toFormat("LLL dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
