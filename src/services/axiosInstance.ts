import axios from "axios"

// Create a custom axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/authentication
})

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle common response scenarios
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response?.status === 401) {
      // Clear token and redirect to login if on client side
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        window.location.href = "/auth/login"
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error("Permission denied:", error.response.data)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

