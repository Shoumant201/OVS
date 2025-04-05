"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Type,
  Code,
} from "lucide-react"
import type { Question } from "@/app/election/[id]/ballot/page"

interface EditQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: Question
  onSave: (question: Question) => void
}

export function EditQuestionDialog({ open, onOpenChange, question, onSave }: EditQuestionDialogProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question>({ ...question })

  const handleSave = () => {
    onSave(editedQuestion)
  }

  const handleDelete = () => {
    // In a real app, you would call an API to delete the question
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-[#00a1ff] text-white p-4 -mx-6 -mt-6 text-xl font-normal">
            Edit Ballot Question
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Type</h3>
            <p>
              {editedQuestion.type === "multiple"
                ? "Multiple Choice - Voters can select one or many options"
                : "Ranked Choice - Voters rank options by preference"}
            </p>
          </div>

          {editedQuestion.type === "multiple" && (
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>Voters can select a</span>
                <span className="font-semibold">maximum</span>
                <span>of</span>
                <Input
                  type="number"
                  className="w-20 h-8"
                  value={editedQuestion.max_selections}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      max_selections: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
                <span>and a</span>
                <span className="font-semibold">minimum</span>
                <span>of</span>
                <Input
                  type="number"
                  className="w-20 h-8"
                  value={editedQuestion.min_selections}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      min_selections: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
                <span>option(s)</span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="title" className="font-semibold">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              className="mt-1"
              value={editedQuestion.title}
              onChange={(e) =>
                setEditedQuestion({
                  ...editedQuestion,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-semibold">
              Description
            </Label>
            <div className="border rounded-md mt-1 overflow-hidden">
              <div className="flex items-center gap-1 p-1 border-b bg-gray-50">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Underline className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlignRight className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Link className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Type className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Code className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                id="description"
                className="border-0 focus-visible:ring-0 min-h-[200px]"
                placeholder="Enter description here..."
                value={editedQuestion.description || ""}
                onChange={(e) =>
                  setEditedQuestion({
                    ...editedQuestion,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Max Length: 5,000 characters. (5000 remaining)</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Randomize options?</h3>
              <p className="text-sm text-gray-600">Randomly sorts the list of options on the ballot for each voter</p>
            </div>
            <Switch
              checked={editedQuestion.randomize || false}
              onCheckedChange={(checked) =>
                setEditedQuestion({
                  ...editedQuestion,
                  randomize: checked,
                })
              }
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button className="bg-green-500 hover:bg-green-600" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

