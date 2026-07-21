import React, { useState } from 'react';
import API from '../api';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Backend /auth/login expects JSON: { email, password }
      const res = await API.post('/auth/login', {
        email: email,
        password: password
      });

      const token = res.data.access_token;
      
      // Save Token in localStorage
      localStorage.setItem('token', token);
      if (setToken) setToken(token);
      alert('✅ Logged in successfully!');
    } catch (err) {
      console.error('Login Error:', err.response?.data);
      const serverDetail = err.response?.data?.detail;
      setError(typeof serverDetail === 'string' ? serverDetail : 'Invalid email or password');
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔑 Login</h2>
      {error && <p style={styles.error}>❌ {error}</p>}
      <form onSubmit={handleLogin} style={styles.form}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={styles.input}
        />
        <input 
  type="password" 
  placeholder="Password" 
  maxLength={72} // <-- Limit input length
  value={password} 
  onChange={(e) => setPassword(e.target.value)} 
  required 
/>
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
}

const styles = {
  container: { width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '14px' }
};

export default Login;