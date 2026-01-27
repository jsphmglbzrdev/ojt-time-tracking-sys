import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
const App = () => {
  const { token, loading } = useContext(AuthContext);

  // Show loading spinner while checking token
  if (loading) {
    return <LoadingSpinner fullScreen={true} />;
  }

  return (
    <Router>
      <Routes>
        {/* Login page - if user has token, redirect to dashboard */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* Register page - if user has token, redirect to dashboard */}
        <Route 
          path="/register" 
          element={token ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        
				<Route 
          path="/forgot-password" 
          element={token ? <Navigate to="/forgot-password" replace /> : <ForgotPassword />} 
        />
        
        <Route 
          path="/reset-password/:token" 
          element={<ResetPassword />} 
        />
        
        {/* Protected Dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route - goes to login (or dashboard if authenticated) */}
        <Route 
          path="/" 
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;