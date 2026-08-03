import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1e293b' }}>
          Scientific Collaboration Network Analyzer
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
          Analyze research trends, explore researcher networks, and track academic publications.
        </p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/login" style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
            Login
          </Link>
          <Link to="/register" style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#1e293b', textDecoration: 'none', borderRadius: '5px' }}>
            Register
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
          <h3>👨‍🔬 Researchers</h3>
          <p>Explore researcher profiles, network connections, and collaboration metrics.</p>
          <Link to="/researchers" style={{ color: '#2563eb' }}>View Researchers →</Link>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
          <h3>📚 Publications</h3>
          <p>Search and manage academic papers, citations, and co-authorship details.</p>
          <Link to="/publications" style={{ color: '#2563eb' }}>View Publications →</Link>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
          <h3>🏛️ Institutions</h3>
          <p>Discover academic institutions and their research outputs.</p>
          <Link to="/institutions" style={{ color: '#2563eb' }}>View Institutions →</Link>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
          <h3>🎤 Conferences</h3>
          <p>Track academic conferences, venues, and presented proceedings.</p>
          <Link to="/conferences" style={{ color: '#2563eb' }}>View Conferences →</Link>
        </div>
      </div>
    </div>
  );
}