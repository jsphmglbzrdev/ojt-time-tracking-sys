import axios from "axios";

// Create Axios instance with validateStatus to prevent automatic error logging
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  validateStatus: () => true, // Don't throw on any status code - we'll handle it manually
});

// Add token automatically if exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle all responses uniformly
API.interceptors.response.use(
  (response) => {
    // Check if it's an error response
    if (response.status >= 400) {
      // Create an error object with the response data
      const error = new Error(response.data?.message || "Request failed");
      error.response = response;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // Network errors or other request issues
    return Promise.reject(error);
  }
);

export default API;
