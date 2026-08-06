import { Link } from "react-router-dom";

import {
  joinConference,
  leaveConference,
} from "../../services/conferenceService";

import {
  isSystemAdmin,
  isInstitutionAdmin,
  isResearcher,
} from "../../utils/auth";

import { getCurrentUser } from "../../utils/auth";

function ConferenceCard({
  conference,
  onDelete,
  refreshConferences,
}) {

  const canManage =
    isSystemAdmin() || isInstitutionAdmin();

  const researcher = isResearcher();
  const user = getCurrentUser();
  const researcherId = user?.researcher_id;
  const handleJoin = async () => {
    if (!researcherId) {
      alert("Researcher profile not found.");
      return;
    }

    try {
      await joinConference(conference.id, researcherId);

      alert("Successfully joined conference.");

      refreshConferences?.();

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Unable to join conference."
      );
    }
    };

  const handleLeave = async () => {
    if (!researcherId) {
      alert("Researcher profile not found.");
      return;
    }

    try {
      await leaveConference(conference.id, researcherId);

      alert("Successfully left conference.");

      refreshConferences?.();

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Unable to leave conference."
      );
    }
  };

  return (
    <div className="card shadow h-100">

      <div className="card-body">

        <h4 className="card-title text-primary">
          {conference.title}
        </h4>

        <hr />

        <p>
          <strong>Location:</strong>
          <br />
          {conference.location || "Not specified"}
        </p>

        <p>
          <strong>Date:</strong>
          <br />
          {conference.conference_date || "Not specified"}
        </p>

        <p>
          <strong>Description:</strong>
          <br />
          {conference.description || "No description"}
        </p>

        <p>
          <strong>Participants:</strong>{" "}
          {conference.participant_count}
        </p>

      </div>

      <div className="card-footer bg-white">

        {canManage && (
          <div className="d-flex justify-content-between">

            <Link
              to={`/conferences/edit/${conference.id}`}
              className="btn btn-warning"
            >
              Edit
            </Link>

            <button
              className="btn btn-danger"
              onClick={() => onDelete(conference.id)}
            >
              Delete
            </button>

          </div>
        )}

        {researcher && (
          <div className="d-flex justify-content-between">

            <button
              className="btn btn-success"
              onClick={handleJoin}
            >
              Join
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleLeave}
            >
              Leave
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default ConferenceCard;
