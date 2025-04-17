'use client'; // if you're using the app router

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '@/services/axiosInstance';
import ENDPOINTS from '@/services/Endpoints';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });

      setStatus('success');
      setMessage(res.data?.message || 'Reset link sent. Please check your inbox.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-8"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-[#26C6B0] text-white font-medium rounded-md"
          >
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </motion.button>
        </form>

        {status !== 'idle' && (
          <p
            className={`mt-4 text-sm text-center ${
              status === 'success' ? 'text-green-600' : 'text-red-500'
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
