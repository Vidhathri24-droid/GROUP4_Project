import React, { useState, useEffect } from 'react';

// Sample dummy data jab tak backend ready na ho
const DUMMY_PUBLICATIONS = [
  {
    id: 1,
    title: "Quantum Computing Advances in Neural Networks",
    year: 2024,
    citations: 45
  },
  {
    id: 2,
    title: "Graph Theory Applications in Social Science",
    year: 2023,
    citations: 120
  },
  {
    id: 3,
    title: "Scalable Machine Learning Models for Healthcare",
    year: 2025,
    citations: 18
  }
];

const Publications = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8000/publications/');
        if (!res.ok) throw new Error('API route not found');
        const data = await res.json();
        setPublications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Backend API error, falling back to dummy data:', err);
        // Backend fail hone par fallback dummy data load karega
        setPublications(DUMMY_PUBLICATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const filteredPubs = publications.filter((pub) => {
    const titleMatch = pub.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const yearMatch = pub.year?.toString().includes(searchQuery);
    return titleMatch || yearMatch;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
          📚 Research Publications
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
          Browse all scientific publications, citations, and metadata
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by publication title or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '10px 16px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
          Loading publications...
        </div>
      ) : filteredPubs.length === 0 ? (
        <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
          No publications found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredPubs.map((pub, idx) => (
            <div
              key={pub.id || idx}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px 20px'
              }}
            >
              <h3 style={{ fontSize: '16px', color: '#60a5fa', margin: '0 0 8px 0' }}>
                {pub.title}
              </h3>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#9ca3af' }}>
                <span>📅 Year: <strong style={{ color: '#f3f4f6' }}>{pub.year || 'N/A'}</strong></span>
                <span>⭐ Citations: <strong style={{ color: '#34d399' }}>{pub.citations || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Publications;