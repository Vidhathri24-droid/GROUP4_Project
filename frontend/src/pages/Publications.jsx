function Publications() {
  return (
    <div className="container mt-5">
      <h1 className="text-danger mb-4">Publications</h1>

      <div className="card p-3 mb-3">
        <h4>AI in Healthcare</h4>
        <p><strong>Author:</strong> Dr. Ramesh Kumar</p>
        <p><strong>Year:</strong> 2025</p>
        <button className="btn btn-danger">
          View Publication
        </button>
      </div>

      <div className="card p-3 mb-3">
        <h4>Machine Learning Applications</h4>
        <p><strong>Author:</strong> Dr. Priya Sharma</p>
        <p><strong>Year:</strong> 2024</p>
        <button className="btn btn-danger">
          View Publication
        </button>
      </div>

      <div className="card p-3">
        <h4>Cyber Security Trends</h4>
        <p><strong>Author:</strong> Dr. Arun Rao</p>
        <p><strong>Year:</strong> 2025</p>
        <button className="btn btn-danger">
          View Publication
        </button>
      </div>
    </div>
  );
}

export default Publications;