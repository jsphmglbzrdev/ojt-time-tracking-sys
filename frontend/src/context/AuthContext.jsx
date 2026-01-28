import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: null,
    message: null
  });

  // Keep token in sync
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchCurrentUser(); // fetch user dynamically on refresh
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const clearMessage = () => {
    setMessage({ type: null, message: null });
  };

  // ===============================
  // FETCH CURRENT USER (NEW)
  // ===============================
  const fetchCurrentUser = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200 && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGIN
  // ===============================
  const login = async (formData) => {
    setLoading(true);
    clearMessage();

    try {
      const res = await API.post("/auth/login", formData);

      if (res.status === 200 && res.data?.token) {
        const { token, user } = res.data;
        setUser(user);
        setToken(token);

        setMessage({
          type: "success",
          message: "Login successful"
        });

        return { success: true };
      }

      setMessage({
        type: "error",
        message: res.data?.message
      });

      return { success: false };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid email or password";

      setMessage({
        type: "error",
        message: errorMessage
      });

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // REGISTER
  // ===============================
  const register = async (formData) => {
    setLoading(true);
    clearMessage();

    try {
      const res = await API.post("/auth/register", formData);

      if (res.status === 201 && res.data?.token) {
        const { token, user } = res.data;

        setUser(user);
        setToken(token);

        setMessage({
          type: "success",
          message: "Registration successful"
        });

        return { success: true };
      }
      setMessage({
        type: "error",
        message: res.data?.message
      });

      return { success: false };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed";

      setMessage({
        type: "error",
        message: errorMessage
      });

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    setUser(null);
    setToken(null);
    clearMessage();
    localStorage.removeItem("token");
  };

  // ===============================
  // FORGOT PASSWORD
  // ===============================
  const forgotPassword = async (email) => {
    setLoading(true);
    clearMessage();

    try {
      const res = await API.post("/auth/forgot-password", { email });

      setMessage({
        type: "success",
        message: res.data.message
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Request failed";

      setMessage({
        type: "error",
        message: errorMessage
      });

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RESET PASSWORD
  // ===============================
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    clearMessage();

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { newPassword });

      setMessage({
        type: "success",
        message: res.data.message
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Reset failed";

      setMessage({
        type: "error",
        message: errorMessage
      });

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        message,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        clearMessage,
        fetchCurrentUser // expose it if needed elsewhere
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
