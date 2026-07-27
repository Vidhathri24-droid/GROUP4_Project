import { Link } from "react-router-dom";

function ConferenceCard({ conference, onDelete }) {
  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
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

          <Link
            to={`/conferences/edit/${conference.id}`}
            className="btn btn-warning"
          >
            Edit
          </Link>

          <button
            type="button"
            className="btn btn-success"
            onClick={() =>
              alert(
                "Join Conference feature will be enabled once the backend endpoint is available."
              )
            }
          >
            Join Conference
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onDelete(conference.id)}
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default ConferenceCard;
