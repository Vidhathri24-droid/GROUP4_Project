import { useNavigate } from "react-router-dom";

function ConferenceCard({ conference }) {
  const navigate = useNavigate();

  return (
    <div
      className="card h-100 shadow-sm conference-card"
      onClick={() =>
        navigate(`/conferences/${conference.id}`)
      }
      style={{ cursor: "pointer" }}
    >
      <div className="card-body">

        <h4 className="card-title text-primary">
          {conference.title}
        </h4>

        <hr />

        <p>
          <strong>Date:</strong>
          <br />
          {conference.conference_date || "Not specified"}
        </p>

        <p>
          <strong>Time:</strong>
          <br />
          {conference.conference_time || "Not specified"}
        </p>

        <p>
          <strong>Venue:</strong>
          <br />
          {conference.location || "Not specified"}
        </p>

        <p>
          <strong>Participants:</strong>{" "}
          {conference.participant_count ?? 0}
        </p>

      </div>

      <div className="card-footer bg-white">
        <button
          className="btn btn-primary w-100"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/conferences/${conference.id}`);
          }}
        >
          View Conference
        </button>
      </div>
    </div>
  );
}

export default ConferenceCard;