import React, { useState, useEffect } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import Publications from './Publications';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('graph');
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedResearcher, setSelectedResearcher] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8000/researchers/');
        const data = await res.json();
        setResearchers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching researchers data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredResearchers = researchers.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.institution?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || r.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-title-wrapper">
          <span style={{ fontSize: '20px' }}>🧬</span>
          <h2 className="header-title">Scientific Collaboration Network</h2>
        </div>

        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('graph')}
            className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
          >
            🕸️ Network Graph
          </button>
          <button
            onClick={() => setActiveTab('publications')}
            className={`tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
          >
            📚 Publications
          </button>
        </div>

        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* TAB 1: GRAPH */}
      {activeTab === 'graph' && (
        <div className="graph-tab-content">
          <div className="stats-header">
            <div>
              <p className="stats-subtitle">
                Explore co-authorships, institutions, and research impacts
              </p>
            </div>

            <div className="stats-cards-wrapper">
              <div className="stat-card">
                <span className="stat-card-label">Researchers</span>
                <strong className="stat-card-value-blue">{researchers.length}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card-label">Total Citations</span>
                <strong className="stat-card-value-green">
                  {researchers.reduce((acc, r) => acc + (r.citations_count || 0), 0)}
                </strong>
              </div>
            </div>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by researcher or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="dept-select"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div className={`dashboard-grid ${selectedResearcher ? 'has-sidebar' : ''}`}>
            <div className="graph-container">
              {loading ? (
                <div className="loading-state">Loading Collaboration Graph...</div>
              ) : (
                <NetworkGraph
                  researchers={filteredResearchers}
                  selectedDept={selectedDept}
                  onNodeSelect={(researcher) => setSelectedResearcher(researcher)}
                />
              )}
            </div>

            {selectedResearcher && (
              <div className="sidebar-panel">
                <div>
                  <div className="sidebar-header">
                    <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>{selectedResearcher.name}</h2>
                    <button onClick={() => setSelectedResearcher(null)} className="close-btn">✕</button>
                  </div>

                  <div className="sidebar-info">
                    <p style={{ margin: '4px 0' }}>🏢 <strong>{selectedResearcher.institution}</strong></p>
                    <p style={{ margin: '4px 0' }}>📂 Department: <span style={{ color: '#60a5fa' }}>{selectedResearcher.department}</span></p>
                    <p style={{ margin: '4px 0' }}>⭐ Citations: <span style={{ color: '#34d399' }}>{selectedResearcher.citations_count}</span></p>
                  </div>

                  <hr className="sidebar-divider" />

                  <h3 style={{ fontSize: '14px', color: '#e2e8f0', marginBottom: '10px' }}>
                    Publications ({selectedResearcher.publications?.length || 0})
                  </h3>
                  <ul className="pub-list">
                    {selectedResearcher.publications?.map((pub, idx) => (
                      <li key={pub.id || idx} className="pub-item">
                        {pub.title}
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={() => setSelectedResearcher(null)} className="action-btn">
                  Close Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PUBLICATIONS */}
      {activeTab === 'publications' && <Publications />}
    </div>
  );
};

export default Dashboard;