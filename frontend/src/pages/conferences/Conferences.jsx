import React from 'react';

export default function Conferences() {
  const conferencesList = [
    { id: 1, acronym: "KDD 2024", name: "ACM SIGKDD Conference on Knowledge Discovery and Data Mining", location: "Barcelona, Spain", impactScore: "9.8/10" },
    { id: 2, acronym: "NeurIPS 2024", name: "Conference on Neural Information Processing Systems", location: "Vancouver, Canada", impactScore: "9.9/10" },
    { id: 3, acronym: "ICSE 2024", name: "International Conference on Software Engineering", location: "Lisbon, Portugal", impactScore: "9.2/10" }
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold mb-1" style={{ color: '#38bdf8' }}>Conferences & Venues</h2>
          <p className="text-light opacity-75 mb-0">Top research publication venues and conference rankings.</p>
        </div>

        {/* Conferences Grid */}
        <div className="row g-4">
          {conferencesList.map((conf) => (
            <div key={conf.id} className="col-md-4">
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
                  {/* Glowing Acronym Badge */}
                  <span 
                    className="badge px-3 py-2 fw-bold mb-3 d-inline-block" 
                    style={{ 
                      backgroundColor: 'rgba(56, 189, 248, 0.15)', 
                      color: '#38bdf8', 
                      border: '1px solid rgba(56, 189, 248, 0.3)' 
                    }}
                  >
                    {conf.acronym}
                  </span>

                  <h5 className="fw-bold text-white mb-2">{conf.name}</h5>
                  <p className="text-light opacity-75 small mb-3">🌐 {conf.location}</p>
                </div>

                <div className="mt-auto pt-3 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span className="text-light opacity-50 small">Impact Score:</span>
                  <strong className="fs-6" style={{ color: '#34d399' }}>{conf.impactScore}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}