import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/dashboard">
          🌐 SCNA
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/researchers')}`} to="/researchers" onClick={() => setIsOpen(false)}>Researchers</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/publications')}`} to="/publications" onClick={() => setIsOpen(false)}>Publications</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/institutions')}`} to="/institutions" onClick={() => setIsOpen(false)}>Institutions</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/conferences')}`} to="/conferences" onClick={() => setIsOpen(false)}>Conferences</Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}