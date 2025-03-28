import axios from "axios"
import Cookies from "js-cookie"

// Create axios instance with base URL
const AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token to requests
AxiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookies or localStorage
    const token = Cookies.get("adminToken") || localStorage.getItem("adminToken")

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`

      // Log for debugging (remove in production)
      console.log("Adding token to request:", token.substring(0, 20) + "...")
    } else {
      console.log("No token found for request")
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
AxiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized request - clearing auth data")

      // Clear auth data
      Cookies.remove("adminToken")
      localStorage.removeItem("adminToken")

      // Redirect to login page if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/pages/login"
      }
    }

    return Promise.reject(error)
  },
)

export default AxiosInstance

