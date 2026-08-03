import React, { useState } from "react";
import axios from "axios";

function Collaboration() {
  const [researcherId, setResearcherId] = useState("");

  const sendRequest = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/collaborations", {
        researcher_id: researcherId,
      });

      alert("Collaboration Request Sent Successfully!");
      setResearcherId("");
    } catch (error) {
      console.error(error);
      alert("Failed to send collaboration request");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Collaboration Management</h2>

      <div className="card p-4 mt-3">
        <h4>Send Collaboration Request</h4>

        <input
          className="form-control mt-3"
          placeholder="Enter Researcher ID"
          value={researcherId}
          onChange={(e) => setResearcherId(e.target.value)}
        />

        <button
          className="btn btn-primary mt-3"
          onClick={sendRequest}
        >
          Send Request
        </button>
      </div>

      <div className="card p-4 mt-4">
        <h4>Pending Requests</h4>
        <p>No Pending Requests</p>
      </div>
    </div>
  );
}

export default Collaboration;