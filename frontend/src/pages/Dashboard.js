import React, { useState } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <h2>🔬 CollabAnalyzer</h2>
        </div>
        <div className="user-section">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-body">
        {/* Top Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <span className="stat-icon">👨‍🔬</span>
            <div>
              <h3>Total Researchers</h3>
              <p className="stat-number">5</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <div>
              <h3>Publications</h3>
              <p className="stat-number">11</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔗</span>
            <div>
              <h3>Collaborations</h3>
              <p className="stat-number">4</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-card">
          <input 
            type="text" 
            placeholder="Search researcher name (e.g. Dr. A. Sharma)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            className="filter-select" 
            value={selectedDept} 
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="CS">Computer Science (CS)</option>
            <option value="Physics">Physics</option>
            <option value="Maths">Maths</option>
            <option value="Biotech">Biotech</option>
          </select>
        </div>

        {/* Main Graph & Side Profile */}
        <div className="main-graph-section">
          <div className="graph-container-card">
            <div className="graph-header">
              <h3>🌐 Network Collaboration Map</h3>
              <span className="badge">
                {selectedNode ? `Selected: ${selectedNode.label}` : 'Click any node to view profile'}
              </span>
            </div>
            <div className="graph-view">
              <NetworkGraph 
                searchTerm={searchTerm} 
                selectedDept={selectedDept}
                onSelectNode={(nodeData) => setSelectedNode(nodeData)}
              />
            </div>
          </div>

          {/* Upgraded Side Profile Drawer */}
          {selectedNode && (
            <div className="node-details-card">
              <div className="details-header">
                <h3>👨‍🔬 Researcher Details</h3>
                <button className="close-btn" onClick={() => setSelectedNode(null)}>✕</button>
              </div>
              <div className="details-body">
                <h4>{selectedNode.label}</h4>
                <p style={{ marginTop: '4px' }}>
                  <strong>Dept:</strong> <span className="dept-tag">{selectedNode.group}</span>
                </p>
                <div className="researcher-stats">
                  <div className="mini-stat">
                    <span>📄 Papers</span>
                    <strong>{selectedNode.publications ? selectedNode.publications.length : 0}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>⭐ Citations</span>
                    <strong>{selectedNode.citations || 0}</strong>
                  </div>
                </div>

                <hr style={{ margin: '15px 0', borderColor: '#f1f5f9' }} />

                <h5>📚 Top Publications:</h5>
                <ul className="publications-list">
                  {selectedNode.publications && selectedNode.publications.map((paper, idx) => (
                    <li key={idx}>📖 {paper}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;