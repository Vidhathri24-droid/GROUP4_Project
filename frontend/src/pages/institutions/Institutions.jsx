import React, { useState } from 'react';

export default function Institutions() {
  const [searchTerm, setSearchTerm] = useState('');

  const institutionsList = [
    { id: 1, name: "Indian Institute of Technology Bombay", location: "Mumbai, India", authorsCount: 142, totalPubs: 820 },
    { id: 2, name: "Indian Institute of Science", location: "Bengaluru, India", authorsCount: 195, totalPubs: 1140 },
    { id: 3, name: "BITS Pilani", location: "Pilani, India", authorsCount: 88, totalPubs: 410 },
    { id: 4, name: "IIT Delhi", location: "New Delhi, India", authorsCount: 130, totalPubs: 750 }
  ];

  const filtered = institutionsList.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: '#38bdf8' }}>Institutions Directory</h2>
            <p className="text-light opacity-75 mb-0">Explore collaborating universities and research centers.</p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-3 mb-4 rounded-4 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <input 
            type="text" 
            className="form-control text-white border-0 shadow-none py-2 px-3" 
            placeholder="Search institution or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Institutions Grid */}
        <div className="row g-4">
          {filtered.map((inst) => (
            <div key={inst.id} className="col-md-6">
              <div 
                className="p-4 rounded-4 shadow-lg h-100 d-flex flex-column justify-content-between" 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div>
                  <h5 className="fw-bold mb-2" style={{ color: '#38bdf8' }}>{inst.name}</h5>
                  <p className="text-light opacity-75 small mb-3">📍 {inst.location}</p>
                </div>

                <div className="d-flex gap-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <span className="text-light opacity-50 small d-block">Researchers</span>
                    <strong className="fs-6 text-white">{inst.authorsCount}</strong>
                  </div>
                  <div>
                    <span className="text-light opacity-50 small d-block">Total Papers</span>
                    <strong className="fs-6" style={{ color: '#34d399' }}>{inst.totalPubs}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-12 text-center py-5 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p className="text-light opacity-50 mb-0">No institutions found matching your search.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}