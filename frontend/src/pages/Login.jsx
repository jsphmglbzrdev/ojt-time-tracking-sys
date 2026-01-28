import React, { useState, useContext, useEffect } from "react";
import { User, Lock, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import AuthMessage from "../components/AuthMessage";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, message, clearMessage } =
    useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ✅ CLEAR STALE MESSAGES WHEN USER TYPES
  useEffect(() => {
    clearMessage();
    setLocalError("");
  }, [email, password]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ CLEAR EVERYTHING BEFORE REQUEST
    clearMessage();
    setLocalError("");
    setLoginSuccess(false);

    if (!email.trim() || !password.trim()) {
      setLocalError("Please enter both email and password");
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      setLoginSuccess(true);
    }
  };

  // ✅ REDIRECT ONLY ON CONFIRMED SUCCESS
  useEffect(() => {
    if (!loginSuccess) return;

    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [loginSuccess, navigate]);

  return (
    <AuthLayout
      title="Start Your Career Journey."
      subtitle="Log your daily hours, submit accomplishment reports, and track your internship progress all in one secure platform."
      showRegisterIndicator={false}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Student Login
        </h2>
        <p className="text-slate-400">
          Enter your credentials to access your portal.
        </p>
      </div>

      {/* ✅ MESSAGE ONLY RENDERS IF VALID */}
      {message?.type && (
        <AuthMessage
          message={message.message}
          type={message.type}
          onClose={clearMessage}
        />
      )}

      {localError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {localError}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">
            Email Address
          </label>
          <div className="relative group">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
              placeholder="student@university.edu"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-500"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className={`w-full py-3.5 rounded-xl font-bold text-white transition ${
            authLoading
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {authLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ChevronRight size={16} />
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-500">
          First time here?{" "}
          <Link
            to="/register"
            className="text-blue-400 font-semibold hover:underline"
          >
            Register your account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
