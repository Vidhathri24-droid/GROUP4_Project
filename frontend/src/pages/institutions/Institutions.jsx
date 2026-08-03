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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">Institutions Directory</h2>
          <p className="text-muted">Explore collaborating universities and research centers.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search institution or location..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row g-4">
        {filtered.map((inst) => (
          <div key={inst.id} className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3 p-4">
              <h5 className="fw-bold text-primary mb-1">{inst.name}</h5>
              <p className="text-muted small mb-3">📍 {inst.location}</p>
              <div className="d-flex gap-4 border-top pt-3">
                <div>
                  <span className="text-muted small d-block">Researchers</span>
                  <strong className="fs-6">{inst.authorsCount}</strong>
                </div>
                <div>
                  <span className="text-muted small d-block">Total Papers</span>
                  <strong className="fs-6 text-success">{inst.totalPubs}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}