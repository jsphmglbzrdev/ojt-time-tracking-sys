import React, { useState, useContext, useEffect } from "react";
import {
  User,
  Mail,
  School,
  Clock,
  LogOut,
  ChevronLeft,
  Edit2,
  Check,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, updateRequiredHours } = useContext(AuthContext);

  // Editable Hours State
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [tempHours, setTempHours] = useState("");

  // Sync tempHours when user loads / updates
  useEffect(() => {
    if (user?.requiredHours) {
      setTempHours(user.requiredHours);
    }
  }, [user]);

  const handleEditClick = () => {
    setTempHours(user?.requiredHours || "");
    setIsEditingHours(true);
  };

  const handleSaveHours = async () => {
    if (!tempHours || tempHours <= 0) return;

    try {
      await updateRequiredHours(Number(tempHours));
      setIsEditingHours(false);
    } catch (err) {
      console.error("Failed to update required hours:", err);
    }
  };

  const handleCancelEdit = () => {
    setTempHours(user?.requiredHours || "");
    setIsEditingHours(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                <ChevronLeft size={16} />
                Back to Dashboard
              </a>
              <div className="h-6 w-px bg-slate-800"></div>
              <div className="flex items-center gap-2 text-blue-500">
                <div className="p-1 bg-blue-500/10 rounded-lg">
                  <User size={18} />
                </div>
                <span className="font-bold text-slate-100 tracking-tight">
                  My Profile
                </span>
              </div>
            </div>

            <button className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Profile Header */}
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-950 shadow-xl flex items-center justify-center text-slate-400 mb-4">
                <User size={40} />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {user?.fullName}
              </h1>
              <p className="text-slate-400 text-sm">Student Intern</p>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 relative z-10">
              {/* Email */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Email Address
                  </p>
                  <p className="text-slate-200 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Institution */}
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                  <School size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Institution
                  </p>
                  <p className="text-slate-200 font-medium">
                    {user?.institution}
                  </p>
                </div>
              </div>

              {/* Hours of OJT */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 ${
                  isEditingHours
                    ? "bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/20"
                    : "bg-slate-950/50 border-slate-800"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Hours of OJT
                    </p>
                    {isEditingHours ? (
                      <input
                        type="number"
                        value={tempHours}
                        onChange={(e) => setTempHours(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1 mt-1 focus:outline-none focus:border-blue-500 text-sm font-medium"
                        autoFocus
                      />
                    ) : (
                      <p className="text-slate-200 font-medium">
                        {user?.requiredHours} Hours
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditingHours ? (
                    <>
                      <button
                        onClick={handleSaveHours}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditClick}
                      className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
