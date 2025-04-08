"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Type, Code, CheckCircle } from 'lucide-react'
import type { Option } from "@/app/election/[id]/ballot/page"

interface EditOptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionTitle: string
  option: Option
  onSave: (option: Option) => void
  onDelete: () => void
}

export function EditOptionDialog({
  open,
  onOpenChange,
  questionTitle,
  option,
  onSave,
  onDelete,
}: EditOptionDialogProps) {
  const [editedOption, setEditedOption] = useState<Option>({
    ...option,
    // Ensure we have both title and candidate_name for compatibility
    title: option.title || option.candidate_name || "",
    candidate_name: option.candidate_name || option.title || "",
    short_description: option.short_description || option.candidate_bio || "",
    candidate_bio: option.candidate_bio || option.short_description || "",
    // Use image field
    image: option.image || "",
  })

  // Add file upload functionality to the EditOptionDialog component
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Add a function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploadError(null) // Clear any previous errors
    }
  }

  // Update the handleSave function to include the file
  const handleSave = async () => {
    // If there's a selected file, try to upload it
    if (selectedFile) {
      setIsUploading(true)
      setUploadError(null)

      try {
        // Create a FormData object to send the file
        const formData = new FormData()
        formData.append("file", selectedFile)

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

        // Update the image URL with the uploaded file URL
        onSave({
          ...editedOption,
          // Keep both fields in sync and ensure they're strings
          title: editedOption.title || "",
          candidate_name: editedOption.title || "",
          short_description: editedOption.short_description || "",
          candidate_bio: editedOption.short_description || "",
          image: data.url, // Use the updated image URL
        })
      } catch (error: any) {
        console.error("Error uploading file:", error)
        setUploadError(error.message || "Failed to upload file. Please try again.")
        setIsUploading(false)
        // Don't save if the upload failed
        return
      }
    } else {
      // No file selected, just save the edited option
      onSave({
        ...editedOption,
        // Keep both fields in sync and ensure they're strings
        title: editedOption.title || "",
        candidate_name: editedOption.title || "",
        short_description: editedOption.short_description || "",
        candidate_bio: editedOption.short_description || "",
      })
    }
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
                  candidate_name: e.target.value,
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
                  candidate_bio: e.target.value,
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
              <input
                type="file"
                aria-label="Image"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-semibold
        file:bg-gray-50 file:text-gray-700
        hover:file:bg-gray-100"
              />
              {selectedFile && <p className="text-sm text-green-600 mt-1">Selected: {selectedFile.name}</p>}
              {!selectedFile && editedOption.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Current photo:</p>
                  <img
                    src={editedOption.image || "/placeholder.svg"}
                    alt="Option"
                    className="mt-1 h-20 w-auto object-cover rounded-md"
                  />
                </div>
              )}
              {uploadError && <p className="text-sm text-red-500 mt-1">Error: {uploadError}</p>}
              <p className="text-sm text-gray-500 mt-1">Max file size: 2MB. Allowed types: jpg, gif, .png</p>
              <p className="text-sm text-amber-500 mt-1">
                Note: If image upload fails, you can still save the option without a new image.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            {uploadError && (
              <Button
                variant="outline"
                onClick={() => {
                  // Skip the file upload and just save the text fields
                  onSave({
                    ...editedOption,
                    title: editedOption.title || "",
                    candidate_name: editedOption.title || "",
                    short_description: editedOption.short_description || "",
                    candidate_bio: editedOption.short_description || "",
                    // Keep the existing image
                    image: editedOption.image || "",
                  })
                }}
              >
                Skip Upload & Save
              </Button>
            )}
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSave}
              disabled={(editedOption.title || "").trim() === "" || isUploading}
            >
              {isUploading ? "Uploading..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
