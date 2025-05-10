'use client';
import { getVotersByElectionId, deleteVote } from '@/services/api/Authentication';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Define proper types for the data structures
type Vote = {
  vote_id: number;
  user_id: string;
  candidate_name: string;
  question_text: string;
  question_id: string; // Added for better key handling
};

type GroupedVotes = {
  [key: string]: Vote[];
};

const Page = () => {
  const params = useParams();
  const electionId = params.id as string;
  const [voters, setVoters] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const fetchVoters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVotersByElectionId(electionId);
      
      // Handle nested voters structure - API returns {voters: {voters: Array}}
      if (data && data.voters) {
        // Check if voters is nested one level deeper
        if (data.voters.voters && Array.isArray(data.voters.voters)) {
          setVoters(data.voters.voters);
        } 
        // Check if voters is an array directly
        else if (Array.isArray(data.voters)) {
          setVoters(data.voters);
        } 
        else {
          console.error('API returned invalid data format:', data);
          setVoters([]);
          setError('Received invalid data format from server.');
        }
      } else {
        console.error('API returned invalid data format:', data);
        setVoters([]);
        setError('Received invalid data format from server.');
      }
    } catch (error) {
      console.error('Error fetching voters:', error);
      setError('Failed to load voters. Please try again later.');
      setVoters([]); // Ensure voters is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [electionId]);

  const handleDeleteConfirm = (id: number) => {
    setDeleteConfirmation(id);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVote(id);
      setVoters((prev) => prev.filter((vote) => vote.vote_id !== id));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting vote:', error);
      setError('Failed to delete vote. Please try again.');
    }
  };

  // Safely group voters by question, ensuring voters is an array
  const groupedVotes: GroupedVotes = Array.isArray(voters) 
    ? voters.reduce((acc: GroupedVotes, vote) => {
        const question = vote.question_text;
        if (!acc[question]) acc[question] = [];
        acc[question].push(vote);
        return acc;
      }, {})
    : {};

  // Get all unique questions for filtering
  const questions = Object.keys(groupedVotes);

  // Only show questions based on the selected filter
  const questionsToDisplay = selectedQuestion 
    ? [selectedQuestion] 
    : questions;

  const refreshData = () => {
    fetchVoters();
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Votes for Election #{electionId}</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            &times;
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="questionFilter" className="text-lg font-medium mr-2">Filter by Question:</label>
          <select
            id="questionFilter"
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            className="mt-2 p-2 border rounded-md"
          >
            <option value="">All Questions</option>
            {questions.map((question) => (
              <option key={question} value={question}>
                {question}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={refreshData}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : voters.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No votes found for this election.</p>
      ) : (
        questionsToDisplay.map((question) => (
          <div key={`question-${question}`} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-indigo-700">{question}</h3>
            <table className="min-w-full bg-white shadow-sm rounded mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-4">#</th>
                  <th className="text-left py-2 px-4">User ID</th>
                  <th className="text-left py-2 px-4">Candidate</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedVotes[question].map((vote, index) => (
                  <tr key={`vote-${vote.vote_id}`} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{vote.user_id}</td>
                    <td className="py-2 px-4">{vote.candidate_name}</td>
                    <td className="py-2 px-4">
                      {deleteConfirmation === vote.vote_id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete(vote.vote_id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation(null)}
                            className="bg-gray-400 hover:bg-gray-500 text-white py-1 px-2 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteConfirm(vote.vote_id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default Page;