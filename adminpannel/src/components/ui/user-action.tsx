"use client"

import { useState } from "react"
import { Ban, Trash2 } from "lucide-react"
import { banUserAPI, unbanUserAPI, deleteUserAPI } from "@/services/api/Authentication"
import { NotificationDialog } from "@/components/notification-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface ActionButtonsProps {
  userId: number | string
  isBanned: boolean
  onSuccess: () => void
}

export function UserActions({ userId, isBanned, onSuccess }: ActionButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBanConfirm, setShowBanConfirm] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    title: string
    message: string
    type: "success" | "error"
  }>({
    show: false,
    title: "",
    message: "",
    type: "success",
  })

  const handleBanUnban = async () => {
    try {
      setIsLoading(true)
      if (isBanned) {
        await unbanUserAPI(userId)
        showNotification("Success", "User unbanned successfully", "success")
      } else {
        await banUserAPI(userId)
        showNotification("Success", "User banned successfully", "success")
      }
      onSuccess() // Refresh the user list
    } catch (error: any) {
      showNotification("Error", error.response?.data?.message || "An error occurred", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await deleteUserAPI(userId)
      showNotification("Success", "User deleted successfully", "success")
      onSuccess() // Refresh the user list
    } catch (error: any) {
      showNotification("Error", error.response?.data?.message || "An error occurred", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (title: string, message: string, type: "success" | "error") => {
    setNotification({
      show: true,
      title,
      message,
      type,
    })
  }

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }))
  }

  return (
    <>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowBanConfirm(true)}
          disabled={isLoading}
          className={`rounded p-1 ${
            isBanned ? "text-green-600 hover:bg-green-100" : "text-red-600 hover:bg-red-100"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isBanned ? "Unban User" : "Ban User"}
        >
          <Ban className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading}
          className={`rounded p-1 text-red-600 hover:bg-red-100 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          title="Delete User"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmationDialog
        open={showBanConfirm}
        onClose={() => setShowBanConfirm(false)}
        onConfirm={handleBanUnban}
        title={isBanned ? "Unban User" : "Ban User"}
        message={
          isBanned
            ? "Are you sure you want to unban this user? They will regain access to the system."
            : "Are you sure you want to ban this user? They will lose access to the system."
        }
        confirmText={isBanned ? "Unban" : "Ban"}
      />

      {/* Notification Dialog */}
      <NotificationDialog
        open={notification.show}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  )
}

