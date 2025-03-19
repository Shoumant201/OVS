'use client';
import withAuth from '../../hoc/withAuth'
import React from 'react'
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    router.replace("/pages/login");
  };

  return (
    <div>
      <p>Dashboard</p>
      <button onClick={handleLogout} className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
    </div>
  )
}

export default withAuth(DashboardPage);
