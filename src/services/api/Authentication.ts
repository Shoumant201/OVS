import AxiosInstance from "../axiosInstance"
import { Endpoints } from "../Endpoints"
import { AxiosError } from 'axios';
import Cookies from "js-cookie";

export const getUsersAPI = async () => {
    try {
      const response = await AxiosInstance.get(Endpoints.USER.getUsers)
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  }
  
  export const banUserAPI = async (userId: number | string) => {
    try {
      const url = Endpoints.USER.banUser.replace(":id", userId.toString())
      const response = await AxiosInstance.put(url)
      return response.data
    } catch (error) {
      console.error("Error banning user:", error)
      throw error
    }
  }
  
  export const unbanUserAPI = async (userId: number | string) => {
    try {
      const url = Endpoints.USER.unbanUser.replace(":id", userId.toString())
      const response = await AxiosInstance.put(url)
      return response.data
    } catch (error) {
      console.error("Error unbanning user:", error)
      throw error
    }
  }
  
  export const deleteUserAPI = async (userId: number | string) => {
    try {
      const url = Endpoints.USER.deleteUser.replace(":id", userId.toString())
      const response = await AxiosInstance.delete(url)
      return response.data
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  }

  // Function to create an election
  export const createElection = async (title:any, start_date:any, end_date:any) => {
    try {

      const userType = Cookies.get('userType');

      // Send the POST request to create the election
      const response = await AxiosInstance.post(Endpoints.ELECTION.createElection, {
        title,
        start_date,
        end_date,
      });

      return response.data; // Assuming the response has the election data
    } catch (error) {
      // Check if the error is an AxiosError
    if (error instanceof AxiosError) {
      // Handle the Axios error (e.g., network error, server error, etc.)
      console.error("Axios error creating election:", error.response?.data || error.message);
      throw error.response?.data || error.message;  // Propagate the Axios error details
    } else if (error instanceof Error) {
      // Handle generic JavaScript errors
      console.error("General error creating election:", error.message);
      throw error.message;  // Propagate the general error message
    } else {
      // In case the error is something unexpected
      console.error("Unexpected error:", error);
      throw "An unknown error occurred.";
    }
  }
  };

  export const getAllElections = async () => {
    try {
      const response = await AxiosInstance.get(Endpoints.ELECTION.getAllElection)
      return response.data
    } catch (error) {
      console.error("Error fetching elections:", error)
      throw error
    }
  } 

  export const getElectionById = async (id:any) => {
    try{
      const endpoint = Endpoints.ELECTION.getElectionByID.replace(":id", id.toString())
      const response = await AxiosInstance.get(endpoint);
      return response.data
    } catch (error) {
      console.error("Error fetching elections:", error)
      throw error
    }
  }