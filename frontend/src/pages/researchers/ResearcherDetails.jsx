import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResearcherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // All Researchers Mock Data
  const researchersList = [
    {
      id: 1,
      name: "Dr. Aravind Sharma",
      title: "Senior Professor & Network Science Researcher",
      institution: "IIT Bombay - Department of Computer Science",
      domain: "Artificial Intelligence & Graph Analytics",
      email: "aravind.sharma@iitb.ac.in",
      hIndex: 18,
      i10Index: 24,
      totalCitations: 1250,
      totalPapers: 42,
      bio: "Dr. Aravind Sharma specializes in Graph Neural Networks, Social Network Analysis, and Complex Network Mining. He has led several national AI research initiatives.",
      coAuthors: [
        { id: 2, name: "Prof. Sunita Nair", institution: "IISc Bengaluru", papersCount: 8 },
        { id: 3, name: "Dr. Rajesh Kumar", institution: "BITS Pilani", papersCount: 5 }
      ],
      recentPublications: [
        { id: 1, title: "Graph Neural Networks for Collaboration Prediction", year: 2024, citations: 45, journal: "IEEE TKDE" },
        { id: 3, title: "Survey on Co-authorship Network Analysis Techniques", year: 2024, citations: 12, journal: "Journal of Informetrics" }
      ]
    },
    {
      id: 2,
      name: "Prof. Sunita Nair",
      title: "Associate Professor & Data Mining Expert",
      institution: "IISc Bengaluru - Division of EECS",
      domain: "Network Analysis & Social Graphs",
      email: "sunita.nair@iisc.ac.in",
      hIndex: 15,
      i10Index: 19,
      totalCitations: 980,
      totalPapers: 38,
      bio: "Prof. Sunita Nair focuses on large-scale network algorithms, dynamic graph representations, and cross-institutional collaboration modeling.",
      coAuthors: [
        { id: 1, name: "Dr. Aravind Sharma", institution: "IIT Bombay", papersCount: 8 },
        { id: 4, name: "Dr. Sneha Patel", institution: "IIT Delhi", papersCount: 4 }
      ],
      recentPublications: [
        { id: 1, title: "Graph Neural Networks for Collaboration Prediction", year: 2024, citations: 45, journal: "IEEE TKDE" },
        { id: 4, title: "Distributed Community Detection in Big Data Networks", year: 2022, citations: 134, journal: "Elsevier" }
      ]
    },
    {
      id: 3,
      name: "Dr. Rajesh Kumar",
      title: "Assistant Professor",
      institution: "BITS Pilani - Computer Science Department",
      domain: "Graph Mining & Link Prediction",
      email: "rajesh.kumar@pilani.bits-pilani.ac.in",
      hIndex: 12,
      i10Index: 15,
      totalCitations: 610,
      totalPapers: 29,
      bio: "Dr. Rajesh Kumar conducts research in graph mining, topological link prediction algorithms, and citation network structures.",
      coAuthors: [
        { id: 1, name: "Dr. Aravind Sharma", institution: "IIT Bombay", papersCount: 5 },
        { id: 4, name: "Dr. Sneha Patel", institution: "IIT Delhi", papersCount: 6 }
      ],
      recentPublications: [
        { id: 2, title: "Optimizing Centrality Algorithms in Large Social Graphs", year: 2023, citations: 89, journal: "ACM Computing Surveys" }
      ]
    },
    {
      id: 4,
      name: "Dr. Sneha Patel",
      title: "Lead AI Researcher",
      institution: "IIT Delhi - Department of CS",
      domain: "Machine Learning & Graph AI",
      email: "sneha.patel@iitd.ac.in",
      hIndex: 22,
      i10Index: 28,
      totalCitations: 1890,
      totalPapers: 51,
      bio: "Dr. Sneha Patel specializes in scalable machine learning models for complex biological and academic collaboration networks.",
      coAuthors: [
        { id: 3, name: "Dr. Rajesh Kumar", institution: "BITS Pilani", papersCount: 6 },
        { id: 2, name: "Prof. Sunita Nair", institution: "IISc Bengaluru", papersCount: 4 }
      ],
      recentPublications: [
        { id: 2, title: "Optimizing Centrality Algorithms in Large Social Graphs", year: 2023, citations: 89, journal: "ACM Computing Surveys" },
        { id: 4, title: "Distributed Community Detection in Big Data Networks", year: 2022, citations: 134, journal: "Elsevier" }
      ]
    }
  ];

  // Match researcher by URL id parameter
  const researcher = researchersList.find(r => r.id === parseInt(id)) || researchersList[0];

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* Back Button */}
        <button 
          className="btn btn-outline-light btn-sm mb-4 fw-semibold" 
          onClick={() => navigate('/researchers')}
        >
          ← Back to Researchers Directory
        </button>

        {/* Profile Header Card */}
        <div className="p-4 p-md-5 rounded-4 shadow-lg mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                <h2 className="fw-bold text-white mb-0">{researcher.name}</h2>
                <span className="badge bg-info text-dark fw-bold">{researcher.domain}</span>
              </div>
              <p className="text-light opacity-75 mb-1">{researcher.title}</p>
              <p className="text-info small mb-3">🏢 {researcher.institution} | ✉️ {researcher.email}</p>
            </div>
            
            <button className="btn btn-primary fw-bold px-4" onClick={() => alert(`Opening collaboration graph for ${researcher.name}...`)}>
              🌐 View Network Graph
            </button>
          </div>

          <p className="text-light opacity-75 mt-3 lh-base">{researcher.bio}</p>

          {/* Quick Metrics Bar */}
          <div className="row g-3 mt-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="col-6 col-md-3">
              <span className="text-muted small d-block">PUBLICATIONS</span>
              <strong className="text-info fs-4">{researcher.totalPapers}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted small d-block">TOTAL CITATIONS</span>
              <strong className="text-success fs-4">{researcher.totalCitations}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted small d-block">H-INDEX</span>
              <strong className="text-warning fs-4">{researcher.hIndex}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted small d-block">I10-INDEX</span>
              <strong className="text-danger fs-4">{researcher.i10Index}</strong>
            </div>
          </div>
        </div>

        {/* Content Grid: Publications + Co-Authors */}
        <div className="row g-4">
          
          {/* Top Publications Column */}
          <div className="col-md-7">
            <div className="p-4 rounded-4 shadow-sm h-100" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h5 className="fw-bold text-white mb-4">📚 Featured Publications</h5>
              
              <div className="d-flex flex-column gap-3">
                {researcher.recentPublications.map((pub) => (
                  <div key={pub.id} className="p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h6 className="fw-bold text-info mb-1" style={{ cursor: 'pointer' }} onClick={() => navigate(`/publications/${pub.id}`)}>
                      {pub.title}
                    </h6>
                    <p className="small text-light opacity-75 mb-2">{pub.journal} • {pub.year}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-secondary opacity-75">Citations: {pub.citations}</span>
                      <button 
                        className="btn btn-link text-info btn-sm p-0 text-decoration-none"
                        onClick={() => navigate(`/publications/${pub.id}`)}
                      >
                        View Paper →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Co-authors Column */}
          <div className="col-md-5">
            <div className="p-4 rounded-4 shadow-sm h-100" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h5 className="fw-bold text-white mb-4">🤝 Frequent Co-Authors</h5>
              
              <div className="d-flex flex-column gap-3">
                {researcher.coAuthors.map((author) => (
                  <div key={author.id} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <h6 className="fw-bold text-white mb-0">{author.name}</h6>
                      <span className="small text-muted">{author.institution}</span>
                    </div>
                    <span className="badge bg-success text-dark">{author.papersCount} Joint Papers</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}