import React, { useState, useContext, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, KeyRound, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword, loading, message, clearMessage } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Watch for message changes from AuthContext
  useEffect(() => {
    console.log('Message changed:', message);
    if (message.success === true && message.type === 'success') {
      setShowSuccess(true);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    const result = await forgotPassword(email);
    console.log('Result:', result);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background Decoration (Matching the dashboard theme) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/10 blur-[80px]"></div>
      </div>

      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 relative z-10">
        
        {/* Success State */}
        {showSuccess ? (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 mb-8">
              We've sent a password reset link to <br/>
              <span className="text-white font-medium">{email}</span>
            </p>
            <button 
              onClick={() => { 
                setShowSuccess(false); 
                setEmail(''); 
                clearMessage();
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-slate-700"
            >
              Back to Login
            </button>
            <p className="mt-6 text-sm text-slate-500">
              Did not receive the email? <button className="text-blue-400 hover:text-blue-300 font-medium">Click to resend</button>
            </p>
          </div>
        ) : (
          /* Form State */
          <div>
            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <KeyRound size={24} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
            <p className="text-slate-400 mb-8">
              No worries, we'll send you reset instructions.
            </p>

            {message.success === false && message.type === 'error' && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{message.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full cursor-pointer flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 ${
                  loading
                    ? 'bg-slate-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/40'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <Link to="/login" className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;