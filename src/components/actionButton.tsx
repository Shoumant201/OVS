"use client"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface ActionButtonsProps {
  onEdit?: () => void
  onDelete: () => void
  showEdit?: boolean
}

export function ActionButtons({ onEdit, onDelete, showEdit = true }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {showEdit && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

