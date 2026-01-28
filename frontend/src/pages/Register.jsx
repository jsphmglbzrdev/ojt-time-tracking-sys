import React, { useState, useContext, useEffect } from 'react';
import { User, Lock, School, Clock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthMessage from '../components/AuthMessage';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading: authLoading, message, clearMessage } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [hoursRequired, setHoursRequired] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // ✅ Clear messages when user types
  useEffect(() => {
    clearMessage();
    setLocalError('');
  }, [fullName, institution, hoursRequired, email, password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearMessage();

    if (!fullName || !institution || !email || !password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    const result = await register({
      fullName,
      institution,
      email,
      password,
      requiredHours: parseInt(hoursRequired) || 400
    });

    // ✅ Navigate only on successful registration
    if (result.success) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    }
  };

  return (
    <AuthLayout
      title="Join the Future Workforce."
      subtitle="Log your daily hours, submit accomplishment reports, and track your internship progress all in one secure platform."
      showRegisterIndicator={true}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400">Fill in your details to start tracking.</p>
      </div>

      {message?.type && (
        <AuthMessage message={message.message} type={message.type} onClose={clearMessage} />
      )}

      {localError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {localError}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 block">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Institution & Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 block">Institution</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                placeholder="University Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 block">Hours Required</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="number"
                required
                value={hoursRequired}
                onChange={(e) => setHoursRequired(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                placeholder="e.g. 600"
              />
            </div>
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300 block">Password</label>
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
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className={`w-full cursor-pointer flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 ${
            authLoading 
              ? 'bg-slate-700 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/40'
          }`}
        >
          {authLoading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Account <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-500">
          Already have an account? {' '}
          <Link 
            to="/login"
            className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors focus:outline-none"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
