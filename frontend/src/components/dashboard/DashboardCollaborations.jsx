import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCollaborationStats } from "../../services/collaborationService";

export default function DashboardCollaborations() {
  const [stats, setStats] = useState({
    total: 0,
    internal: 0,
    external: 0,
  });

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCollaborations = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCollaborationStats();

        setStats({
          total: data.total ?? data.collaborations ?? 0,
          internal: data.internal ?? 0,
          external: data.external ?? 0,
        });

        setRecent(
          Array.isArray(data.recent)
            ? data.recent
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load collaboration dashboard data:",
          err
        );
        setError("Unable to load collaboration data.");
      } finally {
        setLoading(false);
      }
    };

    loadCollaborations();
  }, []);

  return (
    <>
      {/* Collaboration Statistics */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-white">
          <h4 className="mb-0">🤝 Collaborations</h4>
        </div>

        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4">
              <h2 className="text-primary">
                {loading ? "—" : stats.total}
              </h2>
              <p className="mb-0">Total Collaborations</p>
            </div>

            <div className="col-md-4">
              <h2 className="text-success">
                {loading ? "—" : stats.internal}
              </h2>
              <p className="mb-0">Internal</p>
            </div>

            <div className="col-md-4">
              <h2 className="text-warning">
                {loading ? "—" : stats.external}
              </h2>
              <p className="mb-0">External</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Collaborations */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Recent Collaborations</h4>

          <Link
            to="/collaborations"
            className="btn btn-sm btn-primary"
          >
            View All
          </Link>
        </div>

        <div className="card-body">
          {error ? (
            <div className="alert alert-danger mb-0">
              {error}
            </div>
          ) : loading ? (
            <div className="text-center py-4 text-muted">
              Loading collaborations...
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No accepted collaborations found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Researcher</th>
                    <th>Collaborator</th>
                    <th>Publication</th>
                    <th>Year</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recent.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.researcher || "Unknown Researcher"}
                      </td>
                      <td>
                        {item.collaborator || "Unknown Researcher"}
                      </td>
                      <td>
                        {item.publication || "—"}
                      </td>
                      <td>
                        {item.year || "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.type === "Internal"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {item.type || "External"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {item.status || "Accepted"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Network Preview */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-white">
          <h4 className="mb-0">
            Collaboration Network
          </h4>
        </div>

        <div className="card-body text-center">
          <div
            style={{
              height: "220px",
              border: "2px dashed #0d6efd",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "22px",
              color: "#0d6efd",
            }}
          >
            Network Graph Preview
          </div>

          <Link
            to="/network"
            className="btn btn-primary mt-3"
          >
            Open Network
          </Link>
        </div>
      </div>
    </>
  );
}
