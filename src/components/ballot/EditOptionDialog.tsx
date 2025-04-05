"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  CheckCircle,
} from "lucide-react"
import type { Option } from "@/app/election/[id]/ballot/page"

interface EditOptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionTitle: string
  option: Option
  onSave: (option: Option) => void
}

export function EditOptionDialog({ open, onOpenChange, questionTitle, option, onSave }: EditOptionDialogProps) {
  const [editedOption, setEditedOption] = useState<Option>({ ...option })

  const handleSave = () => {
    onSave(editedOption)
  }

  const handleDelete = () => {
    // In a real app, you would call an API to delete the option
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="bg-[#00a1ff] text-white p-4 -mx-6 -mt-6 text-xl font-normal flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Edit Option
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Question</h3>
            <p>{questionTitle}</p>
          </div>

          <div>
            <Label htmlFor="title" className="font-semibold">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              className="mt-1"
              value={editedOption.title}
              onChange={(e) =>
                setEditedOption({
                  ...editedOption,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label htmlFor="short-description" className="font-semibold">
              Short Description
            </Label>
            <Textarea
              id="short-description"
              className="mt-1"
              placeholder="Enter a short description..."
              value={editedOption.short_description || ""}
              onChange={(e) =>
                setEditedOption({
                  ...editedOption,
                  short_description: e.target.value,
                })
              }
            />
            <p className="text-sm text-gray-500 mt-1">Max Length: 200 characters. (200 remaining)</p>
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
                value={editedOption.description || ""}
                onChange={(e) =>
                  setEditedOption({
                    ...editedOption,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Max Length: 5,000 characters. (5000 remaining)</p>
          </div>

          <div>
            <Label className="font-semibold">Photo</Label>
            <div className="mt-1">
              <Button variant="outline" className="w-full h-auto py-2 px-4 justify-start">
                Choose File <span className="text-gray-500 ml-2">No file chosen</span>
              </Button>
              <p className="text-sm text-gray-500 mt-1">Max file size: 2MB. Allowed types: jpg, gif, .png</p>
            </div>
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

