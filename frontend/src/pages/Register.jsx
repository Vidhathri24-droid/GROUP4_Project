import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from "../services/authService";
export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Researcher'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // Direct Backend Register API Call
      const data = await register(formData);
      
      // Success Message Box Dikhayega
      setSuccess(`Account Created Successfully! User ID: ${data.id}`);
      
      // 2 Seconds baad login page par auto redirect
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card border-0 shadow-lg p-4 rounded-3" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-primary">Register for SCNA</h3>
          <p className="text-muted small">Create your research network account</p>
        </div>

        {/* Success / Error Alerts */}
        {success && <div className="alert alert-success py-2 small">{success}</div>}
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="user@example.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              className="form-control" 
              placeholder="••••••••" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Role</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="Researcher">Researcher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Already registered? </span>
          <Link to="/login" className="text-decoration-none fw-bold">Login</Link>
        </div>
      </div>
    </div>
  );
}