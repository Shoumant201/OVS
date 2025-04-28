"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PageHeaderProps {
  title: string
  highlightedText: string
  description: string
  buttonText: string
  onButtonClick?: () => void
}

export function PageHeader({
  title,
  highlightedText,
  description,
  buttonText,
  onButtonClick = () => {},
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-green-500">{highlightedText}</span> {title}
        </h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <Button className="bg-green-500 hover:bg-green-600 mt-4 sm:mt-0" onClick={onButtonClick}>
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}

