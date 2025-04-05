"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { List, Info, Paperclip, Plus, MoreHorizontal, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Question, Option } from "@/app/election/[id]/ballot/page"

interface BallotQuestionProps {
  question: Question
  onAddOption: () => void
  onEditOption: (option: Option) => void
  onEditQuestion: () => void
}

export function BallotQuestion({ question, onAddOption, onEditOption, onEditQuestion }: BallotQuestionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{question.title}</h3>
          <p className="text-sm text-gray-600">{question.type === "multiple" ? "Multiple Choice" : "Ranked Choice"}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditQuestion}>Edit Question</DropdownMenuItem>
            <DropdownMenuItem>Duplicate Question</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Delete Question</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="options">
        <TabsList className="bg-gray-100 p-0 h-auto border-b">
          <TabsTrigger
            value="options"
            className="py-2 px-4 data-[state=active]:bg-white rounded-none data-[state=active]:shadow-none"
          >
            <List className="h-4 w-4 mr-2" />
            Options
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="py-2 px-4 data-[state=active]:bg-white rounded-none data-[state=active]:shadow-none"
          >
            <Info className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="py-2 px-4 data-[state=active]:bg-white rounded-none data-[state=active]:shadow-none"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Attachments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="p-4 m-0">
          {question.options.length === 0 ? (
            <div className="text-center p-6 bg-blue-50 rounded-md border border-dashed border-blue-200">
              <p className="text-blue-700 mb-2">
                Click the "Add Option" button below to add an option to this question
              </p>
              <Button className="bg-green-500 hover:bg-green-600 flex items-center gap-1" onClick={onAddOption}>
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{option.title}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditOption(option)}>Edit Option</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate Option</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete Option</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              <Button className="bg-green-500 hover:bg-green-600 flex items-center gap-1" onClick={onAddOption}>
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="p-4 m-0">
          {question.description ? (
            <div dangerouslySetInnerHTML={{ __html: question.description }} />
          ) : (
            <p className="text-gray-500 italic">No description provided.</p>
          )}

          {question.type === "multiple" && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm">
                <span className="font-semibold">Selection limits:</span> Voters must select between{" "}
                {question.min_selections} and {question.max_selections} options.
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">
              <span className="font-semibold">Randomization:</span>{" "}
              {question.randomize
                ? "Options will be randomized for each voter."
                : "Options will be displayed in the order shown."}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="p-4 m-0">
          <p className="text-gray-500 italic">No attachments added.</p>
          <Button variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Attachment
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}

