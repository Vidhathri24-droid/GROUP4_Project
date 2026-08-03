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
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark">Publications Directory</h2>
          <p className="text-muted">Browse research papers, citation metrics, and co-authorship details.</p>
        </div>
        <Link to="/publications/create" className="btn btn-primary">
          + Add Publication
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
        <div className="row g-3">
          <div className="col-md-7">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by title, author, or journal name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select 
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div className="col-md-2">
            <button 
              className="btn btn-outline-secondary w-100" 
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
          <div key={pub.id} className="card border-0 shadow-sm rounded-3 p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold mb-1 text-primary">{pub.title}</h5>
                <p className="text-muted small mb-2">
                  <strong>Authors:</strong> {pub.authors} | <strong>Journal:</strong> {pub.journal}
                </p>
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge bg-light text-dark border">Year: {pub.year}</span>
                  <span className="badge bg-success-subtle text-success border border-success">
                    Citations: {pub.citations}
                  </span>
                </div>
              </div>
              <Link to={`/publications/${pub.id}`} className="btn btn-sm btn-outline-primary ms-3 text-nowrap">
                View Paper →
              </Link>
            </div>
          </div>
        ))}

        {filteredPublications.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No publications found matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}