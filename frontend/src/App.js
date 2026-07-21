import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import NetworkGraph from './components/NetworkGraph';

function App() {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    alert('Logged out successfully!');
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ padding: '15px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>🧪 Scientific Collaboration Network Analyzer</h1>
        {token ? (
          <button onClick={handleLogout} style={logoutBtnStyle}>
            Logout
          </button>
        ) : (
          <div>
            <button 
              onClick={() => setView('login')} 
              style={{ ...navBtnStyle, fontWeight: view === 'login' ? 'bold' : 'normal' }}
            >
              Login
            </button>
            <button 
              onClick={() => setView('register')} 
              style={{ ...navBtnStyle, fontWeight: view === 'register' ? 'bold' : 'normal' }}
            >
              Register
            </button>
          </div>
        )}
      </header>

      <main style={{ marginTop: '20px' }}>
        {token ? (
          <div>
            <h2>🎉 Welcome to Analyzer Dashboard!</h2>
            <NetworkGraph />
          </div>
        ) : (
          view === 'login' ? <Login setToken={setToken} /> : <Register />
        )}
      </main>
    </div>
  );
}

const navBtnStyle = {
  margin: '0 5px',
  padding: '8px 16px',
  backgroundColor: '#61dafb',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const logoutBtnStyle = {
  padding: '8px 16px',
  cursor: 'pointer',
  backgroundColor: '#dc3545',
  color: '#fff',
  border: 'none',
  borderRadius: '4px'
};

export default App;