import React, { useState, useContext, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  KeyRound,
  AlertCircle
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, logout, clearMessage, message, loading } =
    useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage(
        "Invalid or missing reset token. Please use the link from your email."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setErrorMessage("");

    const result = await resetPassword(token, password);

    if (result.success) {
      setResetSuccess(true);
    }
  };

  // ✅ Extended delay (3 seconds) & safe redirect
  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => {
        logout();
        clearMessage();
        navigate("/login", { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resetSuccess, logout, clearMessage, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[80px]" />
      </div>

      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 relative z-10">
        {resetSuccess ? (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Password Reset Successful
            </h2>
            <p className="text-slate-400">
              You’ll be redirected to the login page shortly…
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <KeyRound size={24} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Set New Password
            </h2>
            <p className="text-slate-400 mb-8">
              Please choose a strong password for your account.
            </p>

            {message.type === "error" && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <p className="text-red-400 text-sm">
                  {message.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white focus:ring-2 focus:ring-blue-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errorMessage
                        ? "border-red-500/50"
                        : "border-slate-700"
                    } rounded-xl bg-slate-800 text-white focus:ring-2 focus:ring-blue-500/50`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <p className="text-red-400 text-sm">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to log in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
