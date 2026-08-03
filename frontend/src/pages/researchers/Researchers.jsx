import React, { useEffect, useState } from 'react';

export default function Researchers() {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-dark mb-3">Researchers Directory</h2>
      <p className="text-muted mb-4">Explore network researchers and collaborators.</p>

      <div className="card border-0 shadow-sm p-4">
        {researchers.length === 0 ? (
          <p className="text-secondary mb-0">No researchers found.</p>
        ) : (
          <div className="list-group">
            {researchers.map((item, index) => (
              <div key={index} className="list-group-item">
                <h5 className="mb-1 text-dark">{item.name}</h5>
                <p className="mb-1 text-muted">{item.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}