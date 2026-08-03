import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('researcher'); // Default role: researcher
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('token', 'dummy-auth-token');
    localStorage.setItem('userRole', role); // Storing selected role
    navigate('/dashboard');
  };

  return (
    <div 
      style={{ 
        backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.85)), url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', 
        color: '#f8fafc' 
      }} 
      className="d-flex align-items-center justify-content-center p-3"
    >
      <div 
        className="p-4 p-md-5 rounded-4 shadow-lg w-100" 
        style={{ 
          backgroundColor: 'rgba(15, 23, 42, 0.75)', 
          backdropFilter: 'blur(16px)',
          maxWidth: '430px' 
        }}
      >
        
        {/* Home Button */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="d-inline-flex align-items-center gap-2 text-decoration-none fw-semibold"
            style={{ color: '#38bdf8', fontSize: '0.875rem' }}
          >
            &larr; Back to Home
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-1 text-white" style={{ letterSpacing: '-0.5px' }}>
            SCNA Portal Login
          </h3>
          <p className="text-light opacity-75 small mb-0">
            Select your role to access the analytics portal
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="d-flex rounded-3 p-1 mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            type="button"
            className={`btn btn-sm w-50 fw-semibold rounded-2 transition-all ${role === 'researcher' ? 'btn-info text-dark shadow-sm' : 'text-white opacity-75'}`}
            onClick={() => setRole('researcher')}
            style={role === 'researcher' ? { backgroundColor: '#38bdf8', border: 'none' } : {}}
          >
            Researcher
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 fw-semibold rounded-2 transition-all ${role === 'admin' ? 'btn-info text-dark shadow-sm' : 'text-white opacity-75'}`}
            onClick={() => setRole('admin')}
            style={role === 'admin' ? { backgroundColor: '#38bdf8', border: 'none' } : {}}
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small text-light opacity-90 fw-semibold">
              {role === 'admin' ? 'Admin Email' : 'Researcher Email'}
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control text-white border-0 py-2 px-3" 
              placeholder={role === 'admin' ? 'admin@scna.edu' : 'researcher@university.edu'} 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              required 
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small text-light opacity-90 fw-semibold mb-0">Password</label>
              <a href="#forgot" className="small text-decoration-none" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                Forgot?
              </a>
            </div>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control text-white border-0 py-2 px-3" 
              placeholder="••••••••" 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn w-100 fw-bold py-2 mb-3 shadow"
            style={{ 
              backgroundColor: '#0284c7', 
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none'
            }}
          >
            Sign In as {role === 'admin' ? 'Admin' : 'Researcher'}
          </button>
        </form>

        {/* Register Link Option */}
        <div className="text-center mt-3 pt-3">
          <p className="small text-light opacity-90 mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-decoration-none fw-bold" style={{ color: '#38bdf8' }}>
              Register here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}