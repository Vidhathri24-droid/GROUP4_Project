import React from 'react';

export default function Conferences() {
  const conferencesList = [
    { id: 1, acronym: "KDD 2024", name: "ACM SIGKDD Conference on Knowledge Discovery and Data Mining", location: "Barcelona, Spain", impactScore: "9.8/10" },
    { id: 2, acronym: "NeurIPS 2024", name: "Conference on Neural Information Processing Systems", location: "Vancouver, Canada", impactScore: "9.9/10" },
    { id: 3, acronym: "ICSE 2024", name: "International Conference on Software Engineering", location: "Lisbon, Portugal", impactScore: "9.2/10" }
  ];

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-dark mb-1">Conferences & Venues</h2>
      <p className="text-muted mb-4">Top research publication venues and conference rankings.</p>

      <div className="row g-4">
        {conferencesList.map((conf) => (
          <div key={conf.id} className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
              <span className="badge bg-primary-subtle text-primary border border-primary w-fit mb-2 align-self-start">
                {conf.acronym}
              </span>
              <h5 className="fw-bold text-dark mb-2">{conf.name}</h5>
              <p className="text-muted small mb-3">🌐 {conf.location}</p>
              <div className="mt-auto border-top pt-2 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Impact Score:</span>
                <strong className="text-success">{conf.impactScore}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}