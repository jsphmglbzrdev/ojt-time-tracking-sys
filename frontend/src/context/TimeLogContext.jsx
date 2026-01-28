import { createContext, useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TimeLogContext = createContext();

export const TimeLogProvider = ({ children }) => {
  const { token } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [requiredHours, setRequiredHours] = useState(0);
  const [loading, setLoading] = useState(false);

  // Computed values for dashboard
  const [totalHours, setTotalHours] = useState(0);
  const [remainingHours, setRemainingHours] = useState(0);
  const [progress, setProgress] = useState(0);

  // Fetch current user to get requiredHours dynamically
  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user;
      if (user?.requiredHours) {
        setRequiredHours(user.requiredHours);
      } else {
        setRequiredHours(400); // fallback default
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setRequiredHours(400);
    }
  };

  // Fetch time logs for current user
  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/timelog/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedLogs = res.data || [];
      setLogs(fetchedLogs);

      // Compute total hours dynamically
      const total = fetchedLogs.reduce(
        (acc, log) => acc + (log.totalHours || 0),
        0
      );
      setTotalHours(total);

      // Compute remaining hours and progress
      const remaining = Math.max(0, (requiredHours || 400) - total);
      setRemainingHours(remaining);

      const computedProgress = Math.min(
        100,
        ((total / (requiredHours || 400)) * 100)
      );
      setProgress(computedProgress);

    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
      setTotalHours(0);
      setRemainingHours(requiredHours || 400);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const initialize = async () => {
    await fetchUser();
    await fetchLogs();
  };

  // Time In
  const timeIn = async () => {
    if (!token) return;
    try {
      await API.post("/timelog/time-in", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchLogs();
    } catch (err) {
      console.error("TimeIn error:", err);
      throw err;
    }
  };

  // Time Out
  const timeOut = async () => {
    if (!token) return;
    try {
      await API.post("/timelog/time-out", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchLogs();
    } catch (err) {
      console.error("TimeOut error:", err);
      throw err;
    }
  };

  // Delete Log
  const deleteLog = async (logId) => {
    if (!token) return;
    try {
      await API.delete(`/timelog/log/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchLogs();
    } catch (err) {
      console.error("Delete log error:", err);
      throw err;
    }
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <TimeLogContext.Provider
      value={{
        logs,
        requiredHours,
        totalHours,
        remainingHours,
        progress,
        loading,
        fetchLogs,
        timeIn,
        timeOut,
        deleteLog,
      }}
    >
      {children}
    </TimeLogContext.Provider>
  );
};
