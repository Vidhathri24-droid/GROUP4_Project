import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. useNavigate import kiya

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // 👈 2. Hook initialize kiya

  const handleLogin = (e) => {
    e.preventDefault();

    // 💡 Dummy Login Bypass (Testing ke liye):
    if (email && password) {
      const dummyToken = 'fake_jwt_token_123456';
      localStorage.setItem('token', dummyToken);
      setToken(dummyToken);
    } else {
      alert('Please enter both Email and Password!');
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2>🔑 Login</h2>
        <div style={inputGroupStyle}>
          <label>Email:</label>
          <input 
            type="email" 
            placeholder="enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>
        <div style={inputGroupStyle}>
          <label>Password:</label>
          <input 
            type="password" 
            placeholder="enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>

        <button type="submit" style={buttonStyle}>Submit / Login</button>

        {/* 👈 3. Submit Button ke Niche Register Link Add Kar Diya */}
        <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '10px', textAlign: 'center' }}>
          Don't have an account?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            Register here
          </span>
        </p>

      </form>
    </div>
  );
}

// Simple Inline Styling
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '50px'
};

const formStyle = {
  background: '#ffffff',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  width: '320px',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  gap: '5px'
};

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px'
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default Login;