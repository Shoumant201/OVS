"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import axiosInstance from "@/services/axiosInstance"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"
import ENDPOINTS from "@/services/Endpoints"
import type { Locale } from "@/lib/dictionary"
import { AlertCircle, CheckCircle, Upload, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BasicInfoPageProps {
  dictionary: any
  locale: Locale
}

interface DecodedToken {
  email: string
  id: string
  user_id?: string
}

interface NationalIdVerificationStatus {
  isVerified: boolean
  isLinked: boolean
  message: string
  extractedData?: {
    fullName?: string
    dob?: string
    idNumber?: string
    [key: string]: any
  }
}

export default function BasicInfoPage({ dictionary, locale }: BasicInfoPageProps) {
  const [initialUserId, setInitialUserId] = useState<string>("")
  const [initialUserEmail, setInitialUserEmail] = useState<string>("")
  const [tokenLoaded, setTokenLoaded] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // National ID related states
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null)
  const [uploadingId, setUploadingId] = useState(false)
  const [idVerificationStatus, setIdVerificationStatus] = useState<NationalIdVerificationStatus | null>(null)
  const [idVerificationInProgress, setIdVerificationInProgress] = useState(false)

  useEffect(() => {
    const token = Cookies.get("token")
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        setInitialUserId(decoded.id || decoded.user_id || "")
        setInitialUserEmail(decoded.email || "")
      } catch (error) {
        console.error("Failed to decode token:", error)
      }
    } else {
      console.warn("No token found for BasicInfoPage. User might need to be redirected.")
    }
    setTokenLoaded(true)
  }, [])

  const [form, setForm] = useState({
    user_id: "",
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    ethnicity: "",
    occupation: "",
    education: "",
    profileImage: "",
    nationalIdNumber: "", // Added for national ID number
  })

  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  // Update form with initial user ID and email once token is decoded
  useEffect(() => {
    if (tokenLoaded) {
      setForm((prevForm) => ({
        ...prevForm,
        user_id: initialUserId,
        email: initialUserEmail,
      }))
    }
  }, [initialUserId, initialUserEmail, tokenLoaded])

  // Store locale in sessionStorage
  useEffect(() => {
    if (locale) {
      sessionStorage.setItem("currentLocale", locale)
    }
  }, [locale])

  // Update form with extracted data from national ID when available
  useEffect(() => {
    if (idVerificationStatus?.extractedData) {
      const { fullName, dob, idNumber } = idVerificationStatus.extractedData

      setForm((prevForm) => ({
        ...prevForm,
        ...(fullName ? { fullName } : {}),
        ...(dob ? { dob } : {}),
        ...(idNumber ? { nationalIdNumber: idNumber } : {}),
      }))
    }
  }, [idVerificationStatus])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setSubmitError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const currentLocale = locale || sessionStorage.getItem("currentLocale") || "en"
      const res = await axios.post(`/${currentLocale}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setForm({ ...form, profileImage: res.data.url })
    } catch (err) {
      console.error("Upload failed", err)
      setSubmitError(dictionary?.messages?.profileUpdateFailed || "Image upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleNationalIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setSubmitError(dictionary?.messages?.invalidFileFormat || "Please upload a valid PDF file.")
      return
    }

    setNationalIdFile(file)
    setUploadingId(true)
    setSubmitError(null)
    setIdVerificationStatus(null)
    setIdVerificationInProgress(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", form.user_id)

    try {
      // Upload and process the national ID
      const res = await axiosInstance.post("/national-id/verify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setIdVerificationStatus(res.data)

      // If the ID is already linked to another account
      if (res.data.isLinked) {
        setSubmitError(
          dictionary?.messages?.idAlreadyLinked || "This national ID is already linked to another account.",
        )
      }
      // If verification failed for other reasons
      else if (!res.data.isVerified) {
        setSubmitError(
          dictionary?.messages?.idVerificationFailed ||
            "National ID verification failed. Please try again with a valid ID.",
        )
      }
      // Success case
      else {
        setSubmitSuccess(dictionary?.messages?.idVerificationSuccess || "National ID verified successfully.")
      }
    } catch (err: any) {
      console.error("National ID verification failed", err)
      setSubmitError(
        err?.response?.data?.message || dictionary?.messages?.idVerificationFailed || "Failed to verify national ID.",
      )
    } finally {
      setUploadingId(false)
      setIdVerificationInProgress(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.user_id) {
      setSubmitError(dictionary?.messages?.error || "User identification failed. Please try again.")
      return
    }

    // Check if national ID verification is required and successful
    if (!idVerificationStatus?.isVerified) {
      setSubmitError(
        dictionary?.messages?.idVerificationRequired || "Please upload and verify your national ID before proceeding.",
      )
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const payload = {
      user_id: form.user_id,
      full_name: form.fullName,
      email: form.email,
      phone: form.phone,
      dob: form.dob,
      gender: form.gender,
      country: form.country,
      state: form.state,
      city: form.city,
      postal_code: form.postalCode,
      ethnicity: form.ethnicity,
      occupation: form.occupation,
      education: form.education,
      profile_image: form.profileImage,
      national_id_number: form.nationalIdNumber, // Include national ID number in payload
    }

    try {
      const currentLocale = locale || sessionStorage.getItem("currentLocale") || "en"
      await axiosInstance.post(ENDPOINTS.AUTH.CREATE_USERPROFILE, payload)
      window.location.href = `/${currentLocale}/onboarding/2fa`
    } catch (err: any) {
      console.error("Failed to save info", err)
      const apiError =
        err?.response?.data?.message ||
        dictionary?.messages?.profileUpdateFailed ||
        "Failed to save profile information."
      setSubmitError(apiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tokenLoaded || !dictionary || !dictionary["basic-info"] || !dictionary["messages"]) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">Loading...</div>
  }

  const t = dictionary["basic-info"]
  const commonStyles =
    "border p-3 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-[#26C6B0] focus:border-[#26C6B0] outline-none"
  const readOnlyStyles = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-black shadow-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">{t.title}</h2>

        <div className="flex flex-col items-center mb-8">
          {form.profileImage ? (
            <img
              src={form.profileImage || "/placeholder.svg"}
              alt={t.profileImageAlt || "Profile"}
              className="w-32 h-32 rounded-full object-cover shadow-lg border-2 border-[#26C6B0]"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm shadow-md">
              {t.noImage}
            </div>
          )}

          <label
            htmlFor="profile-image-upload"
            className="mt-4 cursor-pointer text-sm text-[#26C6B0] hover:text-[#1F9A8A] font-medium"
          >
            {dictionary.profileInformation?.changeProfilePicture || "Change Profile Picture"}
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            aria-label={t.changeProfilePicture || "Upload profile image"}
            onChange={handleImageUpload}
            className="hidden"
          />
          {uploading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t.uploading}</p>}
        </div>

        {/* National ID Upload Section */}
        <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            {t.nationalIdVerification || "National ID Verification"}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t.nationalIdInstructions ||
              "Please upload a PDF of your national ID card for verification. This helps us confirm your identity and prevent fraud."}
          </p>

          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="national-id-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${idVerificationStatus?.isVerified ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/30"}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {idVerificationInProgress ? (
                  <Loader2 className="w-8 h-8 text-gray-500 dark:text-gray-400 animate-spin" />
                ) : idVerificationStatus?.isVerified ? (
                  <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                )}
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {idVerificationStatus?.isVerified
                    ? t.idVerified || "ID Verified"
                    : nationalIdFile
                      ? nationalIdFile.name
                      : t.clickToUploadId || "Click to upload your national ID (PDF)"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.pdfOnly || "PDF only (max 5MB)"}</p>
              </div>
            </label>
            <input
              id="national-id-upload"
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleNationalIdUpload}
              className="hidden"
            />
          </div>

          {idVerificationStatus?.isVerified && (
            <div className="mt-4">
              <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  {t.idVerificationSuccess || "Your national ID has been successfully verified."}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {uploadingId && (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
              {t.verifyingId || "Verifying your national ID..."}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.fullName}
            </label>
            <input
              id="fullName"
              name="fullName"
              placeholder={t.fullName}
              value={form.fullName}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.email}
            </label>
            <input
              id="email"
              name="email"
              title={t.email}
              value={form.email}
              readOnly
              className={`${commonStyles} ${readOnlyStyles}`}
            />
          </div>

          {/* National ID Number Field */}
          <div className="md:col-span-2">
            <label
              htmlFor="nationalIdNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.nationalIdNumber || "National ID Number"}
            </label>
            <input
              id="nationalIdNumber"
              name="nationalIdNumber"
              placeholder={t.nationalIdNumber || "National ID Number"}
              value={form.nationalIdNumber}
              onChange={handleChange}
              className={`${commonStyles} ${idVerificationStatus?.isVerified ? "border-green-300 dark:border-green-600" : ""}`}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.phone}
            </label>
            <input
              id="phone"
              name="phone"
              placeholder={t.phone}
              value={form.phone}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.dob}
            </label>
            <input
              id="dob"
              name="dob"
              aria-label={t.dob}
              type="date"
              value={form.dob}
              onChange={handleChange}
              className={`${commonStyles} dark:[color-scheme:dark]`}
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.gender}
            </label>
            <select
              id="gender"
              name="gender"
              title={t.gender}
              value={form.gender}
              onChange={handleChange}
              className={commonStyles}
            >
              <option value="">{t.selectGender}</option>
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
              <option value="Other">{t.otherGender}</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.country}
            </label>
            <input
              id="country"
              name="country"
              placeholder={t.country}
              value={form.country}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.state}
            </label>
            <input
              id="state"
              name="state"
              placeholder={t.state}
              value={form.state}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.city}
            </label>
            <input
              id="city"
              name="city"
              placeholder={t.city}
              value={form.city}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.postalCode}
            </label>
            <input
              id="postalCode"
              name="postalCode"
              placeholder={t.postalCode}
              value={form.postalCode}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div>
            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.ethnicity}
            </label>
            <input
              id="ethnicity"
              name="ethnicity"
              placeholder={t.ethnicity}
              value={form.ethnicity}
              onChange={handleChange}
              className={commonStyles}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.occupation}
            </label>
            <select
              id="occupation"
              name="occupation"
              title={t.occupation}
              onChange={handleChange}
              className={commonStyles}
              value={form.occupation}
            >
              <option value="">{t.selectOccupation}</option>
              <option value="Student">{t.student}</option>
              <option value="Employed - Full Time">{t.employedFull}</option>
              <option value="Employed - Part Time">{t.employedPart}</option>
              <option value="Self-Employed">{t.selfEmployed}</option>
              <option value="Unemployed">{t.unemployed}</option>
              <option value="Retired">{t.retired}</option>
              <option value="Homemaker">{t.homemaker}</option>
              <option value="Freelancer">{t.freelancer}</option>
              <option value="Other">{t.otherOccupation}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.education}
            </label>
            <select
              id="education"
              name="education"
              title={t.education}
              onChange={handleChange}
              className={commonStyles}
              value={form.education}
            >
              <option value="">{t.selectEducation}</option>
              <option value="No Formal Education">{t.noFormal}</option>
              <option value="Primary School">{t.primary}</option>
              <option value="Secondary School">{t.secondary}</option>
              <option value="High School Diploma">{t.highSchool}</option>
              <option value="Associate Degree">{t.associate}</option>
              <option value="Bachelor's Degree">{t.bachelor}</option>
              <option value="Master's Degree">{t.master}</option>
              <option value="Doctorate (PhD)">{t.phd}</option>
              <option value="Other">{t.otherEducation}</option>
            </select>
          </div>
        </div>

        {submitError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{submitSuccess}</AlertDescription>
          </Alert>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || uploading || uploadingId || !idVerificationStatus?.isVerified}
          className="w-full mt-8 bg-[#26C6B0] text-white py-3 rounded-lg font-semibold hover:bg-[#20A090] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? dictionary.basicInfo?.uploading || "Submitting..." : t.continue}
        </button>
      </div>
    </div>
  )
}
