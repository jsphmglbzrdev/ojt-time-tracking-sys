import React from 'react';
import { Briefcase, CheckCircle } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, showRegisterIndicator = false, notification }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-down">
          <div className="bg-slate-800 border-l-4 border-emerald-500 shadow-2xl rounded-lg p-4 flex items-center gap-3 pr-8">
            <CheckCircle className="text-emerald-500 w-5 h-5" />
            <div>
              <h4 className="font-semibold text-white text-sm">Success</h4>
              <p className="text-slate-300 text-sm">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-800">
        {/* Left Side - Visual & Branding (Static) */}
        <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-blue-900 to-slate-900">
          {/* Background Patterns */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
            <div className="absolute top-1/2 right-12 w-48 h-48 rounded-full bg-indigo-500 blur-2xl"></div>
            <div className="absolute bottom-12 left-12 w-32 h-32 rounded-full bg-blue-400 blur-xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white mb-8">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                <Briefcase className="w-6 h-6 text-blue-300" />
              </div>
              <span className="text-xl font-bold tracking-wide">InternTrack</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {title}
              </h1>
              <p className="text-slate-300 text-lg max-w-sm leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex gap-2">
              <div className={`h-1 w-12 rounded-full transition-colors ${showRegisterIndicator ? 'bg-slate-600' : 'bg-blue-500 opacity-100'}`}></div>
              <div className={`h-1 w-2 rounded-full transition-colors ${showRegisterIndicator ? 'bg-blue-500' : 'bg-slate-600'}`}></div>
              <div className="h-1 w-2 bg-slate-600 rounded-full"></div>
            </div>
            <p className="text-slate-400 text-xs mt-4">© 2026 Developed By. Joseph Miguel Bazar</p>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-900 transition-all duration-300">
          <div className="max-w-md w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
