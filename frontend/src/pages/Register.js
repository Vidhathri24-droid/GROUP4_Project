import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // 💡 Dummy Bypass Flow: Direct alert & redirect to Login
    if (username && email && password) {
      alert(`Account created successfully for ${username}! Please Login.`);
      navigate('/login');
    } else {
      alert('Please fill in all fields!');
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleRegister} style={formStyle}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>📝 Register</h2>

        <div style={inputGroupStyle}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Username:</label>
          <input 
            type="text" 
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email:</label>
          <input 
            type="email" 
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Password:</label>
          <input 
            type="password" 
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required 
          />
        </div>

        <button type="submit" style={buttonStyle}>
          Register
        </button>

        <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '10px', textAlign: 'center' }}>
          Already have an account?{' '}
          <span 
            onClick={() => navigate('/login')} 
            style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

// Styling
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
  gap: '4px'
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px'
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '5px'
};

export default Register;