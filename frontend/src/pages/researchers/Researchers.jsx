import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Researchers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const researchersData = [
    { id: 1, name: "Dr. Aravind Sharma", institution: "IIT Bombay", domain: "Artificial Intelligence", papers: 42, citations: 1250, hIndex: 18 },
    { id: 2, name: "Prof. Sunita Nair", institution: "IISc Bengaluru", domain: "Network Analysis", papers: 38, citations: 980, hIndex: 15 },
    { id: 3, name: "Dr. Rajesh Kumar", institution: "BITS Pilani", domain: "Graph Mining", papers: 29, citations: 610, hIndex: 12 },
    { id: 4, name: "Dr. Sneha Patel", institution: "IIT Delhi", domain: "Machine Learning", papers: 51, citations: 1890, hIndex: 22 },
    { id: 5, name: "Prof. Amit Verma", institution: "IIT Kharagpur", domain: "Data Science", papers: 31, citations: 740, hIndex: 14 },
    { id: 6, name: "Dr. Kavita Rao", institution: "IIIT Hyderabad", domain: "Bioinformatics", papers: 25, citations: 430, hIndex: 10 }
  ];

  const filteredResearchers = researchersData.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div className="container-fluid px-md-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold text-white mb-1">Researchers Directory</h2>
            <p className="text-light opacity-75 mb-0">Explore network researchers, affiliations, and citation metrics.</p>
          </div>
          <input 
            type="text" 
            placeholder="Search by name, institution, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control text-white border-0 py-2 px-3"
            style={{ maxWidth: '350px', backgroundColor: 'rgba(255,255,255,0.1)' }}
          />
        </div>

        <div className="row g-4">
          {filteredResearchers.map((r) => (
            <div key={r.id} className="col-md-6 col-lg-4">
              <div className="p-4 rounded-4 shadow-lg h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold text-white mb-1">{r.name}</h5>
                    <span className="badge bg-info text-dark fw-semibold">{r.domain}</span>
                  </div>
                  <span className="text-light small opacity-75">h-index: <strong className="text-warning">{r.hIndex}</strong></span>
                </div>
                <p className="small text-light opacity-75 mb-3">🏢 {r.institution}</p>
                <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <span className="d-block text-light opacity-50 small">Publications</span>
                    <strong className="text-info fs-6">{r.papers}</strong>
                  </div>
                  <div>
                    <span className="d-block text-light opacity-50 small">Citations</span>
                    <strong className="text-success fs-6">{r.citations}</strong>
                  </div>
                  <button 
                    className="btn btn-outline-info btn-sm fw-semibold"
                    onClick={() => navigate(`/researchers/${r.id}`)}
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}