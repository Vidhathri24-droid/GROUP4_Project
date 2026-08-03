import React, { useEffect, useState } from 'react';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch('http://localhost:8000/reports/summary');
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch report summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setDownloading(true);
      const url = `http://localhost:8000/reports/export/${type}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `SCNA_Report.${type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(`Failed to download ${type.toUpperCase()} report.`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Reports & Analytics</h2>
          <p className="text-muted mb-0">System Insights, Metrics, & Data Export</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-success d-flex align-items-center gap-2 fw-semibold"
            onClick={() => handleExport('csv')}
            disabled={downloading}
          >
            📊 Export CSV
          </button>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 fw-semibold"
            onClick={() => handleExport('pdf')}
            disabled={downloading}
          >
            📄 Download PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading Analytics Data...</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-primary rounded-3">
                <span className="text-muted small fw-semibold">TOTAL RESEARCHERS</span>
                <h3 className="fw-bold text-primary mt-2 mb-0">{summary?.total_researchers || 0}</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-success rounded-3">
                <span className="text-muted small fw-semibold">PUBLICATIONS</span>
                <h3 className="fw-bold text-success mt-2 mb-0">{summary?.total_publications || 0}</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-warning rounded-3">
                <span className="text-muted small fw-semibold">INSTITUTIONS</span>
                <h3 className="fw-bold text-warning mt-2 mb-0">{summary?.total_institutions || 0}</h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3 bg-white border-start border-4 border-info rounded-3">
                <span className="text-muted small fw-semibold">TOTAL CITATIONS</span>
                <h3 className="fw-bold text-info mt-2 mb-0">{summary?.total_citations || 0}</h3>
              </div>
            </div>
          </div>

          {/* Data Section */}
          <div className="row g-4">
            <div className="col-md-7">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">Top Research Domains</h5>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Domain Name</th>
                        <th className="text-end">Publications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary?.top_domains?.map((d, i) => (
                        <tr key={i}>
                          <td className="fw-semibold text-secondary">{d.domain}</td>
                          <td className="text-end fw-bold text-dark">{d.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-sm p-4 h-100">
                <h5 className="fw-bold text-dark mb-3">Recent Activity Highlights</h5>
                <ul className="list-group list-group-flush">
                  {summary?.recent_activities?.map((act, idx) => (
                    <li key={idx} className="list-group-item px-0 py-2 border-0">
                      <div className="small text-muted">{act.date}</div>
                      <div className="fw-semibold text-dark">{act.event}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}