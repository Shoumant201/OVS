"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Edit } from 'lucide-react'
import { v4 as uuidv4 } from "uuid"
import type { Option } from "@/app/election/[id]/ballot/page"

interface AddOptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionTitle: string
  onAdd: (option: Option) => void
}

export function AddOptionDialog({ 
  open, 
  onOpenChange, 
  questionTitle,
  onAdd 
}: AddOptionDialogProps) {
  const handleSelectStandardOption = () => {
    const newOption: Option = {
      id: uuidv4(),
      title: "New Option",
    }
    onAdd(newOption)
  }

  const handleSelectWriteInOption = () => {
    const newOption: Option = {
      id: uuidv4(),
      title: "Write-in Option",
      short_description: "Voters can type in a response to the question."
    }
    onAdd(newOption)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-[#00a1ff] text-white p-4 -mx-6 -mt-6 text-xl font-normal">
            Add Option
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h2 className="text-center text-xl font-semibold mb-6">
            What type of option do you want to add to the question{" "}
            <span className="font-bold">{questionTitle}</span>?
          </h2>
          
          <div className="space-y-4">
            <div className="border rounded-md p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-3" />
                <div>
                  <h3 className="font-semibold">Standard Option</h3>
                  <p className="text-sm text-gray-600">A Candidate, Measure, Yes/No, Approve/Disapprove, etc.</p>
                </div>
              </div>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleSelectStandardOption}
              >
                Select
              </Button>
            </div>
            
            <div className="border rounded-md p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <Edit className="h-6 w-6 mr-3" />
                <div>
                  <h3 className="font-semibold">Write-In Option</h3>
                  <p className="text-sm text-gray-600">Voters can type in a response to the question.</p>
                </div>
              </div>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleSelectWriteInOption}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
