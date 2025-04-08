"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { List, Upload, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ElectionLayout } from "@/components/election/ElectionLayout"
import { AddQuestionDialog } from "@/components/ballot/AddQuestionDialog"
import { EditQuestionDialog } from "@/components/ballot/EditQuestionDialog"
import { AddOptionDialog } from "@/components/ballot/AddOptionDialog"
import { EditOptionDialog } from "@/components/ballot/EditOptionDialog"
import { BallotQuestion } from "@/components/ballot/BallotQuestion"
import { getElectionById } from "@/services/api/Authentication"
import {
  getQuestionsByElectionId,
  getCandidatesByQuestionId,
  createQuestion as apiCreateQuestion,
  updateQuestion as apiUpdateQuestion,
  deleteQuestion as apiDeleteQuestion,
  createCandidate as apiCreateCandidate,
  updateCandidate as apiUpdateCandidate,
  deleteCandidate as apiDeleteCandidate,
} from "@/services/api/ballot"
import type { Election } from "@/components/dashboard/ElectionCard"
import withAuth from "@/hoc/withAuth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NotificationDialog } from "@/components/ui/notification-dailog"
import AxiosInstance from "@/services/axiosInstance"

export interface Question {
  id: string
  title: string
  type?: "multiple" | "ranked"
  description?: string
  options: Option[]
  randomize?: boolean
  shuffle?: boolean
  min_selections?: number
  max_selections?: number
  election_id?: string
}

export interface Option {
  id: string
  title?: string
  candidate_name?: string
  short_description?: string
  candidate_bio?: string
  description?: string
  image?: string | File // Changed from photo to image
  question_id?: string
}

function BallotPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [addQuestionOpen, setAddQuestionOpen] = useState(false)
  const [editQuestionOpen, setEditQuestionOpen] = useState(false)
  const [addOptionOpen, setAddOptionOpen] = useState(false)
  const [editOptionOpen, setEditOptionOpen] = useState(false)

  // Notification dialog state
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notification, setNotification] = useState({
    title: "",
    description: "",
    variant: "success" as "success" | "error",
  })

  // Selected items for editing
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)

  // Show notification dialog
  const showNotification = (title: string, description: string, variant: "success" | "error") => {
    setNotification({ title, description, variant })
    setNotificationOpen(true)
  }

  // Check for ID in localStorage if not in params
  useEffect(() => {
    if (id === "undefined" || !id) {
      const storedId = localStorage.getItem("currentElectionId")
      if (storedId) {
        console.log("Ballot page - Retrieved election ID from localStorage:", storedId)
        router.replace(`/election/${storedId}/ballot`)
      } else {
        console.error("No election ID available in ballot page")
        router.push("/dashboard")
      }
    }
  }, [id, router])

  // Fetch election data
  useEffect(() => {
    const fetchElection = async () => {
      try {
        // Use the ID from params or from localStorage as a fallback
        const electionId = id && id !== "undefined" ? id : localStorage.getItem("currentElectionId")

        if (!electionId) {
          console.error("No election ID available for fetching")
          return
        }

        console.log("Ballot page - Fetching election with ID:", electionId)
        const data = await getElectionById(electionId)

        if (data) {
          console.log("Ballot page - Election data loaded:", data)
          setElection(data)

          // Fetch questions for this election
          fetchQuestions(electionId)
        } else {
          console.error("Election not found in ballot page")
          setError("Election not found")
        }
      } catch (error: any) {
        console.error("Error fetching election:", error)
        setError("Failed to load election data")
      } finally {
        setLoading(false)
      }
    }

    fetchElection()
  }, [id])

  // Fetch questions and their options
  const fetchQuestions = async (electionId: string) => {
    try {
      setLoading(true)
      const questionsData = await getQuestionsByElectionId(electionId)
      console.log("Questions data:", questionsData)

      // Check if questionsData is an array
      if (!Array.isArray(questionsData)) {
        console.error("Questions data is not an array:", questionsData)
        setQuestions([])
        setError("Invalid questions data format")
        setLoading(false)
        return
      }

      // If questionsData is empty, just set empty questions
      if (questionsData.length === 0) {
        setQuestions([])
        setLoading(false)
        return
      }

      // For each question, fetch its options/candidates
      const questionsWithOptions = await Promise.all(
        questionsData.map(async (question: Question) => {
          try {
            if (!question || !question.id) {
              console.error("Invalid question object:", question)
              return {
                id: "temp-" + Math.random().toString(36).substr(2, 9),
                title: "Error loading question",
                options: [],
                type: "multiple" as const,
              }
            }

            const options = await getCandidatesByQuestionId(question.id)

            // Map the API response to our frontend model
            const mappedOptions = options.map((option: any) => ({
              ...option,
              // Map image to photo for frontend consistency
              photo: option.image || null,
              title: option.candidate_name,
              short_description: option.candidate_bio,
            }))

            return {
              ...question,
              options: mappedOptions || [],
              // Map backend fields to our frontend model
              randomize: question.shuffle,
              type: "multiple" as const, // Explicitly type as "multiple"
            }
          } catch (error: any) {
            console.error(`Error fetching options for question ${question.id}:`, error)
            return {
              ...question,
              options: [],
              randomize: question.shuffle,
              type: "multiple" as const,
            }
          }
        }),
      )

      setQuestions(questionsWithOptions)
    } catch (error: any) {
      console.error("Error fetching questions:", error)
      setError("Failed to load ballot questions")
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  // Add a function to handle file uploads
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)

      // Log what we're uploading
      console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type)

      // Make the API call to upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Upload response:", data)

      // Return the URL of the uploaded file
      return data.url
    } catch (error: any) {
      console.error("Error uploading file:", error)
      showNotification("Error", "Failed to upload file: " + error.message, "error")
      return null
    }
  }

  // Fix the issue with adding questions
  const handleAddQuestion = async (question: Question) => {
    try {
      if (!election) return

      console.log("Adding question:", question)
      console.log("Election ID:", election.id)

      // Map our frontend model to backend fields
      const questionData = {
        election_id: election.id,
        title: question.title,
        description: question.description || "",
        shuffle: question.randomize || false,
      }

      console.log("Sending question data:", questionData)

      const newQuestion = await apiCreateQuestion(questionData)
      console.log("New question response:", newQuestion)

      if (!newQuestion) {
        throw new Error("Failed to create question - no data returned from API")
      }

      // Add the new question to our state with proper typing
      const newQuestionWithOptions: Question = {
        ...newQuestion,
        id: newQuestion.id || `temp-${Date.now()}`,
        options: [],
        type: "multiple" as const,
        randomize: newQuestion.shuffle,
      }

      setQuestions([...questions, newQuestionWithOptions])
      setAddQuestionOpen(false)
      showNotification("Success", "Question added successfully", "success")
    } catch (error: any) {
      console.error("Error adding question:", error)

      // Show more detailed error message
      let errorMessage = "Failed to add question"
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      showNotification("Error", errorMessage, "error")
    }
  }

  const handleEditQuestion = async (updatedQuestion: Question) => {
    try {
      // Map our frontend model to backend fields
      await apiUpdateQuestion(updatedQuestion.id, {
        title: updatedQuestion.title,
        description: updatedQuestion.description,
        shuffle: updatedQuestion.randomize,
      })

      // Update the question in our state
      setQuestions(
        questions.map((q) =>
          q.id === updatedQuestion.id
            ? {
                ...updatedQuestion,
                shuffle: updatedQuestion.randomize,
              }
            : q,
        ),
      )

      setEditQuestionOpen(false)
      setSelectedQuestion(null)

      showNotification("Success", "Question updated successfully", "success")
    } catch (error: any) {
      console.error("Error updating question:", error)
      showNotification("Error", "Failed to update question", "error")
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await apiDeleteQuestion(questionId)

      // Remove the question from our state
      setQuestions(questions.filter((q) => q.id !== questionId))

      setEditQuestionOpen(false)
      setSelectedQuestion(null)

      showNotification("Success", "Question deleted successfully", "success")
    } catch (error: any) {
      console.error("Error deleting question:", error)
      showNotification("Error", "Failed to delete question", "error")
    }
  }

  // Fix the handleAddOption function to ensure non-undefined values
  const handleAddOption = async (option: Option) => {
    if (!selectedQuestion) return

    try {
      let photoUrl = option.image
      if (option.image instanceof File) {
        photoUrl = await uploadFile(option.image)
        if (!photoUrl) {
          console.error("File upload failed for add option.")
          return
        }
      }

      // Map our frontend model to backend fields
      const newOption = await apiCreateCandidate({
        question_id: selectedQuestion.id,
        candidate_name: option.title || option.candidate_name || "New Option",
        candidate_bio: option.short_description || option.candidate_bio || "",
        description: option.description || "",
        photo: photoUrl as string,
      })

      // Add the new option to the selected question
      const updatedQuestion = {
        ...selectedQuestion,
        options: [
          ...selectedQuestion.options,
          {
            ...newOption,
            title: newOption.candidate_name,
            short_description: newOption.candidate_bio,
            // Map image to photo for frontend consistency
            photo: newOption.image || null,
          },
        ],
      }

      // Update the questions state
      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQuestion : q)))
      setSelectedQuestion(updatedQuestion)
      setAddOptionOpen(false)

      showNotification("Success", "Option added successfully", "success")
    } catch (error: any) {
      console.error("Error adding option:", error)
      showNotification("Error", error.message || "Failed to add option", "error")
    }
  }

  // Fix the handleEditOption function to ensure non-undefined values
  const handleEditOption = async (updatedOption: Option) => {
    if (!selectedQuestion) return

    try {
      let imageUrl = updatedOption.image

      // Only attempt to upload if it's a File object
      if (updatedOption.image instanceof File) {
        try {
          imageUrl = await uploadFile(updatedOption.image)
          console.log("Upload successful, new image URL:", imageUrl)
        } catch (error: any) {
          console.error("File upload failed for edit option:", error)
          // Continue with save but without the new image
          // Use the existing image URL if available
          imageUrl = selectedOption?.image || null
          showNotification("Warning", "Image upload failed, but other changes will be saved.", "error")
        }
      }

      // Map our frontend model to backend fields
      await apiUpdateCandidate(updatedOption.id, {
        candidate_name: updatedOption.title || updatedOption.candidate_name || "Option",
        candidate_bio: updatedOption.short_description || updatedOption.candidate_bio || "",
        description: updatedOption.description || "",
        image: imageUrl as string, // Changed from photo to image
      })

      // Update the option in the selected question
      const updatedOptions = selectedQuestion.options.map((o) =>
        o.id === updatedOption.id
          ? {
              ...updatedOption,
              image: imageUrl, // Use the updated image URL
              candidate_name: updatedOption.title || updatedOption.candidate_name || "Option",
              candidate_bio: updatedOption.short_description || updatedOption.candidate_bio || "",
            }
          : o,
      )

      const updatedQuestion = {
        ...selectedQuestion,
        options: updatedOptions,
      }

      // Update the questions state
      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQuestion : q)))
      setSelectedQuestion(updatedQuestion)
      setEditOptionOpen(false)
      setSelectedOption(null)

      showNotification("Success", "Option updated successfully", "success")
    } catch (error: any) {
      console.error("Error updating option:", error)
      showNotification("Error", error.message || "Failed to update option", "error")
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    if (!selectedQuestion) return

    try {
      await apiDeleteCandidate(optionId)

      // Remove the option from the selected question
      const updatedQuestion = {
        ...selectedQuestion,
        options: selectedQuestion.options.filter((o) => o.id !== optionId),
      }

      // Update the questions state
      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQuestion : q)))
      setSelectedQuestion(updatedQuestion)
      setEditOptionOpen(false)
      setSelectedOption(null)

      showNotification("Success", "Option deleted successfully", "success")
    } catch (error: any) {
      console.error("Error deleting option:", error)
      showNotification("Error", "Failed to delete option", "error")
    }
  }

  const openAddOption = (question: Question) => {
    setSelectedQuestion(question)
    setAddOptionOpen(true)
  }

  const openEditOption = (question: Question, option: Option) => {
    setSelectedQuestion(question)
    setSelectedOption(option)
    setEditOptionOpen(true)
  }

  const openEditQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setEditQuestionOpen(true)
  }

  // Add this function to your BallotPage component
  const testApi = async () => {
    try {
      if (!election) return

      // Test direct API call
      console.log("Testing direct API call...")
      const electionId = election.id

      // Log the URL we're calling
      const url = `/elections/getAllQuestions/${electionId}`
      console.log("API URL:", url)

      // Make the call with axios directly
      const response = await AxiosInstance.get(url)
      console.log("Direct API response:", response)

      // Check what's in the response
      console.log("Response data type:", typeof response.data)
      console.log("Is array?", Array.isArray(response.data))
      console.log("Response data:", response.data)

      // If it's an object, check its keys
      if (typeof response.data === "object" && !Array.isArray(response.data)) {
        console.log("Object keys:", Object.keys(response.data))
      }

      showNotification("API Test", "Check console for results", "success")
    } catch (error: any) {
      console.error("API test error:", error)
      showNotification("API Test Failed", error.message || "Unknown error", "error")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!election) {
    return <div className="flex items-center justify-center h-screen">Election not found</div>
  }

  return (
    <ElectionLayout election={election} activePage="ballot">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <List className="mr-2 h-5 w-5" />
          <h2 className="text-xl font-semibold">Ballot</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1" onClick={() => {}}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
            onClick={() => setAddQuestionOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
          {/* Add a test button to your UI */}
          <Button variant="outline" className="ml-2" onClick={testApi}>
            Test API
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <List className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Build Your Ballot</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first question.</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="flex items-center gap-1" onClick={() => {}}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
              onClick={() => setAddQuestionOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <BallotQuestion
              key={question.id}
              question={question}
              onAddOption={() => openAddOption(question)}
              onEditOption={(option) => openEditOption(question, option)}
              onEditQuestion={() => openEditQuestion(question)}
              onDeleteQuestion={() => handleDeleteQuestion(question.id)}
              onDeleteOption={(optionId) => handleDeleteOption(optionId)}
            />
          ))}
        </div>
      )}

      {/* Add Question Dialog */}
      <AddQuestionDialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen} onAdd={handleAddQuestion} />

      {/* Edit Question Dialog */}
      {selectedQuestion && (
        <EditQuestionDialog
          open={editQuestionOpen}
          onOpenChange={setEditQuestionOpen}
          question={selectedQuestion}
          onSave={handleEditQuestion}
          onDelete={() => handleDeleteQuestion(selectedQuestion.id)}
        />
      )}

      {/* Add Option Dialog */}
      {selectedQuestion && (
        <AddOptionDialog
          open={addOptionOpen}
          onOpenChange={setAddOptionOpen}
          questionTitle={selectedQuestion.title}
          onAdd={handleAddOption}
        />
      )}

      {/* Edit Option Dialog */}
      {selectedQuestion && selectedOption && (
        <EditOptionDialog
          open={editOptionOpen}
          onOpenChange={setEditOptionOpen}
          questionTitle={selectedQuestion.title}
          option={selectedOption}
          onSave={handleEditOption}
          onDelete={() => handleDeleteOption(selectedOption.id)}
        />
      )}

      {/* Notification Dialog */}
      <NotificationDialog
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        title={notification.title}
        description={notification.description}
        variant={notification.variant}
      />
    </ElectionLayout>
  )
}

export default withAuth(BallotPage)
