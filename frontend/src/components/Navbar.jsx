import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Co-author Alert', time: '10m ago', unread: true, desc: 'Dr. Aravind tagged you in a paper.' },
    { id: 2, title: 'Dataset Processed', time: '1h ago', unread: true, desc: 'Co-authorship network updated successfully.' },
    { id: 3, title: 'Citation Milestone', time: '1d ago', unread: false, desc: 'Your publications crossed 1,000 citations!' },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Handlers
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markSingleAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active fw-bold' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm w-100">
      <div className="container-fluid px-md-5">
        <Link className="navbar-brand fw-bold text-primary" to="/dashboard">
          SCNA
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
            {/* NOTIFICATION BELL SYSTEM */}
            <div className="position-relative">
              <button 
                className="btn btn-outline-secondary position-relative p-1 px-2 border-0"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ fontSize: '1.2rem', color: '#f8fafc' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN BOX */}
              {showNotifications && (
                <div 
                  className="position-absolute end-0 mt-2 rounded-3 shadow-lg p-3 text-white"
                  style={{
                    width: '320px',
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.15)',
                    zIndex: 1050
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h6 className="fw-bold mb-0 small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </h6>
                    <div className="d-flex gap-2">
                      {unreadCount > 0 && (
                        <button className="btn btn-link btn-sm text-info p-0 text-decoration-none" style={{ fontSize: '0.75rem' }} onClick={markAllAsRead}>
                          Mark read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button className="btn btn-link btn-sm text-danger p-0 text-decoration-none" style={{ fontSize: '0.75rem' }} onClick={clearAllNotifications}>
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p className="small text-muted text-center py-3 mb-0">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className="p-2 rounded-2 transition-all"
                          onClick={() => markSingleAsRead(n.id)}
                          style={{ 
                            backgroundColor: n.unread ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            borderLeft: n.unread ? '3px solid #38bdf8' : 'none'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className={`small fw-bold ${n.unread ? 'text-info' : 'text-light'}`}>{n.title}</span>
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>{n.time}</span>
                          </div>
                          <p className="mb-0 text-light opacity-75" style={{ fontSize: '0.75rem' }}>{n.desc}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}