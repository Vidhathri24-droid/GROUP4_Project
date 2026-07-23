import React from 'react';
import './Navbar.css'; // Styling ke liye

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🔬 CollabAnalyzer</h2>
      </div>
      <div className="navbar-menu">
        <input 
          type="text" 
          placeholder="Search researchers, topics, or institutions..." 
          className="search-input"
        />
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
