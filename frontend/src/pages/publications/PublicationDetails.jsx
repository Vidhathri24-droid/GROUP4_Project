import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PublicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // All Publications Mock Data List
  const publicationsList = [
    {
      id: 1,
      title: "Graph Neural Networks for Collaboration Prediction",
      authors: ["Dr. Aravind Sharma", "Prof. Sunita Nair"],
      journal: "IEEE Transactions on Knowledge and Data Engineering",
      year: 2024,
      citations: 45,
      abstract: "Scientific collaboration prediction is essential for understanding research dynamics. This paper proposes a Graph Neural Network (GNN) framework that leverages temporal topological features to predict future co-authorships.",
      doi: "10.1109/TKDE.2024.3210451",
      keywords: ["Graph Neural Networks", "Co-authorship Network", "Link Prediction", "Social Graphs"]
    },
    {
      id: 2,
      title: "Optimizing Centrality Algorithms in Large Social Graphs",
      authors: ["Dr. Rajesh Kumar", "Dr. Sneha Patel"],
      journal: "ACM Computing Surveys",
      year: 2023,
      citations: 89,
      abstract: "Centrality metrics identify key hubs in academic networks. We present a parallelized approximation algorithm that reduces time complexity for computing betweenness centrality in million-node graphs.",
      doi: "10.1145/3541289.3541290",
      keywords: ["Centrality Metrics", "Graph Mining", "Parallel Computing", "Social Networks"]
    },
    {
      id: 3,
      title: "Survey on Co-authorship Network Analysis Techniques",
      authors: ["Dr. Aravind Sharma", "Dr. Rajesh Kumar"],
      journal: "Journal of Informetrics",
      year: 2024,
      citations: 12,
      abstract: "This survey reviews current computational paradigms applied to bibliometric networks, covering node embeddings, temporal dynamics, and community detection benchmarks.",
      doi: "10.1016/j.joi.2024.101234",
      keywords: ["Bibliometrics", "Co-authorship", "Literature Review", "Embedding Methods"]
    },
    {
      id: 4,
      title: "Distributed Community Detection in Big Data Networks",
      authors: ["Prof. Sunita Nair", "Dr. Sneha Patel"],
      journal: "Elsevier Knowledge-Based Systems",
      year: 2022,
      citations: 134,
      abstract: "Detecting dense communities in large-scale academic graphs helps isolate evolving sub-disciplines. We introduce a distributed label-propagation scheme optimized for Spark clusters.",
      doi: "10.1016/j.knosys.2022.108912",
      keywords: ["Community Detection", "Big Data", "Distributed Computing", "Spark"]
    }
  ];

  // Match paper by URL id parameter
  const paper = publicationsList.find(p => p.id === parseInt(id)) || publicationsList[0];

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <button className="btn btn-outline-secondary text-light btn-sm mb-4" onClick={() => navigate('/publications')}>
          ← Back to Publications
        </button>

        <div className="p-4 p-md-5 rounded-4 shadow-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="d-flex gap-2 mb-3">
            <span className="badge bg-primary">Year: {paper.year}</span>
            <span className="badge bg-success">Citations: {paper.citations}</span>
          </div>

          <h2 className="fw-bold text-white mb-3">{paper.title}</h2>
          
          <p className="text-info fw-semibold mb-2">
            ✍️ Authors: {paper.authors.join(', ')}
          </p>
          <p className="text-light opacity-75 small mb-4">
            📖 Journal: <em>{paper.journal}</em> | DOI: {paper.doi}
          </p>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          <h5 className="fw-bold text-white mt-4 mb-2">Abstract</h5>
          <p className="text-light opacity-75 lh-lg">{paper.abstract}</p>

          <h5 className="fw-bold text-white mt-4 mb-2">Keywords</h5>
          <div className="d-flex gap-2 flex-wrap mb-4">
            {paper.keywords.map((kw, i) => (
              <span key={i} className="badge bg-secondary opacity-75">{kw}</span>
            ))}
          </div>

          <div className="d-flex gap-3 mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button className="btn btn-primary fw-bold" onClick={() => alert(`Downloading PDF for paper: ${paper.title}`)}>
              📄 Download PDF
            </button>
            <button className="btn btn-outline-info fw-bold" onClick={() => alert('Citation copied to clipboard!')}>
              🔗 Cite Paper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}