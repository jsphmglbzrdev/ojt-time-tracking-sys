import { createContext, useState, useEffect, useContext, useMemo } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TimeLogContext = createContext();

export const TimeLogProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext); // 🔥 include user from AuthContext

  const [logs, setLogs] = useState([]);
  const [requiredHours, setRequiredHours] = useState(user?.requiredHours ?? 400); // init from user
  const [loading, setLoading] = useState(false);

  /* =========================
     SYNC REQUIRED HOURS WITH AUTH CONTEXT
  ========================== */
  useEffect(() => {
    setRequiredHours(user?.requiredHours ?? 400);
  }, [user]); // 🔥 update instantly when user.requiredHours changes

  /* =========================
     FETCH LOGS
  ========================== */
  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await API.get("/timelog/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DERIVED COMPUTATIONS
     (SINGLE SOURCE OF TRUTH)
  ========================== */
  const totalHours = useMemo(() => {
    return logs.reduce((sum, log) => {
      if (!log.timeIn || !log.timeOut) return sum;

      const start = new Date(log.timeIn);
      const end = new Date(log.timeOut);
      const diffHours = (end - start) / (1000 * 60 * 60);

      return sum + diffHours;
    }, 0);
  }, [logs]);

  const remainingHours = useMemo(() => {
    return Math.max(0, requiredHours - totalHours);
  }, [requiredHours, totalHours]);

  const progress = useMemo(() => {
    if (!requiredHours) return 0;
    return Math.min(100, (totalHours / requiredHours) * 100);
  }, [totalHours, requiredHours]);

  /* =========================
     TIME IN
  ========================== */
  const timeIn = async () => {
    if (!token) return;
    await API.post(
      "/timelog/time-in",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchLogs();
  };

  /* =========================
     TIME OUT
  ========================== */
  const timeOut = async () => {
    if (!token) return;
    await API.post(
      "/timelog/time-out",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchLogs();
  };

  /* =========================
     DELETE LOG
  ========================== */
  const deleteLog = async (logId) => {
    if (!token) return;
    await API.delete(`/timelog/log/${logId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchLogs();
  };

  /* =========================
     INIT LOGS
  ========================== */
  useEffect(() => {
    if (!token) return;
    fetchLogs();
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
        timeIn,
        timeOut,
        deleteLog,
      }}
    >
      {children}
    </TimeLogContext.Provider>
  );
};
