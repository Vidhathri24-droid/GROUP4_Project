import { Link } from "react-router-dom";
import { isAdmin } from "../../utils/auth";

function ConferenceCard({ conference, onDelete }) {
  const admin = isAdmin();

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  const handleJoin = () => {
    alert(
      "Join Conference feature will be connected to the backend."
    );
  };

  return (
    <div className="card shadow-sm h-100 border-0">
      <div className="card-body">
        <h4 className="card-title text-primary">
          {conference.title}
        </h4>

        <hr />

        <p className="mb-3">
          <strong>Location</strong>
          <br />
          {conference.location || "Not Available"}
        </p>

        <p className="mb-3">
          <strong>Conference Date</strong>
          <br />
          {formatDate(conference.conference_date)}
        </p>

        <p className="mb-4">
          <strong>Description</strong>
          <br />
          {conference.description
            ? conference.description.length > 120
              ? conference.description.substring(0, 120) + "..."
              : conference.description
            : "No description available."}
        </p>
      </div>

      <div className="card-footer bg-white border-0">
        <div className="d-grid gap-2">

          <Link
            to={`/conferences/${conference.id}`}
            className="btn btn-outline-primary"
          >
            View Details
          </Link>

          {admin && (
            <Link
              to={`/conferences/edit/${conference.id}`}
              className="btn btn-warning"
            >
              Edit
            </Link>
          )}

          <button
            type="button"
            className="btn btn-success"
            onClick={handleJoin}
          >
            Join Conference
          </button>

          {admin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onDelete(conference.id)}
            >
              Delete
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default ConferenceCard;
