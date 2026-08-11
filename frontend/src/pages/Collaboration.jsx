import { useEffect, useState } from "react";

import {
  getSentCollaborationRequests,
  getReceivedCollaborationRequests,
  getAcceptedCollaborations,
  acceptCollaboration,
  rejectCollaboration,
  sendCollaborationRequest,
  searchResearchers,
} from "../services/collaborationService";

function Collaborations() {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [acceptedCollaborations, setAcceptedCollaborations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [receiverId, setReceiverId] = useState("");
  const [collaborationType, setCollaborationType] =
    useState("Project");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  const [researcherSearch, setResearcherSearch] = useState("");
  const [researcherResults, setResearcherResults] = useState([]);
  const [selectedResearcher, setSelectedResearcher] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // =================================================
  // LOAD COLLABORATIONS
  // =================================================

  const loadCollaborations = async () => {
    try {
      setLoading(true);

      const [
        sent,
        received,
        accepted,
      ] = await Promise.all([
        getSentCollaborationRequests(),
        getReceivedCollaborationRequests(),
        getAcceptedCollaborations(),
      ]);

      setSentRequests(sent);
      setReceivedRequests(received);
      setAcceptedCollaborations(accepted);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Unable to load collaboration requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // INITIAL LOAD
  // =================================================

  useEffect(() => {
    loadCollaborations();
  }, []);

  // =================================================
  // RESEARCHER SEARCH
  // =================================================

  useEffect(() => {
    const search = async () => {
      if (!researcherSearch.trim()) {
        setResearcherResults([]);
        return;
      }

      // Don't search again after a researcher has been selected
      if (selectedResearcher) {
        return;
      }

      try {
        setSearchLoading(true);

        const results = await searchResearchers(
          researcherSearch.trim()
        );

        setResearcherResults(results);
      } catch (error) {
        console.error("Researcher search failed:", error);
        setResearcherResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeout = setTimeout(search, 300);

    return () => clearTimeout(timeout);
  }, [researcherSearch, selectedResearcher]);

  // =================================================
  // ACCEPT
  // =================================================

  const handleAccept = async (id) => {
    try {
      await acceptCollaboration(id);

      alert("Collaboration request accepted.");

      await loadCollaborations();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Unable to accept collaboration request."
      );
    }
  };

  // =================================================
  // REJECT
  // =================================================

  const handleReject = async (id) => {
    try {
      await rejectCollaboration(id);

      alert("Collaboration request rejected.");

      await loadCollaborations();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Unable to reject collaboration request."
      );
    }
  };

  // =================================================
  // SEND COLLABORATION REQUEST
  // =================================================

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!selectedResearcher) {
      alert("Please select a researcher.");
      return;
    }

    try {
      setSending(true);

      await sendCollaborationRequest({
        receiver_id: selectedResearcher.researcher_id,
        collaboration_type: collaborationType,
        description,
      });

      alert(
        `Collaboration request sent to ${selectedResearcher.name}.`
      );

      setSelectedResearcher(null);
      setResearcherSearch("");
      setResearcherResults([]);
      setDescription("");

      // Reload requests so the new request
      // immediately appears in Sent Collaboration Requests
      await loadCollaborations();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Failed to send collaboration request."
      );
    } finally {
      setSending(false);
    }
  };

  // =================================================
  // LOADING
  // =================================================

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container mt-5">

      <h2 className="mb-4">
        Collaboration Management
      </h2>

      {/* ================================================= */}
      {/* REQUEST COLLABORATION */}
      {/* ================================================= */}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h4 className="mb-0">
            Request Collaboration
          </h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSendRequest}>

            <div className="mb-3">
              <label className="form-label">
                Find a Researcher
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Search by name, skills, interests, publications..."
                value={researcherSearch}
                onChange={(e) => {
                  setResearcherSearch(e.target.value);
                  setSelectedResearcher(null);
                }}
              />

              {searchLoading && (
                <div className="text-muted mt-2 mb-3">
                  Searching researchers...
                </div>
              )}

              {researcherResults.length > 0 && (
                <div className="list-group mb-3 mt-2">
                  {researcherResults.map((researcher) => (
                    <button
                      type="button"
                      key={researcher.researcher_id}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setSelectedResearcher(researcher);
                        setReceiverId(
                          researcher.researcher_id
                        );
                        setResearcherSearch(researcher.name);
                        setResearcherResults([]);
                      }}
                    >
                      <div>
                        <strong>
                          {researcher.name}
                        </strong>
                      </div>

                      {researcher.skills && (
                        <div className="small text-muted mt-1">
                          <strong>Skills:</strong>{" "}
                          {researcher.skills}
                        </div>
                      )}

                      {researcher.interests && (
                        <div className="small text-muted">
                          <strong>Interests:</strong>{" "}
                          {researcher.interests}
                        </div>
                      )}

                      {researcher.projects && (
                        <div className="small text-muted">
                          <strong>Projects:</strong>{" "}
                          {researcher.projects}
                        </div>
                      )}

                      {researcher.publications && (
                        <div className="small text-muted">
                          <strong>Publications:</strong>{" "}
                          {researcher.publications}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedResearcher && (
                <div className="alert alert-success mt-2">
                  Selected researcher:{" "}
                  <strong>
                    {selectedResearcher.name}
                  </strong>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Collaboration Type
              </label>

              <select
                className="form-select"
                value={collaborationType}
                onChange={(e) =>
                  setCollaborationType(e.target.value)
                }
              >
                <option value="Project">
                  Project
                </option>

                <option value="Co-Author">
                  Co-Author
                </option>

                <option value="Supervision">
                  Supervision
                </option>

                <option value="Funding">
                  Funding
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Describe what you would like to collaborate on..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !selectedResearcher}
            >
              {sending
                ? "Sending..."
                : "Send Collaboration Request"}
            </button>

          </form>

        </div>
      </div>

      {/* ================================================= */}
      {/* RECEIVED REQUESTS */}
      {/* ================================================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h4 className="mb-0">
            Incoming Collaboration Requests
          </h4>
        </div>

        <div className="card-body">

          {receivedRequests.length === 0 ? (

            <p className="text-muted">
              No incoming collaboration requests.
            </p>

          ) : (

            receivedRequests.map((request) => (

              <div
                key={request.id}
                className="border rounded p-3 mb-3"
              >

                <h5>
                  Collaboration Request
                </h5>

                <p>
                  <strong>From:</strong>{" "}
                  {request.sender_name ||
                    request.sender_id}
                </p>

                {request.collaboration_type && (
                  <p>
                    <strong>Type:</strong>{" "}
                    {request.collaboration_type}
                  </p>
                )}

                {request.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    {request.description}
                  </p>
                )}

                <span className="badge bg-warning text-dark me-2">
                  Pending
                </span>

                <button
                  className="btn btn-success me-2"
                  onClick={() =>
                    handleAccept(request.id)
                  }
                >
                  Accept
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleReject(request.id)
                  }
                >
                  Reject
                </button>

              </div>

            ))

          )}

        </div>
      </div>

      {/* ================================================= */}
      {/* SENT REQUESTS */}
      {/* ================================================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h4 className="mb-0">
            Sent Collaboration Requests
          </h4>
        </div>

        <div className="card-body">

          {sentRequests.length === 0 ? (

            <p className="text-muted">
              No pending requests sent.
            </p>

          ) : (

            sentRequests.map((request) => (

              <div
                key={request.id}
                className="border rounded p-3 mb-3"
              >

                <h5>
                  Collaboration Request
                </h5>

                <p>
                  <strong>To:</strong>{" "}
                  {request.receiver_name ||
                    request.receiver_id}
                </p>

                {request.collaboration_type && (
                  <p>
                    <strong>Type:</strong>{" "}
                    {request.collaboration_type}
                  </p>
                )}

                {request.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    {request.description}
                  </p>
                )}

                <span className="badge bg-warning text-dark">
                  Pending
                </span>

              </div>

            ))

          )}

        </div>
      </div>

      {/* ================================================= */}
      {/* ACCEPTED */}
      {/* ================================================= */}

      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h4 className="mb-0">
            Accepted Collaborations
          </h4>
        </div>

        <div className="card-body">

          {acceptedCollaborations.length === 0 ? (

            <p className="text-muted">
              No accepted collaborations yet.
            </p>

          ) : (

            acceptedCollaborations.map((collaboration) => (

              <div
                key={collaboration.id}
                className="border rounded p-3 mb-3"
              >

                <h5>
                  Collaboration
                </h5>

                <p>
                  <strong>Researcher:</strong>{" "}
                  {collaboration.other_researcher_name ||
                    collaboration.sender_name ||
                    collaboration.receiver_name ||
                    "Researcher"}
                </p>

                {collaboration.collaboration_type && (
                  <p>
                    <strong>Type:</strong>{" "}
                    {collaboration.collaboration_type}
                  </p>
                )}

                {collaboration.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    {collaboration.description}
                  </p>
                )}

                <span className="badge bg-success">
                  Accepted
                </span>

              </div>

            ))

          )}

        </div>
      </div>

    </div>
  );
}

export default Collaborations;