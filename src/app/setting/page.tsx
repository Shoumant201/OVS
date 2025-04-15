"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import ENDPOINTS from "@/services/Endpoints"
import axiosInstance from "@/services/axiosInstance"

interface UserProfile {
  full_name: string
  email: string
  phone: string
  dob: string
  gender: string
  country: string
  state: string
  city: string
  postal_code: string
  ethnicity: string
  occupation: string
  education: string
  profile_image?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    postal_code: "",
    ethnicity: "",
    occupation: "",
    education: "",
    profile_image: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          setLoading(false)
          return
        }

        const decoded = jwtDecode<{id: string}>(token);
        const id = decoded.id

        console.log(id)

        const url = ENDPOINTS.AUTH.getProfile.replace(":id", id)
        const response = await axiosInstance.get(url)

        setProfile(response.data.user)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      console.log("profile data updated:", profile)
    }
  }, [profile])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.replace("/login")
        return
      }

        const decoded = jwtDecode<{id: string}>(token);
        const id = decoded.id

      let imageUrl = profile.profile_image

      // Upload image to Cloudinary if a new image is selected
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("upload_preset", "user_profiles") // Your Cloudinary upload preset

        // const uploadResponse = await axios.post(
        //   `https://api.cloudinary.com/v1_1/dk6e6kgie/image/upload`,
        //   formData,
        // )
        const uploadResponse = await axios.post("/api/upload", formData);

        imageUrl = uploadResponse.data.secure_url
      }

      // Update profile with new data
      const url = ENDPOINTS.AUTH.updateProfile.replace(":id", id)
      await axiosInstance.put(
        url,
        {
            fullName: profile.full_name || '',            // name for `users` table
            phoneNumber: profile.phone || '',             // maps to phone
            dateOfBirth: profile.dob || '',               // dob
            gender: profile.gender || '',
            country: profile.country || '',
            state: profile.state || '',
            city: profile.city || '',
            postalCode: profile.postal_code || '',
            ethnicity: profile.ethnicity || '',
            occupation: profile.occupation || '',
            educationLevel: profile.education || '',      // maps to educationLevel
            image: imageUrl || profile.profile_image || '',  // final profile image
        }
      )

      setSuccess("Profile updated successfully")

      // Update profile state with new image URL
      if (imageUrl !== profile.profile_image) {
        setProfile((prev) => ({
          ...prev,
          image: imageUrl,
        }))
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.replace("/login")
        return
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setPasswordSuccess("Password updated successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      setPasswordError(error.response?.data?.message || "Failed to update password")
    }
  }

  const handle2FAToggle = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.replace("/login")
        return
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/2fa`,
        {
          enabled: !is2FAEnabled,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setIs2FAEnabled(!is2FAEnabled)
      setSuccess(`Two-factor authentication ${!is2FAEnabled ? "enabled" : "disabled"} successfully`)
    } catch (error) {
      console.error("Error toggling 2FA:", error)
      setError("Failed to update two-factor authentication settings")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#26C6B0]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success</AlertTitle>
                      <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                  )}

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative h-24 w-24">
                      <img
                        src={imagePreview || profile.profile_image || "/placeholder.svg?height=96&width=96"}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover border"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="profile-image"
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
                      >
                        Change Profile Picture
                      </Label>
                      <Input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={profile.full_name}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={profile.dob}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        name="gender"
                        value={profile.gender}
                        onValueChange={(value:any) => setProfile((prev) => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger id="gender" className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country */}
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={profile.country}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* State/Province */}
                    <div>
                      <Label htmlFor="state">State/Province/Region</Label>
                      <Input
                        id="state"
                        name="state"
                        value={profile.state}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={profile.city}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={profile.postal_code}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Ethnicity */}
                    <div>
                      <Label htmlFor="ethnicity">Ethnicity</Label>
                      <Input
                        id="ethnicity"
                        name="ethnicity"
                        value={profile.ethnicity}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Occupation */}
                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        name="occupation"
                        value={profile.occupation}
                        onChange={handleProfileChange}
                        className="mt-1"
                      />
                    </div>

                    {/* Education Level */}
                    <div>
                      <Label htmlFor="educationLevel">Education Level</Label>
                      <Select
                        name="educationLevel"
                        value={profile.education}
                        onValueChange={(value:any) => setProfile((prev) => ({ ...prev, educationLevel: value }))}
                      >
                        <SelectTrigger id="educationLevel" className="mt-1">
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="associate">Associate Degree</SelectItem>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                          <SelectItem value="doctorate">Doctorate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={saving} className="bg-[#26C6B0] hover:bg-[#1eaa98]">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-4">
                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}

                    {passwordSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Success</AlertTitle>
                        <AlertDescription className="text-green-700">{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="bg-[#26C6B0] hover:bg-[#1eaa98]">
                      Update Password
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">
                        {is2FAEnabled
                          ? "Two-factor authentication is currently enabled"
                          : "Enable two-factor authentication for added security"}
                      </p>
                    </div>
                    <Button
                      onClick={handle2FAToggle}
                      variant={is2FAEnabled ? "outline" : "default"}
                      className={is2FAEnabled ? "" : "bg-[#26C6B0] hover:bg-[#1eaa98]"}
                    >
                      {is2FAEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Notification preferences will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
