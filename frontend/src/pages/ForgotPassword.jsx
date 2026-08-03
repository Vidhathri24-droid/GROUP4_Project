import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Backend API integrate hone par yahan fetch/axios call aayegi
      // e.g., await resetPassword(email);
      
      // Temporary Success simulation:
      setTimeout(() => {
        setMessage('Password reset link has been sent to your email!');
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Failed to send reset link. Please check your email.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center" 
      style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e3f2fd,#ffffff)" }}
    >
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "15px" }}>
        <h3 className="text-center text-primary mb-3">Reset Password</h3>
        <p className="text-muted text-center mb-4">
          Enter your registered email to receive reset instructions.
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-decoration-none">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}