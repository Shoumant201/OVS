'use client'
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance'; // Using your custom axiosInstance
import ENDPOINTS from '@/services/Endpoints';
import { type Locale } from '@/lib/dictionary'; // Assuming Locale type is defined here
import { Loader2 } from 'lucide-react'; // For a loading spinner

// Props for the page component
interface VerifyPageProps {
  dictionary: any;
  locale: Locale;
}

const VerifyPage = ({ dictionary, locale }: VerifyPageProps) => {
  const params = useParams();
  const router = useRouter();
  
  // Ensure token is extracted correctly. It might be an array if using catch-all routes.
  const tokenFromParams = Array.isArray(params?.token) ? params.token[0] : params?.token as string;
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed' | 'idle'>('idle');
  const [token, setToken] = useState<string | null>(null);

  // Translations
  const t = dictionary?.['verify-page'] || {};

  // Set token once params are available
  useEffect(() => {
    if (tokenFromParams) {
      setToken(tokenFromParams);
      setStatus('verifying'); // Start verification once token is set
    } else {
      // Handle missing token case, maybe redirect or show an error
      console.error("Verification token is missing from URL.");
      setStatus('failed'); // Or a new status like 'invalid_request'
    }
  }, [tokenFromParams]);


  useEffect(() => {
    // Optional: Store locale in sessionStorage if needed for other client-side logic
    if (locale) {
      sessionStorage.setItem("currentLocale", locale);
    }
  }, [locale]);

  useEffect(() => {
    const verifyEmail = async () => {
      if (status !== 'verifying' || !token) return; // Only run if verifying and token exists

      try {
        const url = ENDPOINTS.AUTH.VERIFY_EMAIL.replace(':token', token);
        const res = await axiosInstance.get(url); // Use axiosInstance

        if (res.status === 200) {
          setStatus('success');
          setTimeout(() => router.push(`/${locale}/login`), 3000); // Redirect with locale
        } else {
          // This else block might not be hit if non-200 status throws an error
          setStatus('failed');
          setTimeout(() => router.push(`/${locale}/login`), 5000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setTimeout(() => router.push(`/${locale}/login`), 5000);
      }
    };

    verifyEmail();
  }, [token, router, locale, status]); // Add status to dependencies

  // Fallback if dictionary is not loaded
  if (Object.keys(t).length === 0 && status !== 'idle') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-[#26C6B0] mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      );
  }
  if (status === 'idle') {
    // This state is brief, usually before token is processed.
    // Could show a generic "Please wait..." or nothing.
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-[#26C6B0] mb-4" />
        </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50 dark:bg-black">
      {status === 'verifying' && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-[#26C6B0] mb-6" />
          <p className="text-xl text-gray-700 dark:text-gray-300">{t.verifyingEmail || "Verifying your email..."}</p>
        </>
      )}
      {status === 'success' && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <p className="text-green-600 dark:text-green-400 text-2xl font-semibold mb-3">{t.emailVerified || "✅ Email verified successfully!"}</p>
          <p className="text-gray-500 dark:text-gray-400">{t.redirectingLogin || "Redirecting to login..."}</p>
        </div>
      )}
      {status === 'failed' && (
         <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <p className="text-red-600 dark:text-red-400 text-2xl font-semibold mb-3">{t.verificationFailed || "❌ Verification failed!"}</p>
          <p className="text-gray-500 dark:text-gray-400">{t.redirectingLogin || "Redirecting to login..."}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyPage;