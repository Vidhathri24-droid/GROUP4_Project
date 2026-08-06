import { Link } from "react-router-dom";

export default function DashboardCollaborations() {
  // Dummy data for now
  const stats = {
    total: 24,
    internal: 15,
    external: 9,
  };

  const recent = [
    {
      id: 1,
      researcher: "John Doe",
      collaborator: "Jane Smith",
      publication: "AI in Healthcare",
      year: 2026,
    },
    {
      id: 2,
      researcher: "Alice Brown",
      collaborator: "Michael Lee",
      publication: "Deep Learning Survey",
      year: 2025,
    },
    {
      id: 3,
      researcher: "David Wilson",
      collaborator: "Sarah Thomas",
      publication: "Blockchain Security",
      year: 2024,
    },
  ];

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
              <h2 className="text-primary">{stats.total}</h2>
              <p>Total Collaborations</p>
            </div>

            <div className="col-md-4">
              <h2 className="text-success">{stats.internal}</h2>
              <p>Internal</p>
            </div>

            <div className="col-md-4">
              <h2 className="text-warning">{stats.external}</h2>
              <p>External</p>
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

          <table className="table table-hover">

            <thead>
              <tr>
                <th>Researcher</th>
                <th>Collaborator</th>
                <th>Publication</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody>

              {recent.map((item) => (
                <tr key={item.id}>
                  <td>{item.researcher}</td>
                  <td>{item.collaborator}</td>
                  <td>{item.publication}</td>
                  <td>{item.year}</td>
                </tr>
              ))}

            </tbody>

          </table>

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
