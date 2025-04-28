"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { List, HelpCircle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Question } from "@/app/election/[id]/ballot/page"

interface AddQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (question: Question) => void
}

export function AddQuestionDialog({ open, onOpenChange, onAdd }: AddQuestionDialogProps) {
  const handleSelectMultipleChoice = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      title: "New Multiple Choice Question",
      type: "multiple",
      options: [],
      min_selections: 1,
      max_selections: 1,
    }
    onAdd(newQuestion)
  }

  const handleSelectRankedChoice = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      title: "New Ranked Choice Question",
      type: "ranked",
      options: [],
    }
    onAdd(newQuestion)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-[#00a1ff] text-white p-4 -mx-6 -mt-6 text-xl font-normal">
            Add Ballot Question
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h2 className="text-center text-xl font-semibold mb-6">
            What type of question would you like to add to the ballot?
          </h2>

          <div className="space-y-4">
            <div className="border rounded-md p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <List className="h-6 w-6 mr-3" />
                <div>
                  <h3 className="font-semibold">Multiple Choice</h3>
                  <p className="text-sm text-gray-600">Voters select one or more options from a list</p>
                </div>
              </div>
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleSelectMultipleChoice}>
                Select
              </Button>
            </div>

            <div className="border rounded-md p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <div className="flex flex-col items-center mr-3 text-xs font-bold">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold">Ranked Choice (IRV)</h3>
                    <HelpCircle className="h-4 w-4 ml-1 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Voters rank options by preference. Results will be determined using Instant Run-off Voting.{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      Learn More »
                    </a>
                  </p>
                </div>
              </div>
              <Button className="bg-green-500 hover:bg-green-600" onClick={handleSelectRankedChoice}>
                Select
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

