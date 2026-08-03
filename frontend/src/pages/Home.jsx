import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div 
      style={{ 
        backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(30, 58, 138, 0.9)), url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh', 
        color: '#f8fafc' 
      }} 
      className="d-flex flex-column justify-content-between"
    >
      
      {/* Navbar - Clean without border line */}
      <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/" style={{ color: '#38bdf8' }}>
            SCNA
          </Link>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-light btn-sm px-3 fw-semibold">Login</Link>
            <Link to="/register" className="btn btn-info btn-sm px-3 fw-bold text-dark" style={{ backgroundColor: '#38bdf8', border: 'none' }}>Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container text-center py-5 my-auto">
        <span className="badge px-3 py-2 rounded-pill mb-3 fw-semibold" style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
          Academic Research & Network Platform
        </span>
        <h1 className="fw-bold display-4 mb-3 text-white" style={{ letterSpacing: '-1px' }}>
          Scientific Collaboration Network Analyzer
        </h1>
        <p className="text-light opacity-90 fs-5 mb-4 mx-auto" style={{ maxWidth: '680px', fontWeight: '300' }}>
          Uncover co-authorship networks, measure citation impacts, and explore academic collaboration trends across global institutions.
        </p>
        
        <div className="d-flex justify-content-center gap-3 mb-5">
          <Link to="/login" className="btn btn-primary btn-lg fw-bold px-4 shadow" style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
            Get Started
          </Link>
          <Link to="/register" className="btn btn-light btn-lg fw-bold px-4 text-dark shadow-sm">
            Register Institution
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="row g-4 text-start mt-2">
          {[
            { title: "Researchers", desc: "Explore researcher profiles, network connections, and collaboration metrics.", link: "/researchers" },
            { title: "Publications", desc: "Search and manage academic papers, citations, and co-authorship details.", link: "/publications" },
            { title: "Institutions", desc: "Discover academic institutions and their global research outputs.", link: "/institutions" },
            { title: "Conferences", desc: "Track academic conferences, venues, and presented proceedings.", link: "/conferences" },
          ].map((item, idx) => (
            <div key={idx} className="col-md-3">
              <div 
                className="p-4 rounded-4 h-100 shadow-lg"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.3s ease'
                }}
              >
                <h5 className="fw-bold text-white mb-2">{item.title}</h5>
                <p className="text-light opacity-85 small mb-3">{item.desc}</p>
                <Link to={item.link} className="text-decoration-none small fw-bold text-info">
                  Explore Network &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 text-light opacity-75 small" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
        &copy; 2026 Scientific Collaboration Network Analyzer (SCNA).
      </footer>

    </div>
  );
}