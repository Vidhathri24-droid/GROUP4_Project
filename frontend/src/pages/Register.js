import React, { useState } from 'react';
import API from '../api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Direct /auth/register request
      await API.post('/auth/register', { username, email, password });
      setMessage('✅ Registration successful! Please go to Login tab.');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Registration Error:', err.response?.data);
      const serverDetail = err.response?.data?.detail;
      setError(typeof serverDetail === 'string' ? serverDetail : 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2>📝 Register</h2>
      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>❌ {error}</p>}
      <form onSubmit={handleRegister} style={styles.form}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          style={styles.input}
        />
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
        <button type="submit" style={styles.button}>Register</button>
      </form>
    </div>
  );
}

const styles = {
  container: { width: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '14px' },
  success: { color: 'green', fontSize: '14px' }
};
    
export default Register;