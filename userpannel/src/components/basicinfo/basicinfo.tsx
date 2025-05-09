"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosInstance";
import axios from "axios"; // Assuming this is for a direct /api/upload call
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import ENDPOINTS from "@/services/Endpoints";
import { type Locale } from "@/lib/dictionary"; // Assuming Locale type is defined here

interface BasicInfoPageProps {
  dictionary: any; // Consider creating a more specific type for your dictionary
  locale: Locale;
}

interface DecodedToken {
  email: string;
  id: string;
  // Add other properties from your token if needed, e.g., user_id
  user_id?: string; 
}

export default function BasicInfoPage({ dictionary, locale }: BasicInfoPageProps) {
  const [initialUserId, setInitialUserId] = useState<string>("");
  const [initialUserEmail, setInitialUserEmail] = useState<string>("");
  const [tokenLoaded, setTokenLoaded] = useState<boolean>(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setInitialUserId(decoded.id || decoded.user_id || ""); // Check both id and user_id
        setInitialUserEmail(decoded.email || "");
      } catch (error) {
        console.error("Failed to decode token:", error);
        // Handle error, e.g., redirect to login or show an error message
        // For now, it will proceed with empty initial values if decoding fails
      }
    } else {
      console.warn("No token found for BasicInfoPage. User might need to be redirected.");
      // Potentially redirect to login
    }
    setTokenLoaded(true);
  }, []);
  
  const [form, setForm] = useState({
    user_id: "", // Will be set by useEffect
    fullName: "",
    email: "", // Will be set by useEffect
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
  });

  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  // Update form with initial user ID and email once token is decoded
  useEffect(() => {
    if (tokenLoaded) {
      setForm(prevForm => ({
        ...prevForm,
        user_id: initialUserId,
        email: initialUserEmail,
      }));
    }
  }, [initialUserId, initialUserEmail, tokenLoaded]);

  // Store locale in sessionStorage (optional)
  useEffect(() => {
    if (locale) {
      sessionStorage.setItem("currentLocale", locale);
    }
  }, [locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Assuming /api/upload is your backend endpoint for image uploads
      const res = await axios.post("/api/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setForm({ ...form, profileImage: res.data.url });
    } catch (err) {
      console.error("Upload failed", err);
      setSubmitError(dictionary?.messages?.profileUpdateFailed || "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.user_id) {
        setSubmitError(dictionary?.messages?.error || "User identification failed. Please try again.");
        return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      user_id: form.user_id,
      full_name: form.fullName,
      email: form.email, // Email is read-only, but included in payload
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
    };

    try {
      await axiosInstance.post(ENDPOINTS.AUTH.CREATE_USERPROFILE, payload);
      window.location.href = "/onboarding/2fa"; // Or use Next.js router.push
    } catch (err: any) {
      console.error("Failed to save info", err);
      const apiError = err?.response?.data?.message || dictionary?.messages?.profileUpdateFailed || "Failed to save profile information.";
      setSubmitError(apiError);
      setIsSubmitting(false);
    }
  };

  if (!tokenLoaded || !dictionary || !dictionary["basic-info"] || !dictionary["messages"]) {
    // Basic loading state while token and dictionary are being processed
    return <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">Loading...</div>;
  }

  const t = dictionary["basic-info"];
  const commonStyles = "border p-3 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-[#26C6B0] focus:border-[#26C6B0] outline-none";
  const readOnlyStyles = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed";


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-black shadow-xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          {t.title}
        </h2>

        <div className="flex flex-col items-center mb-8">
          {form.profileImage ? (
            <img
              src={form.profileImage}
              alt={t.profileImageAlt || "Profile"} // Add profileImageAlt to dictionary if needed
              className="w-32 h-32 rounded-full object-cover shadow-lg border-2 border-[#26C6B0]"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm shadow-md">
              {t.noImage}
            </div>
          )}

          <label htmlFor="profile-image-upload" className="mt-4 cursor-pointer text-sm text-[#26C6B0] hover:text-[#1F9A8A] font-medium">
            {dictionary.profileInformation?.changeProfilePicture || "Change Profile Picture"}
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            aria-label={t.changeProfilePicture || "Upload profile image"}
            onChange={handleImageUpload}
            className="hidden" // Visually hidden, triggered by label
          />
          {uploading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t.uploading}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.fullName}</label>
            <input id="fullName" name="fullName" placeholder={t.fullName} value={form.fullName} onChange={handleChange} className={commonStyles} />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.email}</label>
            <input id="email" name="email" title={t.email} value={form.email} readOnly className={`${commonStyles} ${readOnlyStyles}`} />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
            <input id="phone" name="phone" placeholder={t.phone} value={form.phone} onChange={handleChange} className={commonStyles} />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.dob}</label>
            <input id="dob" name="dob" aria-label={t.dob} type="date" value={form.dob} onChange={handleChange} className={`${commonStyles} dark:[color-scheme:dark]`} />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.gender}</label>
            <select id="gender" name="gender" title={t.gender} value={form.gender} onChange={handleChange} className={commonStyles}>
              <option value="">{t.selectGender}</option>
              <option value="Male">{t.male}</option>
              <option value="Female">{t.female}</option>
              <option value="Other">{t.otherGender}</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.country}</label>
            <input id="country" name="country" placeholder={t.country} value={form.country} onChange={handleChange} className={commonStyles} />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.state}</label>
            <input id="state" name="state" placeholder={t.state} value={form.state} onChange={handleChange} className={commonStyles} />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.city}</label>
            <input id="city" name="city" placeholder={t.city} value={form.city} onChange={handleChange} className={commonStyles} />
          </div>
          
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.postalCode}</label>
            <input id="postalCode" name="postalCode" placeholder={t.postalCode} value={form.postalCode} onChange={handleChange} className={commonStyles} />
          </div>

          <div>
            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.ethnicity}</label>
            <input id="ethnicity" name="ethnicity" placeholder={t.ethnicity} value={form.ethnicity} onChange={handleChange} className={commonStyles} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.occupation}</label>
            <select id="occupation" name="occupation" title={t.occupation} onChange={handleChange} className={commonStyles} value={form.occupation}>
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
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.education}</label>
            <select id="education" name="education" title={t.education} onChange={handleChange} className={commonStyles} value={form.education}>
                <option value="">{t.selectEducation}</option>
                <option value="No Formal Education">{t.noFormal}</option>
                <option value="Primary School">{t.primary}</option>
                <option value="Secondary School">{t.secondary}</option>
                <option value="High School Diploma">{t.highSchool}</option>
                <option value="Associate Degree">{t.associate}</option>
                <option value="Bachelor’s Degree">{t.bachelor}</option> {/* Ensure 'bachelor’s' matches JSON key */}
                <option value="Master’s Degree">{t.master}</option> {/* Ensure 'master’s' matches JSON key */}
                <option value="Doctorate (PhD)">{t.phd}</option>
                <option value="Other">{t.otherEducation}</option>
            </select>
          </div>
        </div>

        {submitError && (
            <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">{submitError}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || uploading}
          className="w-full mt-8 bg-[#26C6B0] text-white py-3 rounded-lg font-semibold hover:bg-[#20A090] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (dictionary.basicInfo?.uploading || "Submitting...") : t.continue}
        </button>
      </div>
    </div>
  );
}