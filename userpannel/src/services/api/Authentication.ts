import  AxiosInstance  from "../axiosInstance";
import ENDPOINTS from "../Endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";

export const useAdminLogin = () => {
    return useMutation({
        mutationFn: async (postdata: any) => {
            const res = await AxiosInstance.post(ENDPOINTS.AUTH.LOGIN, postdata);
            Cookies.set("token", res.data.token, { expires: 30 });
            return await res.data;
        }
    });
};

export async function verifyOTP(otp: string) {
    try {
      const tempToken = localStorage.getItem("tempToken")
  
      if (!tempToken) {
        return { error: "Authentication required" }
      }
  
      // Set the authorization header for this specific request
      const response = await AxiosInstance.post(
        ENDPOINTS.AUTH.VERIFY_OTP,
        { otp },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        },
      )
  
      // If successful, clear temp token and set the actual token
      if (response.data && response.data.token) {
        // Clear temp token
        localStorage.removeItem("tempToken")
  
        // Store actual token in cookies
        Cookies.set("token", response.data.token, { expires: 30 })
  
        return {
          success: true,
          token: response.data.token,
        }
      } else {
        return { error: "Invalid response from server" }
      }
    } catch (error: any) {
      console.error("OTP verification error:", error)
      return {
        error: error.response?.data?.message || "An unexpected error occurred",
      }
    }
  }

  // Resend OTP function
export async function resendOTP() {
    try {
      const tempToken = localStorage.getItem("tempToken")
  
      if (!tempToken) {
        return { error: "Authentication required" }
      }
  
      const response = await AxiosInstance.post(
        ENDPOINTS.AUTH.RESEND_OTP,
        {},
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        },
      )
  
      if (response.data) {
        return {
          success: true,
          message: response.data.message || "OTP resent successfully",
        }
      } else {
        return { error: "Invalid response from server" }
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      return {
        error: error.response?.data?.message || "An unexpected error occurred",
      }
    }
  }

  interface Election {
    id: number
    title: string
    description: string
    start_date: string
    end_date: string
    status: string
    voters: number
    ballot_questions: number
    options: number
    created_at: string
    updated_at: string
    created_by_admin: number | null
    created_by_commissioner: number | null
    launched: boolean
  }
  
  // Interface for Question
  interface Question {
    id: number
    title: string
    description?: string
    type: string
    election_id: number
    created_at: string
    updated_at: string
    min_selections?: number
    max_selections?: number
    shuffle?: boolean
  }
  
  // Interface for Candidate
  interface Candidate {
    id: number
    candidate_name: string
    candidate_bio?: string
    description?: string
    photo?: string
    question_id: number
    created_at: string
    updated_at: string
  }
  
  // Get all elections
  export const getAllElections = async (): Promise<Election[]> => {
    try {
      const response = await AxiosInstance.get(ENDPOINTS.ELECTION.getUserElections)
      return response.data
    } catch (error) {
      console.error("Error fetching elections:", error)
      return []
    }
  }
  
  // Get election by ID
  export const getElectionById = async (id: any): Promise<Election | null> => {
    try {
      const url = ENDPOINTS.ELECTION.getElectionById.replace(":id", id)
      const response = await AxiosInstance.get(url)
      return response.data
    } catch (error) {
      console.error(`Error fetching election with ID ${id}:`, error)
      return null
    }
  }
  
  // Get questions for an election
  export const getQuestionsByElectionId = async (electionId: any): Promise<Question[]> => {
    try {
      const url = ENDPOINTS.ELECTION.getQuestionsByElectionId.replace(":id", electionId)
      const response = await AxiosInstance.get(url)
      return response.data
    } catch (error) {
      console.error(`Error fetching questions for election ${electionId}:`, error)
      return []
    }
  }
  
  // Get candidates for a question
  export const getCandidatesByQuestionId = async (questionId: any): Promise<Candidate[]> => {
    try {
      const url = ENDPOINTS.ELECTION.getCandidatesByQuestionId.replace(":id", questionId)
      const response = await AxiosInstance.get(url)
      return response.data
    } catch (error) {
      console.error(`Error fetching candidates for question ${questionId}:`, error)
      return []
    }
  }
  
  
  interface Vote {
    election_id: any
    question_id: number
    candidate_id: number
  }
  
  // Check if the current user has already voted in this election
  export const checkUserVoteStatus = async (electionId: any): Promise<boolean> => {
    try {
      const url = ENDPOINTS.VOTE.checkVote.replace(":electionId", electionId)
      const response = await AxiosInstance.get(url)
      return response.data.hasVoted
    } catch (error) {
      console.error("Error checking vote status:", error)
      return false
    }
  }
  
  // Submit votes for an election
  export const submitVote = async (electionId: any, votes: Vote[]): Promise<boolean> => {
    try {
      const response = await AxiosInstance.post(ENDPOINTS.VOTE.submitVote, {
        election_id: electionId,
        votes: votes,
      })
      return response.data.success
    } catch (error: any) {
      console.error("Error submitting vote:", error)
  
      // If the user has already voted, handle that specific error
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data.message === "User has already voted in this election"
      ) {
        throw new Error("You have already voted in this election")
      }
  
      throw new Error(error.response?.data?.message || "Failed to submit vote")
    }
  }
  
  // Get results for an election
  export const getElectionResults = async (electionId: any) => {
    try {
      const url = ENDPOINTS.VOTE.getResults.replace(":electionId", electionId)
      const response = await AxiosInstance.get(url)
      return response.data
    } catch (error) {
      console.error("Error fetching election results:", error)
      throw error
    }
  }

  // Set a reminder for when an election starts
export const setElectionReminder = async (electionId: any) => {
  try {
    const url = ENDPOINTS.REMINDER.setReminder.replace(":electionId", electionId)
    const response = await AxiosInstance.post(url)
    return response.data
  } catch (error: any) {
    console.error("Error setting election reminder:", error)

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("You must be logged in to set a reminder")
    }

    if (error.response?.status === 404) {
      throw new Error("Election not found")
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || "Cannot set reminder for this election")
    }

    throw new Error(error.response?.data?.message || "Failed to set reminder")
  }
}

// Get all reminders for the current user
export const getUserReminders = async () => {
  try {
    const response = await AxiosInstance.get(ENDPOINTS.REMINDER.getAllReminder)
    return response.data.reminders
  } catch (error: any) {
    console.error("Error getting user reminders:", error)
    throw new Error(error.response?.data?.message || "Failed to get reminders")
  }
}

// Cancel a reminder
export const cancelReminder = async (reminderId: any) => {
  try {
    const url = ENDPOINTS.REMINDER.cancelReminder.replace(":reminderId", reminderId)
    const response = await AxiosInstance.delete(url)
    return response.data
  } catch (error: any) {
    console.error("Error cancelling reminder:", error)
    throw new Error(error.response?.data?.message || "Failed to cancel reminder")
  }
}

// Verify user password
export const verifyUserPassword = async (password: string): Promise<boolean> => {
  try {
    const response = await AxiosInstance.post(ENDPOINTS.AUTH.verifyPassword, { password })
    return response.data.success
  } catch (error: any) {
    console.error("Error verifying password:", error)

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Incorrect password")
    }

    throw new Error(error.response?.data?.message || "Failed to verify password")
  }
}
  
  export default {
    checkUserVoteStatus,
    submitVote,
    getElectionResults,
    getAllElections,
    getElectionById,
    getQuestionsByElectionId,
    getCandidatesByQuestionId,
  }
  