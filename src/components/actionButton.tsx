"use client"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Ban } from "lucide-react"

interface ActionButtonsProps {
  onEdit?: () => void
  onDelete: () => void
  showEdit?: boolean
  showBanUnban?: boolean
  isBanned?: boolean
  onBanUnban?: () => void
}

export function ActionButtons({ onEdit, onDelete, showEdit = true, showBanUnban = false, isBanned = false, onBanUnban }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {showBanUnban && (
        <button
          onClick={onBanUnban}
          className={`rounded p-1 ${isBanned ? "text-green-600 hover:bg-green-100" : "text-red-600 hover:bg-red-100"}`}
          title={isBanned ? "Unban User" : "Ban User"}
        >
          <Ban className="h-5 w-5" />
        </button>
      )}
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

