import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // {id, fullName, email, requiredHours}
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({
		type: null,
		message: null,
		success: false
	});

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Register user
  const register = async (formData) => {
    setLoading(true);
    setMessage({ type: null, message: null, success: false });
    try {
      const res = await API.post("/auth/register", formData);

      // If we get here, registration was successful
      if (res.data?.user && res.data?.token) {
        setUser(res.data.user);
        setToken(res.data.token);
        setLoading(false);
        setMessage({
          success: true,
          message: "Registration successful! Redirecting...",
          type: "success"
        });
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: res.data?.message || "Registration failed" };
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "Unable to connect to server";
      setMessage({
        success: false,
        message: errorMessage,
        type: "error"
      });
      return { success: false, message: errorMessage };
    }
  };

  // Login user
  const login = async (formData) => {
    setLoading(true);
    setMessage({ type: null, message: null, success: false });
    try {
      const res = await API.post("/auth/login", formData);

      // If we get here, login was successful
      if (res.data?.user && res.data?.token) {
        setUser(res.data.user);
        setToken(res.data.token);
        setLoading(false);
        setMessage({
          success: true,
          message: "Login successful! Redirecting...",
          type: "success"
        });
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: res.data?.message || "Login failed" };
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "Unable to connect to server";
      setMessage({
        success: false,
        message: errorMessage,
        type: "error"
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setMessage({ type: null, message: null, success: false });
  };

  // Forgot password - request reset link
  const forgotPassword = async (email) => {
    setLoading(true);
    setMessage({ type: null, message: null, success: false });
    try {
      const res = await API.post("/auth/forgot-password", { email });

      setLoading(false);
      const successMessage = res.data?.message || "If an account with that email exists, a password reset link has been sent";
      setMessage({
        success: true,
        message: successMessage,
        type: "success"
      });
      return { success: true, message: successMessage };
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "Failed to process request. Please try again.";
      setMessage({
        success: false,
        message: errorMessage,
        type: "error"
      });
      return { success: false, message: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword, confirmPassword) => {
    setLoading(true);
    setMessage({ type: null, message: null, success: false });
    try {
      // Frontend validation: confirmPassword is only used here, not sent to backend
      if (newPassword !== confirmPassword) {
        setLoading(false);
        const errorMessage = "Passwords do not match";
        setMessage({
          success: false,
          message: errorMessage,
          type: "error"
        });
        return { success: false, message: errorMessage };
      }

      // Send only newPassword in body, token in URL path
      const payload = { newPassword };
      console.log("Sending reset password request to /auth/reset-password/" + token);
      const res = await API.post(`/auth/reset-password/${token}`, payload);

      setLoading(false);
      setMessage({
        success: true,
        message: res.data?.message || "Password reset successful!",
        type: "success"
      });
      return { success: true, message: res.data?.message };
    } catch (err) {
      setLoading(false);
      console.error("Reset password error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message || "Failed to reset password. Please try again.";
      setMessage({
        success: false,
        message: errorMessage,
        type: "error"
      });
      return { success: false, message: errorMessage };
    }
  };

  const clearMessage = () => {
    setMessage({ type: null, message: null, success: false });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout, forgotPassword, resetPassword, message, clearMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
};
