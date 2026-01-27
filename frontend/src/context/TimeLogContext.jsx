import { createContext, useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "./AuthContext";

export const TimeLogContext = createContext();

export const TimeLogProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [remainingHours, setRemainingHours] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch logs and remaining hours
  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resLogs = await API.get("/timelog/logs");
      setLogs(resLogs.data);

      const resRemaining = await API.get("/timelog/remaining");
      setRemainingHours(resRemaining.data.remainingHours);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Time In
  const timeIn = async () => {
    try {
      await API.post("/timelog/time-in");
      await fetchLogs();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Time Out
  const timeOut = async () => {
    try {
      await API.post("/timelog/time-out");
      await fetchLogs();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  return (
    <TimeLogContext.Provider
      value={{
        logs,
        remainingHours,
        loading,
        fetchLogs,
        timeIn,
        timeOut,
      }}
    >
      {children}
    </TimeLogContext.Provider>
  );
};
