import AxiosInstance from "../axiosInstance"
import { Endpoints } from "../Endpoints"

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
  
  