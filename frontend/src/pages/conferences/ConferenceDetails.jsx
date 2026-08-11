import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getConferenceDetails,
  joinConference,
  leaveConference,
} from "../../services/conferenceService";

import { isResearcher } from "../../utils/auth";

function ConferenceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participationType, setParticipationType] =
    useState("Attendee");

  const researcher = isResearcher();

  const loadConference = async () => {
    try {
      setLoading(true);

      const data = await getConferenceDetails(id);

      setConference(data);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Unable to load conference."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConference();
  }, [id]);

  const handleJoin = async () => {
    try {
      await joinConference(
        id,
        participationType
      );

      alert("Successfully joined the conference.");

      await loadConference();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Unable to join conference."
      );
    }
  };

  const handleLeave = async () => {
    try {
      await leaveConference(id);

      alert("You have left the conference.");

      await loadConference();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Unable to leave conference."
      );
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: conference.title,
      text: `Check out this conference: ${conference.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert("Conference link copied!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-primary"
          role="status"
        />
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="alert alert-danger">
        Conference not found.
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">

      {/* Back + Share */}

      <div className="d-flex justify-content-between mb-4">

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/conferences")}
        >
          ← Back to Conferences
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={handleShare}
        >
          🔗 Share
        </button>

      </div>

      {/* Conference Header */}

      <div className="card shadow-sm">

        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">
            {conference.title}
          </h2>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6">

              <h5>📅 Date</h5>
              <p>
                {conference.conference_date ||
                  "Not specified"}
              </p>

              <h5>🕐 Time</h5>
              <p>
                {conference.conference_time ||
                  "Not specified"}
              </p>

              <h5>📍 Venue</h5>
              <p>
                {conference.location ||
                  "Not specified"}
              </p>

            </div>

            <div className="col-md-6">

              <h5>👥 Participants</h5>

              <p className="fs-4">
                {conference.participant_count ?? 0}
              </p>

            </div>

          </div>

          <hr />

          <h4>About the Conference</h4>

          <p>
            {conference.description ||
              "No description available."}
          </p>

        </div>

      </div>

      {/* Presenters */}

      <div className="card shadow-sm mt-4">

        <div className="card-header bg-light">
          <h4 className="mb-0">
            Presenters
          </h4>
        </div>

        <div className="card-body">

          {conference.presenters?.length > 0 ? (
            <div className="row">

              {conference.presenters.map(
                (presenter) => (
                  <div
                    key={presenter.id}
                    className="col-md-6 mb-3"
                  >
                    <div className="border rounded p-3">
                      <strong>
                        {presenter.name}
                      </strong>

                      <div className="text-muted">
                        Presenter
                      </div>
                    </div>
                  </div>
                )
              )}

            </div>
          ) : (
            <p className="text-muted mb-0">
              No presenters registered yet.
            </p>
          )}

        </div>

      </div>

      {/* Registration */}

      {researcher && (
        <div className="card shadow-sm mt-4">

          <div className="card-body">

            {conference.is_registered ? (
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <h5 className="text-success">
                    ✓ You are registered
                  </h5>

                  <p className="mb-0">
                    You have registered for this
                    conference.
                  </p>
                </div>

                <button
                  className="btn btn-danger"
                  onClick={handleLeave}
                >
                  Leave Conference
                </button>

              </div>
            ) : (
              <>

                <h5>
                  Join this Conference
                </h5>

                <div className="row align-items-end">

                  <div className="col-md-6">

                    <label className="form-label">
                      Participation Type
                    </label>

                    <select
                      className="form-select"
                      value={participationType}
                      onChange={(e) =>
                        setParticipationType(
                          e.target.value
                        )
                      }
                    >
                      <option value="Attendee">
                        Attendee
                      </option>

                      <option value="Presenter">
                        Presenter
                      </option>
                    </select>

                  </div>

                  <div className="col-md-6">

                    <button
                      className="btn btn-success w-100"
                      onClick={handleJoin}
                    >
                      Join Conference
                    </button>

                  </div>

                </div>

              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default ConferenceDetails;