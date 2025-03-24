import axios from "axios"
import Cookies from "js-cookie"

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
    // Try to get token from cookies first (for consistency with login page)
    let token: string | null | undefined = Cookies.get("adminToken")

    // Fallback to localStorage if not in cookies
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("adminToken")
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
      // Clear token from both storage mechanisms
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken")
        Cookies.remove("adminToken")

        // Check if we're not already on the login page to prevent redirect loops
        if (!window.location.pathname.includes("/adminLogin")) {
          window.location.href = "/Admin/adminLogin"
        }
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

