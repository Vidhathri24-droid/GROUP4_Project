function Dashboard() {
  return (
    <div className="container py-5">

      <h1 className="text-primary mb-4">Dashboard</h1>

      <div className="row">

        <div className="col-md-3 mb-4">
          <div className="card shadow text-center">
            <div className="card-body">
              <h1>👨‍🔬</h1>
              <h3>250</h3>
              <p>Researchers</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card shadow text-center">
            <div className="card-body">
              <h1>🏛️</h1>
              <h3>35</h3>
              <p>Institutions</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card shadow text-center">
            <div className="card-body">
              <h1>📚</h1>
              <h3>420</h3>
              <p>Publications</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="card shadow text-center">
            <div className="card-body">
              <h1>🤝</h1>
              <h3>185</h3>
              <p>Collaborations</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;