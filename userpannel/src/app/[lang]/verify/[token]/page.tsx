'use client'
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/services/axiosInstance'; // Adjust path based on where you keep your AxiosInstance
import  ENDPOINTS  from '@/services/Endpoints'; // Adjust path based on your project structure

const VerifyPage = () => {
  const params = useParams();
  const router = useRouter();
  
  const token = params?.token as string;
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
        if (!token) return;

      try {
        const url = ENDPOINTS.AUTH.VERIFY_EMAIL.replace(':token', token);
        const res = await axios.get(url); // assuming it's a GET endpoint

        if (res.status === 200) {
          setStatus('success');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('failed');
          setTimeout(() => router.push('/login'), 5000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setTimeout(() => router.push('/login'), 5000);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      {status === 'verifying' && <p className="text-lg">Verifying your email...</p>}
      {status === 'success' && (
        <div>
          <p className="text-green-600 text-xl font-semibold">✅ Email verified successfully!</p>
          <p className="mt-2 text-gray-500">Redirecting to login...</p>
        </div>
      )}
      {status === 'failed' && (
        <div>
          <p className="text-red-600 text-xl font-semibold">❌ Verification failed!</p>
          <p className="mt-2 text-gray-500">Redirecting to login...</p>
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
