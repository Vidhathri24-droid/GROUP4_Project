import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Publications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  // Sample data (Backend integrate hone par API se aayega)
  const publicationsList = [
    { id: 1, title: "Graph Neural Networks for Collaboration Prediction", authors: "A. Sharma, P. Nair", year: 2024, citations: 45, journal: "IEEE Transactions on Knowledge Engineering" },
    { id: 2, title: "Optimizing Centrality Algorithms in Large Social Graphs", authors: "R. Kumar, S. Patel", year: 2023, citations: 89, journal: "ACM Computing Surveys" },
    { id: 3, title: "Survey on Co-authorship Network Analysis Techniques", authors: "A. Sharma, R. Kumar", year: 2024, citations: 12, journal: "Journal of Informetrics" },
    { id: 4, title: "Distributed Community Detection in Big Data Networks", authors: "P. Nair, S. Patel", year: 2022, citations: 134, journal: "Elsevier Knowledge-Based Systems" }
  ];

  const filteredPublications = publicationsList.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.journal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'All' || p.year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#38bdf8' }}>Publications Directory</h2>
            <p className="text-light opacity-75 mb-0">Browse research papers, citation metrics, and co-authorship details.</p>
          </div>
          <Link to="/publications/create" className="btn btn-primary fw-bold px-4 shadow-sm" style={{ backgroundColor: '#2563eb', border: 'none' }}>
            + Add Publication
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="p-3 mb-4 rounded-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <div className="row g-3">
            <div className="col-md-7">
              <input 
                type="text" 
                className="form-control text-white border-0 shadow-none" 
                placeholder="Search by title, author, or journal name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div className="col-md-3">
              <select 
                className="form-select text-white border-0 shadow-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="All" style={{ backgroundColor: '#0f172a' }}>All Years</option>
                <option value="2024" style={{ backgroundColor: '#0f172a' }}>2024</option>
                <option value="2023" style={{ backgroundColor: '#0f172a' }}>2023</option>
                <option value="2022" style={{ backgroundColor: '#0f172a' }}>2022</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-light w-100 opacity-75" 
                onClick={() => { setSearchTerm(''); setSelectedYear('All'); }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="d-flex flex-column gap-3">
          {filteredPublications.map((pub) => (
            <div key={pub.id} className="p-4 rounded-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)' }}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div style={{ flex: '1 1 300px' }}>
                  <h5 className="fw-bold mb-2" style={{ color: '#38bdf8' }}>{pub.title}</h5>
                  <p className="small mb-3" style={{ color: '#cbd5e1' }}>
                    <strong className="text-white">Authors:</strong> {pub.authors} | <strong className="text-white">Journal:</strong> <em>{pub.journal}</em>
                  </p>
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <span className="badge px-3 py-2 fw-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)' }}>
                      Year: {pub.year}
                    </span>
                    <span className="badge px-3 py-2 fw-semibold" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                      Citations: {pub.citations}
                    </span>
                  </div>
                </div>
                
                <Link to={`/publications/${pub.id}`} className="btn btn-sm btn-outline-info text-nowrap align-self-center px-3 py-2 fw-semibold">
                  View Paper →
                </Link>
              </div>
            </div>
          ))}

          {filteredPublications.length === 0 && (
            <div className="text-center py-5 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p className="text-light opacity-50 mb-0">No publications found matching criteria.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
