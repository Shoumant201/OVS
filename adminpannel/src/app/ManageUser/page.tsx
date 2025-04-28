"use client"

import { Search, Mail, User, Menu } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { UserActions } from "@/components/ui/user-action"
import { getUsersAPI } from "@/services/api/Authentication"
import { NotificationDialog } from "@/components/notification-dialog"

// Define the User type
interface UserType {
  id: number
  name: string
  email: string
  is_banned: boolean // Changed from isBanned to match backend field name
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getUsersAPI()
      setUsers(data || [])
      console.log();
    } catch (error: any) {
      showNotification("Error", error.response?.data?.message || "Failed to fetch users", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Define columns for the DataTable
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      accessor: "is_banned",
      cell: (user: UserType) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            user.is_banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {user.is_banned ? "Banned" : "Active"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "id",
      cell: (user: UserType) => <UserActions userId={user.id} isBanned={user.is_banned} onSuccess={fetchUsers} />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Content */}
      <main className="container mx-auto flex-1 p-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                <span className="text-green-500">Users</span> Management
              </h2>
              <p className="text-gray-600">Manage your system users and their access</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="mb-2 text-xl font-bold">All Users</h3>
          <p className="mb-4 text-gray-600">View and manage all your system users</p>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredUsers} />
            )}
          </div>
        </div>
      </main>

      {/* Notification Dialog */}
      <NotificationDialog
        open={notification.show}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  )
}

