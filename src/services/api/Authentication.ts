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
      const response = await AxiosInstance.get("/elections")
      return response.data
    } catch (error) {
      console.error("Error fetching elections:", error)
      return []
    }
  }
  
  // Get election by ID
  export const getElectionById = async (id: number | string): Promise<Election | null> => {
    try {
      const response = await AxiosInstance.get(`/elections/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching election with ID ${id}:`, error)
      return null
    }
  }
  
  // Get questions for an election
  export const getQuestionsByElectionId = async (electionId: number | string): Promise<Question[]> => {
    try {
      const response = await AxiosInstance.get(`/elections/questions/election/${electionId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching questions for election ${electionId}:`, error)
      return []
    }
  }
  
  // Get candidates for a question
  export const getCandidatesByQuestionId = async (questionId: number | string): Promise<Candidate[]> => {
    try {
      const response = await AxiosInstance.get(`/elections/getAllCandidates/${questionId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching candidates for question ${questionId}:`, error)
      return []
    }
  }
  
  // Vote in an election
  export const submitVote = async (
    electionId: number | string,
    questionId: number | string,
    candidateId: number | string,
  ): Promise<boolean> => {
    try {
      const response = await AxiosInstance.post("/votes", {
        election_id: electionId,
        question_id: questionId,
        candidate_id: candidateId,
      })
      return true
    } catch (error) {
      console.error("Error submitting vote:", error)
      return false
    }
  }
  
  export default {
    getAllElections,
    getElectionById,
    getQuestionsByElectionId,
    getCandidatesByQuestionId,
    submitVote,
  }