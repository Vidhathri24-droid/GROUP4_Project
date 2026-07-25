import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.info("Logged out successfully.");
  };

  const handleSetToken = (t) => {
    if (t) {
      localStorage.setItem('token', t);
      setToken(t);
      toast.success("Login successful!");
    } else {
      localStorage.removeItem('token');
      setToken(null);
      toast.error("Authentication failed!");
    }
  };

  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        
        <Routes>
          {/* Dashboard Route (Protected) */}
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />

          {/* Login Route */}
          <Route 
            path="/login" 
            element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Register Route */}
          <Route 
            path="/register" 
            element={!token ? <Register /> : <Navigate to="/dashboard" replace />} 
          />

          {/* Default Route */}
          <Route 
            path="*" 
            element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;