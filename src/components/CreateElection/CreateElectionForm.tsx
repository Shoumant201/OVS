// pages/elections/create.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

const CreateElectionPage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));
  const [endDate, setEndDate] = useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd\'T\'HH:mm'));
  const [timezone, setTimezone] = useState('GMT+05:45');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Replace with your actual API call
      const response = await fetch('/api/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          startDate,
          endDate,
          timezone
        })
      });

      if (response.ok) {
        // Redirect to elections list or dashboard
        router.push('/elections');
      } else {
        // Handle error
        console.error('Failed to create election');
      }
    } catch (error) {
      console.error('Error creating election:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className='sm:mx-auto sm:w-full sm:max-w-md flex justify-center items-center'>
            <Link href="/" className="flex items-center">
                <div className="mr-2">
                    <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8H24V12H8V8Z" fill="#00a8ff" />
                        <path d="M10 14H26V18H10V14Z" fill="#00a8ff" />
                        <path d="M6 20H22V24H6V20Z" fill="#00a8ff" />
                    </svg>
                </div>
                <span className="text-4xl font-bold text-[#00a8ff]">OVS</span>
            </Link>
        </div>

                  
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create an Election
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Homecoming Court, Board of Directors"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <div className="mt-1">
                  <input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <div className="mt-1">
                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <div className="mt-1">
                <select
                  id="timezone"
                  name="timezone"
                  required
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="GMT+05:45">(GMT+05:45) Asia/Kathmandu</option>
                  <option value="GMT+00:00">(GMT+00:00) UTC</option>
                  <option value="GMT-05:00">(GMT-05:00) Eastern Time</option>
                  <option value="GMT-08:00">(GMT-08:00) Pacific Time</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.replace('/')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Election
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateElectionPage;