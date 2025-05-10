"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Mail, Ban } from "lucide-react";
import ENDPOINTS from "@/services/Endpoints";
import axiosInstance from "@/services/axiosInstance";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Corrected import
import { type Locale } from "@/lib/dictionary"; // Assuming Locale type is defined here

interface TwoFAPageProps {
  dictionary: any; // You can create a more specific type for your dictionary
  locale: Locale;
}

export default function TwoFAPage({ dictionary, locale }: TwoFAPageProps) {
  const [isLoading, setIsLoading] = useState(false); // Changed to boolean and renamed for clarity
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    if (locale) {
      sessionStorage.setItem("currentLocale", locale);
    }
  }, [locale]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = Cookies.get("token");
    if (!token) {
      console.error("No token found");
      setErrorMessage(dictionary?.messages?.error || "Authentication token not found."); // Generic error
      setIsLoading(false);
      return;
    }

    let userId;
    try {
      const decoded = jwtDecode<{ id: string; user_id?: string }>(token); // Added user_id as potential property
      userId = decoded?.id || decoded?.user_id; // Check for both id and user_id
    } catch (error) {
      console.error("Failed to decode token:", error);
      setErrorMessage(dictionary?.messages?.error || "Invalid authentication token.");
      setIsLoading(false);
      return;
    }
    

    if (!userId) {
      console.error("User ID not found in token");
      setErrorMessage(dictionary?.messages?.error || "User identification failed.");
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post(ENDPOINTS.AUTH.SETUP_2FA, {
        user_id: userId,
        is_2faenabled: is2FAEnabled,
      });

      await axiosInstance.post(ENDPOINTS.AUTH.ENABLE_ONBOARDING, {
        user_id: userId,
        onboarding: true,
      });
      Cookies.remove("token");
      window.location.href = "/login"; // Consider using Next.js router.push for client-side navigation
    } catch (err: any) {
      console.error("2FA setup failed", err);
      const apiError = err?.response?.data?.message || dictionary?.messages?.['2faError'] || "2FA setup failed. Please try again.";
      setErrorMessage(apiError);
      setIsLoading(false);
    }
  };

  if (!dictionary || !dictionary["two-fa"] || !dictionary["messages"]) {
    // Fallback or loading state for translations
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const t = dictionary["two-fa"];
  const tMessages = dictionary["messages"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-black shadow-xl rounded-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <ShieldCheck className="mx-auto text-[#26C6B0]" size={40} />
            <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
              {t.secureVotingAccess}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {t.chooseVerificationMethod}
            </p>
          </div>

          <div className="space-y-4">
            <label
              htmlFor="email-2fa" // Changed id to be more unique
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition hover:border-[#26C6B0] ${
                is2FAEnabled === true
                  ? "border-[#26C6B0] bg-teal-50 dark:bg-teal-900/30 dark:border-teal-500"
                  : "border-gray-300 dark:border-gray-600 hover:dark:border-gray-500"
              }`}
            >
              <input
                type="radio"
                id="email-2fa"
                name="2fa_option" // Changed name for radio group
                value="true"
                checked={is2FAEnabled === true}
                onChange={() => setIs2FAEnabled(true)}
                className="sr-only" // Visually hide but keep accessible
                aria-describedby="email-desc"
              />
              <Mail className="text-[#26C6B0]" />
              <div id="email-desc">
                <p className="font-medium text-gray-800 dark:text-gray-200">{t.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.emailDescription}
                </p>
              </div>
            </label>

            <label
              htmlFor="none-2fa" // Changed id to be more unique
              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition hover:border-gray-400 dark:hover:border-gray-500 ${
                is2FAEnabled === false
                  ? "border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <input
                type="radio"
                id="none-2fa"
                name="2fa_option" // Changed name for radio group
                value="false"
                checked={is2FAEnabled === false}
                onChange={() => setIs2FAEnabled(false)}
                className="sr-only" // Visually hide but keep accessible
                aria-describedby="no2fa-desc"
              />
              <Ban className="text-red-500" />
              <div id="no2fa-desc">
                <p className="font-medium text-red-600 dark:text-red-400">{t.no2FA}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.no2FADescription}
                </p>
              </div>
            </label>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{errorMessage}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#26C6B0] hover:bg-[#20A090] transition text-white py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (dictionary.basicInfo?.uploading || "Processing...") : t.continue}
          </button>
        </div>
      </div>
    </div>
  );
}