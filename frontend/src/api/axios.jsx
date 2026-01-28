import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  validateStatus: function (status) {
    // Don't throw on any status code - let components handle responses
    return true;
  }
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

// Handle responses uniformly
API.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default API;
