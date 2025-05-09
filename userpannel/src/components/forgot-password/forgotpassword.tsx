// forgot-password-page.tsx (or whatever you name the file)
"use client"; // if you're using the app router

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '@/services/axiosInstance';
import ENDPOINTS from '@/services/Endpoints';
import { type Locale } from "@/lib/dictionary"; // Assuming Locale type is defined here

interface ForgotPasswordPageProps {
  dictionary: any; // You can create a more specific type for your dictionary if you wish
  locale: Locale;
}

const ForgotPasswordPage = ({ dictionary, locale }: ForgotPasswordPageProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Optional: Store locale in sessionStorage if needed for other client-side logic
  useEffect(() => {
    if (locale) {
      sessionStorage.setItem("currentLocale", locale);
    }
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage(''); // Clear previous messages

    try {
      const res = await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setStatus('success');
      // Use server message if available, otherwise use dictionary
      setMessage(res.data?.message || dictionary['forgot-password'].successMessage);
    } catch (error: any) {
      setStatus('error');
      // Use server error message if available, otherwise use dictionary
      setMessage(error?.response?.data?.message || dictionary['forgot-password'].errorMessage);
    }
  };

  // Ensure dictionary is loaded before rendering text
  if (!dictionary || !dictionary['forgot-password']) {
    // You might want a more sophisticated loading state or fallback
    return <div>Loading translations...</div>;
  }

  const t = dictionary['forgot-password'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-[#121212]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-black rounded-xl shadow-md p-8"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-200">
          {t.title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholderEmail}
            className="w-full px-4 h-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-[#26C6B0] text-white font-medium rounded-md disabled:opacity-50"
          >
            {status === 'loading' ? t.buttonSending : t.buttonSendResetLink}
          </motion.button>
        </form>

        {message && ( // Only show message if it's not empty
          <p
            className={`mt-4 text-sm text-center ${
              status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;