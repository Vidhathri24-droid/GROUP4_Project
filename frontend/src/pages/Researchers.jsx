function Researchers() {
  const researchers = [
    {
      id: 1,
      name: "Dr. Ramesh Kumar",
      domain: "Artificial Intelligence",
      institution: "IIT Hyderabad",
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      domain: "Data Science",
      institution: "NIT Warangal",
    },
    {
      id: 3,
      name: "Dr. Arun Rao",
      domain: "Cyber Security",
      institution: "JNTU Hyderabad",
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Researchers</h2>

      <div className="row">
        {researchers.map((researcher) => (
          <div className="col-md-4 mb-4" key={researcher.id}>
            <div className="card shadow">
              <div className="card-body">
                <h5>{researcher.name}</h5>
                <p><strong>Domain:</strong> {researcher.domain}</p>
                <p><strong>Institution:</strong> {researcher.institution}</p>

                <button className="btn btn-primary">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Researchers;