"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios" // For Cloudinary/direct uploads
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
import axiosInstance from "@/services/axiosInstance" // Your custom instance
import { type Locale } from '@/lib/dictionary' // Assuming Locale type is defined here

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
  education: string // This was `educationLevel` in the payload, ensure consistency or map
  profile_image?: string
  image?: string // Potential field from backend after update
}

interface DecodedToken {
    id: string;
    user_id?: string; // In case the token uses user_id
}

// Props for the page component
interface SettingsPageProps {
  dictionary: any;
  locale: Locale;
}


export default function SettingsPage({ dictionary, locale }: SettingsPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "", email: "", phone: "", dob: "", gender: "", country: "",
    state: "", city: "", postal_code: "", ethnicity: "", occupation: "",
    education: "", profile_image: "",
  })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false) // Fetch this from user profile or a separate endpoint

  // Destructure translations for easier use
  const t = dictionary || {};
  const tAccountSettings = t['account-settings'] || {};
  const tTabs = t['tabs'] || {};
  const tProfileInfo = t['profile-information'] || {};
  const tSecurity = t['security-tab'] || {};
  const tMessages = t['messages'] || {};
  const tBasicInfo = t['basic-info'] || {}; // For shared gender/education options

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        router.replace(`/${locale}/login`); // Redirect with locale
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const userId = decoded.id || decoded.user_id;

        if (!userId) {
            console.error("User ID not found in token.");
            setProfileError(tMessages.profileUpdateFailed || "User identification failed.");
            setLoading(false);
            return;
        }

        // Fetch Profile
        const profileUrl = ENDPOINTS.AUTH.getProfile.replace(":id", userId);
        const profileResponse = await axiosInstance.get(profileUrl);
        
        // Map backend 'image' to 'profile_image' if necessary, or use 'image' directly
        const userProfileData = profileResponse.data.user;
        if (userProfileData.image && !userProfileData.profile_image) {
            userProfileData.profile_image = userProfileData.image;
        }
        setProfile(userProfileData);
        setImagePreview(userProfileData.profile_image || null);

        // TODO: Fetch 2FA status (if not part of user profile)
        // Example: const twoFaResponse = await axiosInstance.get(ENDPOINTS.AUTH.GET_2FA_STATUS);
        // setIs2FAEnabled(twoFaResponse.data.enabled);

      } catch (error) {
        console.error("Error fetching initial settings data:", error);
        setProfileError(tMessages.profileUpdateFailed || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [locale, router, tMessages.profileUpdateFailed]);


  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Special handling for name attributes that don't match UserProfile keys directly
    const keyMap: { [key: string]: keyof UserProfile } = {
        fullName: 'full_name',
        email: 'email',
        phoneNumber: 'phone',
        dateOfBirth: 'dob',
        gender: 'gender',
        country: 'country',
        state: 'state',
        city: 'city',
        postalCode: 'postal_code',
        ethnicity: 'ethnicity',
        occupation: 'occupation',
        educationLevel: 'education'
    };
    const profileKey = keyMap[name] || name as keyof UserProfile;
    setProfile((prev) => ({ ...prev, [profileKey]: value, }));
  };
  
  const handleSelectChange = (name: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [name]: value, }));
  };


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value, }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => { setImagePreview(reader.result as string) }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(null)

    const token = Cookies.get("token")
    if (!token) {
      router.replace(`/${locale}/login`);
      setSavingProfile(false);
      return;
    }

    const currentLocale = locale || sessionStorage.getItem("currentLocale") || "en"
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const userId = decoded.id || decoded.user_id;
      if (!userId) {
        setProfileError(tMessages.profileUpdateFailed || "User identification failed.");
        setSavingProfile(false);
        return;
      }

      let imageUrl = profile.profile_image

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        // formData.append("upload_preset", "user_profiles") // For direct Cloudinary
        // const uploadResponse = await axios.post(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, formData);
        const uploadResponse = await axios.post(`/${currentLocale}/api/upload`, formData); // Using local API endpoint
        imageUrl = uploadResponse.data.url || uploadResponse.data.secure_url; // Adjust based on your /api/upload response
      }

      const profileUpdateUrl = ENDPOINTS.AUTH.updateProfile.replace(":id", userId)
      await axiosInstance.put( profileUpdateUrl, {
          // Match payload keys to your backend API
          fullName: profile.full_name || '',
          email: profile.email, // Assuming email can be updated, otherwise omit or handle as read-only
          phoneNumber: profile.phone || '',
          dateOfBirth: profile.dob || '',
          gender: profile.gender || '',
          country: profile.country || '',
          state: profile.state || '',
          city: profile.city || '',
          postalCode: profile.postal_code || '',
          ethnicity: profile.ethnicity || '',
          occupation: profile.occupation || '',
          educationLevel: profile.education || '', // Make sure 'education' state maps to 'educationLevel' payload
          image: imageUrl || '', // Send the final image URL
        }
      )
      setProfileSuccess(tMessages.profileUpdated)
      if (imageUrl && imageUrl !== profile.profile_image) {
        setProfile((prev) => ({ ...prev, profile_image: imageUrl, image: imageUrl })) // Update local state
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setProfileError(error.response?.data?.message || tMessages.profileUpdateFailed)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(tMessages.passwordMismatch)
      setSavingPassword(false);
      return
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError(tMessages.passwordLength)
      setSavingPassword(false);
      return
    }

    const token = Cookies.get("token")
    if (!token) {
      router.replace(`/${locale}/login`);
      setSavingPassword(false);
      return;
    }

    try {
      // Assuming your ENDPOINTS.AUTH.CHANGE_PASSWORD is defined
      // const changePasswordUrl = ENDPOINTS.AUTH.CHANGE_PASSWORD; 
      // If not, use the direct URL structure as before but prefer endpoints
      await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/password`, // Replace with ENDPOINTS if available
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword, },
        // axiosInstance should handle token automatically if configured
      )
      setPasswordSuccess(tMessages.passwordUpdated)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "", })
    } catch (error: any) {
      console.error("Error updating password:", error)
      setPasswordError(error.response?.data?.message || tMessages.passwordUpdateFailed)
    } finally {
        setSavingPassword(false);
    }
  }

  const handle2FAToggle = async () => {
    const token = Cookies.get("token")
    if (!token) {
      router.replace(`/${locale}/login`);
      return;
    }
    setProfileError(null); // Clear general errors
    setProfileSuccess(null);
    try {
      // Assuming ENDPOINTS.AUTH.TOGGLE_2FA exists
      // const toggle2FAUrl = ENDPOINTS.AUTH.TOGGLE_2FA;
      await axiosInstance.put( // Use axiosInstance
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/2fa`, // Replace with ENDPOINTS
        { enabled: !is2FAEnabled, },
      )
      setIs2FAEnabled(!is2FAEnabled)
      setProfileSuccess(!is2FAEnabled ? tMessages['2faEnabled'] : tMessages['2faDisabled'])
    } catch (error: any) {
      console.error("Error toggling 2FA:", error)
      setProfileError(error.response?.data?.message || tMessages['2faError'])
    }
  }
  
  const commonInputClass = "mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-[#26C6B0] focus:border-[#26C6B0] outline-none";
  const commonButtonClass = "bg-[#26C6B0] hover:bg-[#1eaa98] dark:hover:bg-[#30D9C0] text-white dark:text-black";


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-[#26C6B0]" />
        </div>
      </div>
    )
  }
  
  // Helper for rendering select options to avoid repetition
  const renderSelectOptions = (options: { value: string; label: string }[]) => {
    return options.map(option => (
        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
    ));
  };

  const genderOptions = [
    { value: "male", label: tBasicInfo.male || "Male" },
    { value: "female", label: tBasicInfo.female || "Female" },
    { value: "other", label: tBasicInfo.otherGender || "Other" },
    { value: "prefer_not_to_say", label: tAccountSettings.preferNotToSay || "Prefer not to say" },
  ];

  const educationOptions = [
    { value: "no_formal_education", label: tBasicInfo.noFormal || "No Formal Education" },
    { value: "primary_school", label: tBasicInfo.primary || "Primary School" },
    { value: "secondary_school", label: tBasicInfo.secondary || "Secondary School" },
    { value: "high_school", label: tAccountSettings.highSchool || tBasicInfo.highSchool || "High School" },
    { value: "associate", label: tAccountSettings.associateDegree || tBasicInfo.associate || "Associate Degree" },
    { value: "bachelor", label: tAccountSettings.bachelorsDegree || tBasicInfo.bachelor || "Bachelor's Degree" },
    { value: "master", label: tAccountSettings.mastersDegree || tBasicInfo.master || "Master's Degree" },
    { value: "doctorate", label: tAccountSettings.doctorate || tBasicInfo.phd || "Doctorate" },
    { value: "other", label: tAccountSettings.other || tBasicInfo.otherEducation || "Other" },
  ];


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{tAccountSettings.accountSettings}</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#26C6B0] data-[state=active]:text-white dark:data-[state=active]:text-black">{tTabs.profileInformation}</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#26C6B0] data-[state=active]:text-white dark:data-[state=active]:text-black">{tTabs.security}</TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-[#26C6B0] data-[state=active]:text-white dark:data-[state=active]:text-black">{tTabs.preferences}</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>{tProfileInfo.title}</CardTitle>
                <CardDescription className="dark:text-gray-400">{tProfileInfo.description}</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-6">
                  {profileError && (
                    <Alert variant="destructive" className="dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{tMessages.error}</AlertTitle>
                      <AlertDescription>{profileError}</AlertDescription>
                    </Alert>
                  )}
                  {profileSuccess && (
                    <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-300">{tMessages.success}</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">{profileSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative h-24 w-24">
                      <img
                        src={imagePreview || profile.profile_image || "/placeholder.svg?height=96&width=96"}
                        alt={tProfileInfo.profileImageAlt || "Profile"}
                        className="h-24 w-24 rounded-full object-cover border dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="profile-image-upload"
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm"
                      >
                        {tProfileInfo.changeProfilePicture}
                      </Label>
                      <Input id="profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="dark:text-gray-300">{tProfileInfo.fullName}</Label>
                      <Input id="fullName" name="fullName" value={profile.full_name} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="email" className="dark:text-gray-300">{tProfileInfo.email}</Label>
                      <Input id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} readOnly className={`${commonInputClass} cursor-not-allowed bg-gray-100 dark:bg-gray-700/50`} />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="dark:text-gray-300">{tProfileInfo.phoneNumber}</Label>
                      <Input id="phoneNumber" name="phoneNumber" value={profile.phone} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth" className="dark:text-gray-300">{tProfileInfo.dateOfBirth}</Label>
                      <Input id="dateOfBirth" name="dateOfBirth" type="date" value={profile.dob} onChange={handleProfileChange} className={`${commonInputClass} dark:[color-scheme:dark]`} />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="dark:text-gray-300">{tProfileInfo.gender}</Label>
                      <Select name="gender" value={profile.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                        <SelectTrigger id="gender" className={`${commonInputClass} mt-1`}>
                          <SelectValue placeholder={tAccountSettings.selectGenderPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            {renderSelectOptions(genderOptions)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="country" className="dark:text-gray-300">{tProfileInfo.country}</Label>
                      <Input id="country" name="country" value={profile.country} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="state" className="dark:text-gray-300">{tProfileInfo.state}</Label>
                      <Input id="state" name="state" value={profile.state} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="city" className="dark:text-gray-300">{tProfileInfo.city}</Label>
                      <Input id="city" name="city" value={profile.city} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="dark:text-gray-300">{tProfileInfo.postalCode}</Label>
                      <Input id="postalCode" name="postalCode" value={profile.postal_code} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="ethnicity" className="dark:text-gray-300">{tProfileInfo.ethnicity}</Label>
                      <Input id="ethnicity" name="ethnicity" value={profile.ethnicity} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="occupation" className="dark:text-gray-300">{tProfileInfo.occupation}</Label>
                      <Input id="occupation" name="occupation" value={profile.occupation} onChange={handleProfileChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="educationLevel" className="dark:text-gray-300">{tProfileInfo.educationLevel}</Label>
                       <Select name="educationLevel" value={profile.education} onValueChange={(value) => handleSelectChange('education', value)}>
                        <SelectTrigger id="educationLevel" className={`${commonInputClass} mt-1`}>
                            <SelectValue placeholder={tAccountSettings.selectEducationPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                            {renderSelectOptions(educationOptions)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={savingProfile} className={`${commonButtonClass}`}>
                    {savingProfile ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tAccountSettings.saving}</>) : tAccountSettings.saveChanges}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>{tSecurity.changePasswordTitle}</CardTitle>
                  <CardDescription className="dark:text-gray-400">{tSecurity.changePasswordDescription}</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-4">
                    {passwordError && (
                      <Alert variant="destructive" className="dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
                        <AlertCircle className="h-4 w-4" /> <AlertTitle>{tMessages.error}</AlertTitle> <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    {passwordSuccess && (
                      <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" /> <AlertTitle className="text-green-800 dark:text-green-300">{tMessages.success}</AlertTitle> <AlertDescription className="text-green-700 dark:text-green-400">{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}
                    <div>
                      <Label htmlFor="currentPassword">{tSecurity.currentPassword}</Label>
                      <Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">{tSecurity.newPassword}</Label>
                      <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} className={commonInputClass} />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{tSecurity.confirmNewPassword}</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={commonInputClass} />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={savingPassword} className={`${commonButtonClass}`}>
                        {savingPassword ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tAccountSettings.saving}</>) : tAccountSettings.updatePassword}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>{tSecurity.twoFactorAuthTitle}</CardTitle>
                  <CardDescription className="dark:text-gray-400">{tSecurity.twoFactorAuthDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{tSecurity.twoFactorAuthTitle}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {is2FAEnabled ? tAccountSettings.twoFactorEnabledMessage : tAccountSettings.twoFactorDisabledMessage}
                      </p>
                    </div>
                    <Button onClick={handle2FAToggle} variant={is2FAEnabled ? "outline" : "default"} className={is2FAEnabled ? "dark:text-white dark:border-gray-500" : `${commonButtonClass}`}>
                      {is2FAEnabled ? tAccountSettings.disable : tAccountSettings.enable}
                    </Button>
                  </div>
                   {/* Display 2FA success/error messages here if needed (separate from profile success/error) */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>{tAccountSettings.notificationPreferencesTitle}</CardTitle>
                <CardDescription className="dark:text-gray-400">{tAccountSettings.notificationPreferencesDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">{tAccountSettings.notificationsComingSoon}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}