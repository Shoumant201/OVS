import AxiosInstance from "@/services/axiosInstance"
import { Endpoints } from "../Endpoints"

// Get all questions for an election
export const getQuestionsByElectionId = async (electionId: string) => {
  try {
    // Log the URL for debugging
    const url = Endpoints.BALLOT.getQuestionByElectionId.replace(":id", electionId.toString())
    console.log("Fetching questions with URL:", url)

    const response = await AxiosInstance.get(url)

    // Log the response for debugging
    console.log("Questions API response:", response)

    // Check the structure of the response
    if (response.data && Array.isArray(response.data)) {
      // If response.data is already an array, return it
      return response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      // If response.data.data is an array, return it
      return response.data.data
    } else if (response.data && typeof response.data === "object") {
      // If response.data is not an array, log it for debugging
      console.log("Response data is not an array:", response.data)
      // Return an empty array to prevent errors
      return []
    } else {
      // If none of the above, return an empty array
      console.log("Unexpected response format:", response.data)
      return []
    }
  } catch (error: any) {
    console.error("Error fetching questions:", error)
    // Log more details about the error
    if (error.response) {
      console.error("Error response data:", error.response.data)
      console.error("Error response status:", error.response.status)
    }
    // Return an empty array instead of throwing to prevent errors
    return []
  }
}

// Get all candidates/options for a question
export const getCandidatesByQuestionId = async (questionId: string) => {
  try {
    const url = Endpoints.BALLOT.getCandidateByQuestionId.replace(":id", questionId.toString())
    console.log("Fetching candidates with URL:", url)

    const response = await AxiosInstance.get(url)
    console.log("Candidates API response:", response)

    // Check the structure of the response
    if (response.data && Array.isArray(response.data)) {
      // If response.data is already an array, return it
      return response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      // If response.data.data is an array, return it
      return response.data.data
    } else {
      // If none of the above, return an empty array
      console.log("Unexpected response format:", response.data)
      return []
    }
  } catch (error: any) {
    console.error("Error fetching candidates:", error)
    // Return an empty array instead of throwing
    return []
  }
}

// Fix the createQuestion function to better handle the response

export const createQuestion = async (questionData: {
  election_id: string
  title: string
  description?: string
  shuffle?: boolean
}) => {
  try {
    // Log the request data for debugging
    console.log("Creating question with data:", questionData)

    const response = await AxiosInstance.post(Endpoints.BALLOT.createQuestion, questionData)
    console.log("Create question response:", response)

    // Check the full response structure
    if (response.data) {
      console.log("Response data:", response.data)

      // Try to extract the question data based on different possible response formats
      if (response.data.data) {
        return response.data.data
      } else if (response.data.question) {
        return response.data.question
      } else if (response.data.id) {
        // If the response itself has an ID, it might be the question object directly
        return response.data
      } else {
        console.warn("Unexpected response format:", response.data)
        // Create a minimal question object to prevent errors
        return {
          id: `temp-${Date.now()}`,
          title: questionData.title,
          description: questionData.description,
          shuffle: questionData.shuffle,
        }
      }
    } else {
      console.warn("No data in response:", response)
      // Create a minimal question object to prevent errors
      return {
        id: `temp-${Date.now()}`,
        title: questionData.title,
        description: questionData.description,
        shuffle: questionData.shuffle,
      }
    }
  } catch (error: any) {
    console.error("Error creating question:", error)

    // Log more details about the error
    if (error.response) {
      console.error("Error response data:", error.response.data)
      console.error("Error response status:", error.response.status)
    }

    throw error
  }
}

// Update an existing question
export const updateQuestion = async (
  questionId: string,
  questionData: { title: string; description?: string; shuffle?: boolean },
) => {
  try {
    console.log("Updating question with ID:", questionId, "and data:", questionData)

    const url = Endpoints.BALLOT.updateQuestion.replace(":id", questionId.toString())
    const response = await AxiosInstance.put(url, questionData)

    console.log("Update question response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error updating question:", error)
    throw error
  }
}

// Delete a question
export const deleteQuestion = async (questionId: string) => {
  try {
    console.log("Deleting question with ID:", questionId)

    const url = Endpoints.BALLOT.deleteQuestion.replace(":id", questionId.toString())
    const response = await AxiosInstance.delete(url)

    console.log("Delete question response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error deleting question:", error)
    throw error
  }
}

// Fix the createCandidate function to use image instead of photo
export const createCandidate = async (candidateData: {
  question_id: string
  candidate_name: string
  candidate_bio?: string
  description?: string
  image?: string // Changed from photo to image
}) => {
  try {
    console.log("Creating candidate with data:", candidateData)

    // Ensure candidate_name is not undefined
    const payload = {
      ...candidateData,
      candidate_name: candidateData.candidate_name || "",
      candidate_bio: candidateData.candidate_bio || "",
      description: candidateData.description || "",
      // Make sure image is included in the payload
      image: candidateData.image || "",
    }

    const response = await AxiosInstance.post(Endpoints.BALLOT.createCandidate, payload)
    console.log("Create candidate response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error creating candidate:", error)
    throw error
  }
}

// Fix the updateCandidate function to use image instead of photo
export const updateCandidate = async (
  candidateId: string,
  candidateData: {
    candidate_name?: string
    candidate_bio?: string
    description?: string
    image?: string // Changed from photo to image
  },
) => {
  try {
    console.log("Updating candidate with ID:", candidateId, "and data:", candidateData)

    const url = Endpoints.BALLOT.updateCandidate.replace(":id", candidateId.toString())
    const response = await AxiosInstance.put(url, candidateData)

    console.log("Update candidate response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error updating candidate:", error)
    throw error
  }
}

// Delete a candidate/option
export const deleteCandidate = async (candidateId: string) => {
  try {
    console.log("Deleting candidate with ID:", candidateId)

    const url = Endpoints.BALLOT.deleteCandidate.replace(":id", candidateId.toString())
    const response = await AxiosInstance.delete(url)

    console.log("Delete candidate response:", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error deleting candidate:", error)
    throw error
  }
}
