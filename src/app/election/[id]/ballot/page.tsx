"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { List, Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ElectionLayout } from "@/components/election/ElectionLayout"
import { AddQuestionDialog } from "@/components/ballot/AddQuestionDialog"
import { EditQuestionDialog } from "@/components/ballot/EditQuestionDialog"
import { AddOptionDialog } from "@/components/ballot/AddOptionDialog"
import { EditOptionDialog } from "@/components/ballot/EditOptionDialog"
import { BallotQuestion } from "@/components/ballot/BallotQuestion"
import { getElectionById } from "@/services/api/Authentication"
import type { Election } from "@/components/dashboard/ElectionCard"
import withAuth from "@/hoc/withAuth"

export interface Question {
  id: string
  title: string
  type: "multiple" | "ranked"
  description?: string
  options: Option[]
  randomize?: boolean
  min_selections?: number
  max_selections?: number
}

export interface Option {
  id: string
  title: string
  short_description?: string
  description?: string
  photo?: string
}

function BallotPage() {
  const params = useParams()
  const id = params.id as string
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])

  // Dialog states
  const [addQuestionOpen, setAddQuestionOpen] = useState(false)
  const [editQuestionOpen, setEditQuestionOpen] = useState(false)
  const [addOptionOpen, setAddOptionOpen] = useState(false)
  const [editOptionOpen, setEditOptionOpen] = useState(false)

  // Selected items for editing
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)

  useEffect(() => {
    const fetchElection = async () => {
      try {
        console.log("Fetching election with ID ballot:", id)
        const data = await getElectionById(id)
        if (data) {
          console.log("Election data:", data)
          setElection(data)
          // In a real app, you would fetch questions from an API
          setQuestions([])
        }
      } catch (error) {
        console.error("Error fetching election:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchElection()
  }, [id])

  const handleAddQuestion = (question: Question) => {
    setQuestions([...questions, question])
    setAddQuestionOpen(false)
  }

  const handleEditQuestion = (updatedQuestion: Question) => {
    setQuestions(questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)))
    setEditQuestionOpen(false)
    setSelectedQuestion(null)
  }

  const handleAddOption = (option: Option) => {
    if (selectedQuestion) {
      const updatedQuestion = {
        ...selectedQuestion,
        options: [...selectedQuestion.options, option],
      }

      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQuestion : q)))

      setSelectedQuestion(updatedQuestion)
      setAddOptionOpen(false)
    }
  }

  const handleEditOption = (updatedOption: Option) => {
    if (selectedQuestion) {
      const updatedOptions = selectedQuestion.options.map((o) => (o.id === updatedOption.id ? updatedOption : o))

      const updatedQuestion = {
        ...selectedQuestion,
        options: updatedOptions,
      }

      setQuestions(questions.map((q) => (q.id === selectedQuestion.id ? updatedQuestion : q)))

      setSelectedQuestion(updatedQuestion)
      setEditOptionOpen(false)
      setSelectedOption(null)
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
        </div>
      </div>

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
        />
      )}
    </ElectionLayout>
  )
}

export default withAuth(BallotPage)

