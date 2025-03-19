import axios from "axios";
import Cookies from "js-cookie"

//baseurl and axios instance
export const baseUrl = "http://localhost:5004/api"; //conditionally; define dev localhost: 4949; 

export const Axios = axios.create({
  baseURL: baseUrl,
});

Axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
