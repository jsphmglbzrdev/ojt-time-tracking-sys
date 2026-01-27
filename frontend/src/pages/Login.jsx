import React, { useState, useContext, useEffect } from 'react';
import { User, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthMessage from '../components/AuthMessage';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, message, clearMessage } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // If login was successful, navigate after a short delay
    if (message?.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  }, [message?.success, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password');
      return;
    }

    await login({ email, password });
  };

  return (
    <AuthLayout
      title="Start Your Career Journey."
      subtitle="Log your daily hours, submit accomplishment reports, and track your internship progress all in one secure platform."
      showRegisterIndicator={false}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Student Login</h2>
        <p className="text-slate-400">Enter your credentials to access your portal.</p>
      </div>

      <AuthMessage 
        message={message?.message} 
        type={message?.type}
        onClose={clearMessage}
      />

      {localError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <p>{localError}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 block">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
              placeholder="student@university.edu"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300 block">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-700 bg-slate-800 rounded cursor-pointer accent-blue-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer select-none">
            Keep me logged in
          </label>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className={`w-full cursor-pointer flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 ${
            authLoading 
              ? 'bg-slate-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40'
          }`}
        >
          {authLoading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign In <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-500">
          First time here? {' '}
          <Link 
            to="/register"
            className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors focus:outline-none"
          >
            Register your account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;


