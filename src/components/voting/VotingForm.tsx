"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, Bell } from "lucide-react"
import { submitVote, checkUserVoteStatus, setElectionReminder, verifyUserPassword } from "@/services/api/Authentication"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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

interface VotingFormProps {
  electionId: number | string
  questions: Question[]
  candidates: Record<number, Candidate[]>
  electionStatus: string
  startDate: string
}

export function VotingForm({ electionId, questions, candidates, electionStatus, startDate }: VotingFormProps) {
  const router = useRouter()
  const [selections, setSelections] = useState<Record<number, number[]>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settingReminder, setSettingReminder] = useState(false)
  const [reminderSuccess, setReminderSuccess] = useState<string | null>(null)
  const [reminderError, setReminderError] = useState<string | null>(null)

  // Flag to use mock implementation instead of real API
  const [useMockApi, setUseMockApi] = useState(false) // Set to false to use real API by default

  // New state variables for the requested features
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Check if user has already voted in this election
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        setLoading(true)
        const hasAlreadyVoted = await checkUserVoteStatus(electionId)
        setHasVoted(hasAlreadyVoted)
      } catch (error) {
        console.error("Error checking vote status:", error)
      } finally {
        setLoading(false)
      }
    }

    if (electionStatus === "ongoing") {
      checkVoteStatus()
    } else {
      setLoading(false)
    }
  }, [electionId, electionStatus])

  // Initialize selections with empty arrays for each question
  useEffect(() => {
    const initialSelections: Record<number, number[]> = {}
    questions.forEach((question) => {
      initialSelections[question.id] = []
    })
    setSelections(initialSelections)
  }, [questions])

  const handleSingleSelection = (questionId: number, candidateId: number) => {
    if (electionStatus !== "ongoing") return

    setSelections((prev) => ({
      ...prev,
      [questionId]: [candidateId],
    }))
    // Clear error when a selection is made
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const handleMultipleSelection = (questionId: number, candidateId: number, checked: boolean) => {
    if (electionStatus !== "ongoing") return

    setSelections((prev) => {
      const currentSelections = [...(prev[questionId] || [])]
      if (checked) {
        // Add candidateId if it's not already selected
        if (!currentSelections.includes(candidateId)) {
          return {
            ...prev,
            [questionId]: [...currentSelections, candidateId],
          }
        }
      } else {
        // Remove candidateId if it's selected
        return {
          ...prev,
          [questionId]: currentSelections.filter((id) => id !== candidateId),
        }
      }
      return prev
    })

    // Clear error when a selection is made
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateSelections = () => {
    const newErrors: Record<number, string> = {}
    let isValid = true

    questions.forEach((question) => {
      const selectedCandidates = selections[question.id] || []
      const minSelections = question.min_selections || 1
      const maxSelections = question.max_selections || 1

      if (selectedCandidates.length < minSelections) {
        newErrors[question.id] = `Please select at least ${minSelections} option(s)`
        isValid = false
      } else if (selectedCandidates.length > maxSelections) {
        newErrors[question.id] = `Please select no more than ${maxSelections} option(s)`
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleVoteClick = () => {
    if (electionStatus !== "ongoing") return

    if (hasVoted) {
      setSubmitError("You have already voted in this election")
      return
    }

    if (!validateSelections()) {
      return
    }

    // Open password confirmation dialog
    setPasswordDialogOpen(true)
  }

  const handleSubmitVote = async () => {
    if (!password) {
      setPasswordError("Please enter your password")
      return
    }

    try {
      setSubmitting(true)
      setPasswordError("")
      setSubmitError(null)

      // Verify password using the API
      const isPasswordValid = await verifyUserPassword(password)

      if (!isPasswordValid) {
        setPasswordError("Incorrect password")
        setSubmitting(false)
        return
      }

      // Prepare votes data
      const votes = []
      for (const questionId in selections) {
        for (const candidateId of selections[questionId]) {
          votes.push({
            election_id: electionId,
            question_id: Number.parseInt(questionId),
            candidate_id: candidateId,
          })
        }
      }

      // Submit all votes
      const success = await submitVote(electionId, votes)

      if (success) {
        setPasswordDialogOpen(false)
        setSubmitSuccess(true)
        // Redirect to results page after a delay
        setTimeout(() => {
          router.push(`/home/${electionId}/results`)
        }, 3000)
      } else {
        setSubmitError("Failed to submit your vote. Please try again.")
      }
    } catch (error: any) {
      console.error("Error submitting vote:", error)
      setPasswordError("")
      setSubmitError(error.message || "An error occurred while submitting your vote")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetReminder = async () => {
    try {
      // Clear previous states
      setReminderSuccess(null)
      setReminderError(null)
      setSettingReminder(true)

      console.log(`Attempting to set reminder for election ${electionId}`)

      // Use mock implementation or real API based on flag
      if (useMockApi) {
        // Use mock implementation
        await setElectionReminder(electionId)
      } else {
        // Use real API with timeout protection
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request is taking too long. Please try again later.")), 15000),
        )
        await Promise.race([setElectionReminder(electionId), timeoutPromise])
      }

      console.log("Reminder set successfully")

      setReminderSuccess(
        `You will receive an email notification when this election starts on ${new Date(startDate).toLocaleDateString()}`,
      )
    } catch (error: any) {
      console.error("Error in handleSetReminder:", error)
      setReminderError(error.message || "Failed to set reminder. Please try again.")
    } finally {
      setSettingReminder(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Loading voting form...</p>
      </div>
    )
  }

  if (electionStatus === "ongoing" && hasVoted) {
    return (
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <Info className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Already Voted</AlertTitle>
        <AlertDescription className="text-amber-700">
          You have already cast your vote in this election. Each voter can only vote once per election.
          <div className="mt-4">
            <Button onClick={() => router.push(`/elections/${electionId}/results`)}>View Results</Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (submitSuccess) {
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">Vote Submitted Successfully</AlertTitle>
        <AlertDescription className="text-green-700">
          Thank you for voting! Your vote has been recorded. You will be redirected to the results page shortly.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      {reminderSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Reminder Set</AlertTitle>
          <AlertDescription className="text-green-700">{reminderSuccess}</AlertDescription>
        </Alert>
      )}

      {reminderError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{reminderError}</AlertDescription>
        </Alert>
      )}

      {/* Debug toggle for mock API - you can remove this in production */}
      <div className="bg-gray-100 border border-gray-200 rounded-md p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Info className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-700">Using {useMockApi ? "mock" : "real"} API for reminders</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setUseMockApi(!useMockApi)} className="text-xs">
          Switch to {useMockApi ? "real" : "mock"} API
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-blue-800">Ballot Questions</h3>
            <p className="text-blue-700 text-sm mt-1">
              {electionStatus === "ongoing"
                ? "Please select your preferred candidate(s) for each question. You can only vote once in this election."
                : electionStatus === "scheduled"
                  ? "This election has not started yet. You can set a reminder to be notified when it begins."
                  : "This election has ended. You can view the results."}
            </p>
          </div>
        </div>
      </div>

      {questions.map((question) => {
        const questionCandidates = candidates[question.id] || []
        const isMultipleChoice = (question.max_selections || 1) > 1
        const error = errors[question.id]

        return (
          <Card key={question.id} className={error ? "border-red-300" : ""}>
            <CardHeader>
              <CardTitle>{question.title}</CardTitle>
              {question.description && <CardDescription>{question.description}</CardDescription>}
              {isMultipleChoice && (
                <CardDescription className="text-blue-600">
                  Select between {question.min_selections || 1} and {question.max_selections || 1} options
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

              {isMultipleChoice ? (
                <div className="space-y-3">
                  {questionCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`candidate-${candidate.id}`}
                        checked={(selections[question.id] || []).includes(candidate.id)}
                        onCheckedChange={(checked) =>
                          handleMultipleSelection(question.id, candidate.id, checked as boolean)
                        }
                        disabled={electionStatus !== "ongoing"}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`candidate-${candidate.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                            electionStatus !== "ongoing" ? "text-gray-500" : ""
                          }`}
                        >
                          {candidate.candidate_name}
                        </Label>
                        {candidate.candidate_bio && (
                          <p
                            className={`text-sm ${electionStatus !== "ongoing" ? "text-gray-400" : "text-muted-foreground"}`}
                          >
                            {candidate.candidate_bio}
                          </p>
                        )}
                        {/* Display candidate photo if available */}
                        {candidate.photo && (
                          <div className="mt-2">
                            <Image
                              src={candidate.photo || "/placeholder.svg"}
                              alt={candidate.candidate_name}
                              width={100}
                              height={100}
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={(selections[question.id] || [])[0]?.toString()}
                  onValueChange={(value) => handleSingleSelection(question.id, Number.parseInt(value))}
                  className="space-y-3"
                  disabled={electionStatus !== "ongoing"}
                >
                  {questionCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-start space-x-2">
                      <RadioGroupItem
                        value={candidate.id.toString()}
                        id={`candidate-${candidate.id}`}
                        disabled={electionStatus !== "ongoing"}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`candidate-${candidate.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                            electionStatus !== "ongoing" ? "text-gray-500" : ""
                          }`}
                        >
                          {candidate.candidate_name}
                        </Label>
                        {candidate.candidate_bio && (
                          <p
                            className={`text-sm ${electionStatus !== "ongoing" ? "text-gray-400" : "text-muted-foreground"}`}
                          >
                            {candidate.candidate_bio}
                          </p>
                        )}
                        {/* Display candidate photo if available */}
                        {candidate.photo && (
                          <div className="mt-2">
                            <Image
                              src={candidate.photo || "/placeholder.svg"}
                              alt={candidate.candidate_name}
                              width={100}
                              height={100}
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end mt-6">
        {electionStatus === "ongoing" ? (
          <Button
            onClick={handleVoteClick}
            disabled={submitting || hasVoted}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {submitting ? "Submitting..." : "Submit Vote"}
          </Button>
        ) : electionStatus === "scheduled" ? (
          <Button
            onClick={handleSetReminder}
            disabled={settingReminder}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Bell className="mr-2 h-4 w-4" />
            {settingReminder ? "Setting Reminder..." : "Remind Me When It Starts"}
          </Button>
        ) : (
          <Button
            onClick={() => router.push(`/home/${electionId}/results`)}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            size="lg"
          >
            View Results
          </Button>
        )}
      </div>

      {/* Password Confirmation Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              Please enter your password to confirm your vote. This helps ensure the security of the voting process.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={passwordError ? "border-red-500" : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting) {
                    handleSubmitVote()
                  }
                }}
              />
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitVote} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
