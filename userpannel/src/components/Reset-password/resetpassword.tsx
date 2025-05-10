'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/services/axiosInstance'; // Your custom axios instance
import { motion } from 'framer-motion';
import ENDPOINTS from '@/services/Endpoints';
import { type Locale } from "@/lib/dictionary"; // Assuming Locale type is defined here

interface ResetPasswordPageProps {
  dictionary: any; // You can create a more specific type for your dictionary
  locale: Locale;
}

const ResetPasswordPage = ({ dictionary, locale }: ResetPasswordPageProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Renamed for clarity
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const params = useParams();
  // Ensure token is extracted correctly. It might be an array if using catch-all routes.
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token as string;

  // Store locale in sessionStorage (optional)
  useEffect(() => {
    if (locale) {
      sessionStorage.setItem("currentLocale", locale);
    }
  }, [locale]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (!token) {
        setStatus('error');
        // Consider adding a specific dictionary key for "invalid token" or "token missing"
        setMessage(dictionary?.messages?.error || 'Invalid or missing reset token.');
        return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(dictionary['reset-password'].passwordMismatch);
      return;
    }

    // Optional: Add password strength validation here if needed

    setStatus('loading');

    try {
      const url = ENDPOINTS.AUTH.RESET_PASSWORD.replace(':token', token);
      // The backend expects 'newPassword', ensure your state variable 'password' is what you intend to send.
      const res = await axiosInstance.post(url, { newPassword: password }); 
      setStatus('success');
      setMessage(res.data?.message || dictionary['reset-password'].success);

      setTimeout(() => {
        // Consider redirecting with locale: router.push(`/${locale}/login`);
        router.push('/login'); 
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || dictionary['reset-password'].error);
    }
  };

  if (!dictionary || !dictionary['reset-password'] || !dictionary['messages']) {
    // Basic loading state or fallback
    return <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">Loading translations...</div>;
  }

  const t = dictionary['reset-password'];
  const commonInputStyles = "w-full px-4 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26C6B0] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] px-4 py-8">
      <motion.div
        className="max-w-md w-full bg-white dark:bg-black rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700 dark:text-gray-100">
          {t.title}
        </h2>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="newPasswordInput" className="sr-only">{t.newPassword}</label>
            <input
              id="newPasswordInput"
              type="password"
              placeholder={t.newPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={commonInputStyles}
              required
              aria-describedby="passwordMessage"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPasswordInput" className="sr-only">{t.confirmNewPassword}</label>
            <input
              id="confirmNewPasswordInput"
              type="password"
              placeholder={t.confirmNewPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={commonInputStyles}
              required
              aria-describedby="passwordMessage"
            />
          </div>

          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-[#26C6B0] text-white font-medium rounded-md hover:bg-[#20A090] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? t.resetting : t.button}
          </motion.button>
        </form>

        {message && ( // Render message only if it's not empty
          <p
            id="passwordMessage"
            className={`mt-5 text-center text-sm ${
              status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}
            role="alert" // Add role for accessibility
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;