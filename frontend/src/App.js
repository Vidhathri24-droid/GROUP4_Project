// src/App.js
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [token, setToken] = useState(null);

  const handleLogout = () => {
    setToken(null);
    toast.info("Logged out successfully.");
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {token ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        // Yahan setToken pass kar dein
        <Login setToken={(t) => {
          setToken(t);
          if (t) toast.success("Login successful!");
          else toast.error("Invalid credentials!");
        }} />
      )}
    </div>
  );
}

export default App;