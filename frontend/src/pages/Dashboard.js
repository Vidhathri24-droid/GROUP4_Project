import React, { useState } from 'react';
import NetworkGraph from '../components/NetworkGraph';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="dashboard-layout">
      {/* Top Bar / Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <h2>🔬 CollabAnalyzer</h2>
        </div>
        <div className="user-section">
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-body">
        {/* Stats Summary Cards */}
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

        {/* Search & Filter Controls */}
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

        {/* Main Graph Section + Interactive Profile Panel */}
        <div className="main-graph-section">
          <div className="graph-container-card">
            <div className="graph-header">
              <h3>🌐 Network Collaboration Map</h3>
              <span className="badge">
                {selectedNode ? `Selected: ${selectedNode.label}` : 'Click any node to view details'}
              </span>
            </div>
            <div className="graph-view">
              <NetworkGraph
                searchTerm={searchTerm}
                selectedDept={selectedDept}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          </div>

          {/* Node Click Details Side Card */}
          {selectedNode && (
            <div className="node-details-card">
              <div className="details-header">
                <h3>👨‍🔬 Author Profile</h3>
                <button className="close-btn" onClick={() => setSelectedNode(null)}>
                  ✕
                </button>
              </div>
              <div className="details-body">
                <h4>{selectedNode.label}</h4>
                <p>
                  <strong>Department:</strong> <span className="dept-tag">{selectedNode.group}</span>
                </p>
                <p>
                  <strong>Researcher ID:</strong> #{selectedNode.id}
                </p>
                <p>
                  <strong>Status:</strong> Active Collaborator
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;