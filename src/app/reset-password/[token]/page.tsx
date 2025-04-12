'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import axiosInstance from '@/services/axiosInstance'; // Your custom axios instance
import { motion } from 'framer-motion';
import ENDPOINTS from '@/services/Endpoints';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');

    try {
      const url= ENDPOINTS.AUTH.RESET_PASSWORD.replace(':token', token)
      const res = await axiosInstance.post(url, { newPassword:password });
      setStatus('success');
      setMessage(res.data.message || 'Password reset successful! Redirecting...');

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Reset Password
        </h2>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

        {status !== 'idle' && (
          <p
            className={`mt-4 text-center text-sm ${
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

export default ResetPasswordPage;
