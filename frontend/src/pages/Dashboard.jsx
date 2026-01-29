import React, { useState, useEffect, useRef, useContext } from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  User,
  LogOut,
  Play,
  Square,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Settings,
  AlertTriangle,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { TimeLogContext } from "../context/TimeLogContext";
import Modal from "../components/Modal";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const { logout, user } = useContext(AuthContext);
  const {
    logs,
    requiredHours,
    remainingHours,
    progress,
    totalHours,
    loading,
    timeIn,
    timeOut,
    deleteLog,
  } = useContext(TimeLogContext);

  // Debug: Log raw context values immediately after extraction
  console.log("[Dashboard] Raw context values:", {
    totalHours,
    remainingHours,
    progress,
    requiredHours,
    logsCount: logs?.length,
  });

  // Session State (Is user currently clocked in?)
  const [activeSession, setActiveSession] = useState(null); // { logId: '', date: '...' }

  // Modal Visibility State
  const [modals, setModals] = useState({
    timeIn: false,
    timeOut: false,
    logout: false,
    delete: false,
  });

  const [logToDelete, setLogToDelete] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State for Modals
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "",
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Dashboard Calculations
  const targetHours = requiredHours;
  const calculatedRemainingHours = remainingHours;
  const progressPercent = progress;

  const formatHours = (value) => {
    if (value >= 100) return value.toFixed(3); // 👈 THIS is the fix
    if (value >= 1) return value.toFixed(2);
    return value.toFixed(4);
  };

  const formatPercent = (value) => {
    if (value >= 1) return value.toFixed(1);
    return value.toFixed(4); // 👈 0.0003% now visible
  };

  // Debug: Log assigned variables
  console.log("[Dashboard] Assigned variables:", {
    targetHours,
    calculatedRemainingHours,
    progressPercent,
  });

  // Debug: Log context values to console
  useEffect(() => {
    console.log("[Dashboard] useEffect fired with:", {
      totalHours,
      remainingHours,
      progress,
      requiredHours,
      logsCount: logs.length,
    });
  }, [totalHours, remainingHours, progress, requiredHours, logs]);

  // Determine if there's a completed log for today (has both timeIn and timeOut)
  const todayISO = new Date().toISOString().split("T")[0];
  const hasCompletedToday = logs.some(
    (log) => log.date === todayISO && log.timeOut,
  );

  // Check if user is currently clocked in (has a log without timeOut today)
  const checkActiveSession = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayLog = logs.find((log) => log.date === today && !log.timeOut);
    if (todayLog) {
      setActiveSession({ logId: todayLog._id, date: today });
    } else {
      setActiveSession(null);
    }
  };

  useEffect(() => {
    checkActiveSession();
  }, [logs]);

  // --- HANDLERS ---
  console.log(user);
  // Helper to get current time string HH:mm
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const openTimeInModal = () => {
    setApiError(null);
    setSessionForm({
      date: new Date().toISOString().split("T")[0],
      time: getCurrentTime(),
    });
    setModals({ ...modals, timeIn: true });
  };

  const openTimeOutModal = () => {
    setApiError(null);
    setSessionForm({
      ...sessionForm,
      time: getCurrentTime(),
    });
    setModals({ ...modals, timeOut: true });
  };

  const handleTimeIn = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setApiError(null);
    try {
      await timeIn();
      setModals({ ...modals, timeIn: false });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to clock in. Please try again.";
      setApiError(errorMsg);
      console.error("Time in error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTimeOut = async (e) => {
    e.preventDefault();
    if (!activeSession) {
      setApiError("No active time-in session found");
      return;
    }

    setIsProcessing(true);
    setApiError(null);
    try {
      await timeOut();
      setModals({ ...modals, timeOut: false });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to clock out. Please try again.";
      setApiError(errorMsg);
      console.error("Time out error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    // Add logout logic here (e.g., clear tokens, redirect)
    logout();
    setModals({ ...modals, logout: false });
  };

  const handleDelete = (id) => {
    setLogToDelete(id);
    setApiError(null);
    setModals({ ...modals, delete: true });
  };

  const confirmDelete = async () => {
    setIsProcessing(true);
    setApiError(null);
    try {
      await deleteLog(logToDelete);
      setModals({ ...modals, delete: false });
      setLogToDelete(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to delete log. Please try again.";
      setApiError(errorMsg);
      console.error("Delete log error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- CALENDAR HELPERS ---
  const [currentDate, setCurrentDate] = useState(new Date());
  // Navigate months
  const prevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };
  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const today = new Date().getDate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 text-blue-500">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <LayoutDashboard size={20} />
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight">
                InternTrack
              </span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white leading-none">
                    John Doe
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Student Intern
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <User size={16} />
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-800 py-1 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="h-px bg-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setModals({ ...modals, logout: true });
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {/* Header & Main Action */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-400">Current Status:</p>
                {activeSession ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded text-sm border border-emerald-400/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Clocked In
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded text-sm border border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {hasCompletedToday ? (
              <button
                disabled
                className="flex items-center justify-center gap-2 bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl shadow-none w-full sm:w-auto cursor-default"
              >
                <CheckCircle size={20} className="text-emerald-400" />
                Completed
              </button>
            ) : activeSession ? (
              <button
                onClick={openTimeOutModal}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 w-full sm:w-auto"
              >
                <Square size={20} fill="currentColor" />
                Time Out
              </button>
            ) : (
              <button
                onClick={openTimeInModal}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 w-full sm:w-auto"
              >
                <Play size={20} fill="currentColor" />
                Time In
              </button>
            )}
          </header>

          {/* Stats Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            key={`stats-${totalHours}-${remainingHours}-${progress}`}
          >
            <StatCard
              title="Total Hours"
              value={`${formatHours(totalHours)}h`}
              icon={<Clock size={24} className="text-blue-400" />}
              trend="Current Total"
              color="blue"
            />

            <StatCard
              title="Remaining"
              value={`${formatHours(remainingHours)}h`}
              icon={<AlertCircle size={24} className="text-amber-400" />}
              trend={`${requiredHours}h Goal`}
              color="amber"
            />

            <StatCard
              title="Completion"
              value={`${formatPercent(progress)}%`}
              icon={<CheckCircle size={24} className="text-emerald-400" />}
              trend="On track"
              color="emerald"
            />
          </div>

          {/* Content Split: Logs & Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Recent Logs (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">
                      Recent Logs
                    </h2>
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">
                      {logs.length}
                    </span>
                  </div>
                  <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    View History
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Time In</th>
                        <th className="px-6 py-4">Time Out</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {loading ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-12 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin"></div>
                              <p>Loading logs...</p>
                            </div>
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-12 text-center text-slate-500"
                          >
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>
                              No logs found. Start your shift to track time.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => {
                          const timeInDate = new Date(log.timeIn);
                          const timeOutDate = log.timeOut
                            ? new Date(log.timeOut)
                            : null;
                          const timeInStr = timeInDate.toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          );
                          const timeOutStr = timeOutDate
                            ? timeOutDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "--:--";
                          const dateStr = timeInDate.toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          );

                          return (
                            <tr
                              key={log._id}
                              className="hover:bg-slate-800/50 transition-colors group"
                            >
                              <td className="px-6 py-4 font-medium text-slate-200">
                                {dateStr}
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {timeInStr}
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {timeOutStr}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                  {log.totalHours
                                    ? log.totalHours.toFixed(3)
                                    : "--"}{" "}
                                  hrs
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDelete(log._id)}
                                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  disabled={isProcessing}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: Calendar (1/3 width) */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-500" />
                    {monthName}
                  </h2>
                  <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-xs font-semibold text-slate-500 uppercase"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    if (!day) {
                      return (
                        <div key={idx} className="aspect-square rounded-lg invisible" />
                      );
                    }

                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const dateObj = new Date(year, month, day);
                    const iso = dateObj.toISOString().split("T")[0];
                    const logForDay = logs.find((l) => l.date === iso);

                    const isToday = (() => {
                      const now = new Date();
                      return (
                        now.getFullYear() === dateObj.getFullYear() &&
                        now.getMonth() === dateObj.getMonth() &&
                        now.getDate() === dateObj.getDate()
                      );
                    })();

                    const baseClasses = `aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all text-sm cursor-pointer hover:bg-slate-800 border border-transparent hover:border-slate-700`;
                    const todayClasses = isToday ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold" : "text-slate-300";
                    const completedClasses = logForDay && logForDay.timeOut ? "bg-slate-800/50" : "";

                    return (
                      <div
                        key={idx}
                        className={`${baseClasses} ${todayClasses} ${completedClasses}`}
                        title={logForDay ? (logForDay.timeOut ? "Completed" : "In Progress") : "No log"}
                      >
                        <span>{day}</span>
                        {logForDay && (
                          <div className="mt-1">
                            <div
                              className={`w-2 h-2 rounded-full ${logForDay.timeOut ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Time In Modal */}
      {modals.timeIn && (
        <Modal
          title="Confirm Time In"
          onClose={() => setModals({ ...modals, timeIn: false })}
        >
          <form onSubmit={handleTimeIn}>
            {apiError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {apiError}
              </div>
            )}
            <p className="text-slate-400 mb-6 text-sm">
              Please confirm to clock in. The system will record your start
              time.
            </p>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Current Time
                </p>
                <p className="text-lg font-bold text-white mt-2">
                  {getCurrentTime()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModals({ ...modals, timeIn: false })}
                disabled={isProcessing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isProcessing ? "Clocking in..." : "Confirm Time In"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Time Out Modal */}
      {modals.timeOut && (
        <Modal
          title="Confirm Time Out"
          onClose={() => setModals({ ...modals, timeOut: false })}
        >
          <form onSubmit={handleTimeOut}>
            {apiError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {apiError}
              </div>
            )}
            <p className="text-slate-400 mb-6 text-sm">
              Confirm to clock out. The system will calculate your hours worked.
            </p>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Current Time
                </p>
                <p className="text-lg font-bold text-white mt-2">
                  {getCurrentTime()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModals({ ...modals, timeOut: false })}
                disabled={isProcessing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isProcessing ? "Clocking out..." : "Confirm Time Out"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modals.delete && (
        <Modal
          title="Delete Log Entry"
          onClose={() => setModals({ ...modals, delete: false })}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 size={32} />
            </div>
            {apiError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {apiError}
              </div>
            )}
            <p className="text-slate-300">
              Are you sure you want to delete this log entry? This action cannot
              be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModals({ ...modals, delete: false })}
              disabled={isProcessing}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}

      {/* Logout Modal */}
      {modals.logout && (
        <Modal
          title="Sign Out"
          onClose={() => setModals({ ...modals, logout: false })}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <p className="text-slate-300">
              Are you sure you want to sign out of your account?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModals({ ...modals, logout: false })}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20"
            >
              Sign Out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
