"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon } from "lucide-react"

interface UserProfile {
  full_name?: string
  email?: string
  phone?: string
  dob?: string
  gender?: string
  education?: string
  occupation?: string
  ethnicity?: string
  country?: string
  state?: string
  city?: string
  postal_code?: string
  profile_image?: string
  [key: string]: any // Allow any other properties
}

interface SettingsFormProps {
  profile: UserProfile | null
  onSave: (data: UserProfile) => void
  loading: boolean
}

export function SettingsForm({ profile, onSave, loading }: SettingsFormProps) {
  // Initialize with profile data or empty values
  const [formData, setFormData] = useState<UserProfile>({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    dob: profile?.dob || "",
    gender: profile?.gender || "",
    education: profile?.education || "",
    occupation: profile?.occupation || "",
    ethnicity: profile?.ethnicity || "",
    country: profile?.country || "",
    state: profile?.state || "",
    city: profile?.city || "",
    postal_code: profile?.postal_code || "",
    profile_image: profile?.profile_image || "",
  })

  const [avatarError, setAvatarError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleImageError = () => {
    setAvatarError(true)
  }

  const getInitials = (name: string) => {
    if (!name) return "U"

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          {formData.profile_image && !avatarError ? (
            <AvatarImage
              src={formData.profile_image || "/placeholder.svg"}
              alt={formData.full_name || "User"}
              className="h-full w-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {formData.full_name ? getInitials(formData.full_name) : <UserIcon className="h-12 w-12" />}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <Label htmlFor="profile_image">Profile Image URL</Label>
          <Input
            id="profile_image"
            name="profile_image"
            value={formData.profile_image || ""}
            onChange={handleChange}
            placeholder="https://example.com/your-image.jpg"
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name || ""}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="john.doe@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" name="dob" type="date" value={formData.dob || ""} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
              <SelectTrigger>
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
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              name="education"
              value={formData.education || ""}
              onChange={handleChange}
              placeholder="Bachelor's Degree"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ethnicity">Ethnicity</Label>
            <Input
              id="ethnicity"
              name="ethnicity"
              value={formData.ethnicity || ""}
              onChange={handleChange}
              placeholder="Ethnicity"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              placeholder="United States"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              name="state"
              value={formData.state || ""}
              onChange={handleChange}
              placeholder="California"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              placeholder="San Francisco"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ""}
              onChange={handleChange}
              placeholder="94105"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
