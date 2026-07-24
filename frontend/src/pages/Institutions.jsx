function Institutions() {
  const institutions = [
    {
      id: 1,
      name: "IIT Hyderabad",
      location: "Hyderabad",
      researchers: 120,
    },
    {
      id: 2,
      name: "NIT Warangal",
      location: "Warangal",
      researchers: 95,
    },
    {
      id: 3,
      name: "JNTU Hyderabad",
      location: "Hyderabad",
      researchers: 150,
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="text-success mb-4">Institutions</h2>

      <div className="row">
        {institutions.map((institution) => (
          <div className="col-md-4 mb-4" key={institution.id}>
            <div className="card shadow">
              <div className="card-body">
                <h5>{institution.name}</h5>

                <p>
                  <strong>Location:</strong> {institution.location}
                </p>

                <p>
                  <strong>Researchers:</strong> {institution.researchers}
                </p>

                <button className="btn btn-success">
                  View Institution
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Institutions;