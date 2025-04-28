"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Cog, Building2, Palette, Smartphone, CreditCard, KeyRound, User, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import  axiosInstance  from "@/services/axiosInstance"
import { Endpoints } from "@/services/Endpoints"

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general")
  const [userRole, setUserRole] = useState<"admin" | "commissioner" | null>(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  })

  // Loading states
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")
  const [dialogTitle, setDialogTitle] = useState("")

  // Get user role and data on component mount
  useEffect(() => {
    // Get user role from localStorage or cookies
    const userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")

    if (userType === "admin" || userType === "commissioner") {
      setUserRole(userType)
      fetchUserData(userType)
    } else {
      showError("Authentication Error", "User role not found. Please log in again.")
    }
  }, [])

  // Fetch user data based on role
  const fetchUserData = async (role: string) => {
    setIsLoading(true)

    try {
      // Add role to headers for this specific request
      const response = await axiosInstance.get(Endpoints.PROFILE.USER_PROFILE, {
        headers: {
          "X-User-Role": role,
        },
      })

      setProfileForm({
        name: response.data.name || "",
        email: response.data.email || "",
      })
    } catch (error) {
      showError("Data Fetch Error", "Failed to load your profile data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    setProfileError(null)
  }

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPasswordError(null)
  }

  // Show success dialog
  const showSuccess = (title: string, message: string) => {
    setDialogTitle(title)
    setDialogMessage(message)
    setShowSuccessDialog(true)
  }

  // Show error dialog
  const showError = (title: string, message: string) => {
    setDialogTitle(title)
    setDialogMessage(message)
    setShowErrorDialog(true)
  }

  // Submit profile form
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userRole) {
      showError("Authentication Error", "User role not found. Please log in again.")
      return
    }

    setIsProfileLoading(true)
    setProfileError(null)

    try {
      const response = await axiosInstance.put(Endpoints.PROFILE.UPDATE_PROFILE, profileForm, {
        headers: {
          "X-User-Role": userRole,
        },
      })

      localStorage.setItem("userName", profileForm.name);
        window.dispatchEvent(new Event("userNameUpdated"));


      showSuccess("Profile Updated", "Your profile information has been updated successfully.")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An unknown error occurred"
      setProfileError(errorMessage)
      showError("Update Failed", errorMessage)
    } finally {
      setIsProfileLoading(false)
    }
  }

  // Submit password form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userRole) {
      showError("Authentication Error", "User role not found. Please log in again.")
      return
    }

    setIsPasswordLoading(true)
    setPasswordError(null)

    // Basic validation
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      showError("Validation Error", "Password must be at least 8 characters long")
      setIsPasswordLoading(false)
      return
    }

    try {
      const response = await axiosInstance.put(Endpoints.PROFILE.UPDATE_PASSWORD, passwordForm, {
        headers: {
          "X-User-Role": userRole,
        },
      })

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      })
      showSuccess("Password Updated", "Your password has been changed successfully.")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "An unknown error occurred"
      setPasswordError(errorMessage)
      showError("Update Failed", errorMessage)
    } finally {
      setIsPasswordLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Account Settings</h1>
      <Separator className="mb-8" />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <div className="space-y-1">
          <Button
            variant={activeTab === "general" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("general")}
          >
            <Cog className="mr-2 h-5 w-5" />
            General
          </Button>
          {/* <Button variant="ghost" className="w-full justify-start">
            <Building2 className="mr-2 h-5 w-5" />
            Organization
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Palette className="mr-2 h-5 w-5" />
            Appearance
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Smartphone className="mr-2 h-5 w-5" />
            Mobile App
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <CreditCard className="mr-2 h-5 w-5" />
            Billing
          </Button> */}
          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("security")}
          >
            <KeyRound className="mr-2 h-5 w-5" />
            Security
          </Button>
        </div>

        {/* Content */}
        <div className="rounded-lg border p-6 shadow-sm">
          {userRole && (
            <div className="mb-4 inline-block rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-800">
              {userRole === "admin" ? "Admin Account" : "Commissioner Account"}
            </div>
          )}

          {activeTab === "general" ? (
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-6 flex items-center">
                <User className="mr-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">Profile Settings</h2>
              </div>

              {profileError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 space-y-1">
                <h3 className="font-medium">Name</h3>
                <p className="text-sm text-gray-600">
                  Your name or the name of the primary contact of the account. Visit the{" "}
                  <Link href="#" className="text-sky-500 hover:underline">
                    organization settings
                  </Link>{" "}
                  to change the name of the organization.
                </p>
                <Input className="mt-2" name="name" value={profileForm.name} onChange={handleProfileChange} required />
              </div>

              <div className="mb-6 space-y-1">
                <h3 className="font-medium">Email Address</h3>
                <Input
                  className="mt-2"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isProfileLoading}>
                {isProfileLoading ? "Saving..." : "Save Settings"}
              </Button>

              <div className="mt-8 flex justify-end">
                <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                  Close Account
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6 flex items-center">
                <KeyRound className="mr-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">Change Password</h2>
              </div>

              {passwordError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6 space-y-1">
                <h3 className="font-medium">Current Password</h3>
                <Input
                  className="mt-2"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="mb-6 space-y-1">
                <h3 className="font-medium">New Password</h3>
                <Input
                  className="mt-2"
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isPasswordLoading}>
                {isPasswordLoading ? "Saving..." : "Save Password"}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>{dialogMessage}</DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)} className="bg-green-500 hover:bg-green-600">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>{dialogMessage}</DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)} variant="destructive">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

