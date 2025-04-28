"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"

interface NotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  variant?: "success" | "error"
}

export function NotificationDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "success",
}: NotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={`${
              variant === "success" ? "bg-green-500" : "bg-red-500"
            } text-white p-4 -mx-6 -mt-6 text-xl font-normal flex items-center`}
          >
            {variant === "success" ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>{description}</p>
        </div>

        <DialogFooter>
          <Button
            className={variant === "success" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}
            onClick={() => onOpenChange(false)}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
