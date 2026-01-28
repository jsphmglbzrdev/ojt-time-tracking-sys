import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Trash2, 
  LogOut, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  X,
  Lock
} from 'lucide-react';

const SettingsPage = () => {
  // Password Change State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStatus, setPasswordStatus] = useState(null); // 'success', 'error'

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Handlers
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordStatus('error');
      return;
    }
    // Simulate API call
    setPasswordStatus('success');
    setTimeout(() => setPasswordStatus(null), 3000);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deleteConfirmationPassword !== 'password123') { // Mock validation
      setDeleteError('Incorrect password');
      return;
    }
    alert('Account deleted successfully');
    setShowDeleteModal(false);
  };

  const toggleVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      
      {/* Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                <ChevronLeft size={16} />
                Back to Dashboard
              </a>
              <div className="h-6 w-px bg-slate-800"></div>
              <div className="flex items-center gap-2 text-blue-500">
                <div className="p-1 bg-blue-500/10 rounded-lg">
                  <Shield size={18} />
                </div>
                <span className="font-bold text-slate-100 tracking-tight">Account Settings</span>
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
      <main className="flex-1 p-4 md:p-8 flex justify-center">
        <div className="max-w-xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Change Password Section */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Change Password</h2>
                  <p className="text-xs text-slate-400">Update your password to keep your account secure.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
              <PasswordField 
                label="Current Password"
                value={passwords.current}
                onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                show={showPasswords.current}
                onToggle={() => toggleVisibility('current')}
              />
              <div className="h-px bg-slate-800 my-2"></div>
              <PasswordField 
                label="New Password"
                value={passwords.new}
                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                show={showPasswords.new}
                onToggle={() => toggleVisibility('new')}
              />
              <PasswordField 
                label="Confirm New Password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                show={showPasswords.confirm}
                onToggle={() => toggleVisibility('confirm')}
                error={passwordStatus === 'error'}
              />

              {passwordStatus === 'error' && (
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} /> Passwords do not match.
                </p>
              )}
              {passwordStatus === 'success' && (
                <p className="text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle size={14} /> Password updated successfully.
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>

          {/* Delete Account Section */}
          <section className="bg-slate-900 rounded-2xl border border-red-900/30 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-red-900/20 bg-red-950/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Delete Account</h2>
                  <p className="text-xs text-slate-400">Permanently remove your account and all data.</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Once you delete your account, there is no going back. Please be certain. All your tracked hours, logs, and profile information will be permanently removed.
              </p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                Delete My Account
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Account?</h2>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleDeleteAccount}>
              <p className="text-slate-300 text-sm mb-4">
                To confirm deletion, please enter your password below.
              </p>
              
              <div className="mb-6 space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password"
                    required
                    value={deleteConfirmationPassword}
                    onChange={(e) => {
                      setDeleteConfirmationPassword(e.target.value);
                      setDeleteError('');
                    }}
                    className={`w-full bg-slate-950 border ${deleteError ? 'border-red-500' : 'border-slate-800'} text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 text-sm`}
                    placeholder="Enter your password"
                  />
                </div>
                {deleteError && (
                  <p className="text-red-400 text-xs mt-1">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20 text-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Reusable Password Input Field
const PasswordField = ({ label, value, onChange, show, onToggle, error }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
        <Lock size={16} />
      </div>
      <input 
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-800'} text-white rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm`}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

export default SettingsPage;