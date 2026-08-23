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
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [participationType, setParticipationType] =
    useState("Attendee");

  const researcher = isResearcher();

  // =========================================================
  // LOAD CONFERENCE
  // =========================================================

  const loadConference = async () => {
    try {
      setLoading(true);

      const data = await getConferenceDetails(id);

      console.log("Conference details:", data);

      setConference(data);

      // -----------------------------------------------------
      // Restore participation type if already registered
      // -----------------------------------------------------

      if (data?.registration_type) {
        setParticipationType(
          data.registration_type
        );
      }
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

  // =========================================================
  // JOIN CONFERENCE
  // =========================================================

  const handleJoin = async () => {
    try {
      setJoining(true);

      await joinConference(
        id,
        participationType
      );

      if (participationType === "Presenter") {
        alert(
          "Presenter request submitted successfully. " +
            "Please wait for the Institution Admin to approve your request."
        );
      } else {
        alert(
          "Successfully joined the conference."
        );
      }

      await loadConference();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Unable to join conference."
      );
    } finally {
      setJoining(false);
    }
  };

  // =========================================================
  // LEAVE CONFERENCE
  // =========================================================

  const handleLeave = async () => {
    try {
      setLeaving(true);

      await leaveConference(id);

      alert(
        "You have left the conference."
      );

      await loadConference();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Unable to leave conference."
      );
    } finally {
      setLeaving(false);
    }
  };

  // =========================================================
  // SHARE
  // =========================================================

  const handleShare = async () => {
    if (!conference) {
      return;
    }

    const shareData = {
      title: conference.title,
      text: `Check out this conference: ${conference.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          "Conference link copied!"
        );
      } else {
        alert(
          "Unable to copy conference link."
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3 mb-0">
            Loading conference details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!conference) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Conference not found.
        </div>
      </div>
    );
  }

  // =========================================================
  // REGISTRATION STATE
  // =========================================================

  const registrationStatus =
    conference.registration_status;

  const registrationType =
    conference.registration_type;

  const isApproved =
    registrationStatus === "Approved";

  const isPending =
    registrationStatus === "Pending";

  const isRejected =
    registrationStatus === "Rejected";

  const isPresenter =
    registrationType === "Presenter";

  const isAttendee =
    registrationType === "Attendee";

  // ---------------------------------------------------------
  // Registration is considered active only when approved
  // ---------------------------------------------------------

  const isRegistered =
    conference.is_registered === true &&
    isApproved;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="container mt-4 mb-5">

      {/* ===================================================
          TOP ACTIONS
      =================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <button
          className="btn btn-outline-secondary"
          onClick={() =>
            navigate("/conferences")
          }
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

      {/* ===================================================
          CONFERENCE HEADER
      =================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-primary text-white py-4">

          <div className="d-flex justify-content-between align-items-start gap-3">

            <div>
              <h2 className="mb-2">
                {conference.title}
              </h2>

              <p className="mb-0 opacity-75">
                Conference Details
              </p>
            </div>

            <span className="badge bg-light text-primary fs-6 px-3 py-2">
              Conference
            </span>

          </div>

        </div>

        <div className="card-body p-4">

          <div className="row g-4">

            {/* DATE */}

            <div className="col-md-4">

              <div className="border rounded-3 p-3 h-100">

                <div className="text-primary fs-4 mb-2">
                  📅
                </div>

                <small className="text-muted d-block">
                  Date
                </small>

                <strong>
                  {conference.conference_date ||
                    "Not specified"}
                </strong>

              </div>

            </div>

            {/* TIME */}

            <div className="col-md-4">

              <div className="border rounded-3 p-3 h-100">

                <div className="text-primary fs-4 mb-2">
                  🕐
                </div>

                <small className="text-muted d-block">
                  Time
                </small>

                <strong>
                  {conference.conference_time ||
                    "Not specified"}
                </strong>

              </div>

            </div>

            {/* LOCATION */}

            <div className="col-md-4">

              <div className="border rounded-3 p-3 h-100">

                <div className="text-primary fs-4 mb-2">
                  📍
                </div>

                <small className="text-muted d-block">
                  Venue
                </small>

                <strong>
                  {conference.location ||
                    "Not specified"}
                </strong>

              </div>

            </div>

          </div>

          <hr className="my-4" />

          {/* PARTICIPANTS */}

          <div className="d-flex align-items-center gap-3 mb-4">

            <div
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "50px",
                height: "50px",
              }}
            >
              <span className="fs-4">
                👥
              </span>
            </div>

            <div>

              <small className="text-muted d-block">
                Registered Participants
              </small>

              <h4 className="mb-0">
                {conference.participant_count ?? 0}
              </h4>

            </div>

          </div>

          {/* DESCRIPTION */}

          <h4 className="mb-3">
            About the Conference
          </h4>

          <p className="text-muted mb-0">
            {conference.description ||
              "No description available."}
          </p>

        </div>

      </div>

      {/* ===================================================
          PRESENTER REQUEST / REGISTRATION
      =================================================== */}

      {researcher && (
        <div className="card shadow-sm border-0 mb-4">

          <div className="card-header bg-white border-bottom py-3">

            <h4 className="mb-0">
              Conference Registration
            </h4>

          </div>

          <div className="card-body p-4">

            {/* ============================================
                PENDING PRESENTER REQUEST
            ============================================ */}

            {isPending && isPresenter ? (

              <div className="alert alert-warning mb-0">

                <div className="d-flex align-items-start gap-3">

                  <div className="fs-3">
                    ⏳
                  </div>

                  <div>

                    <h5 className="alert-heading">
                      Presenter Request Pending
                    </h5>

                    <p className="mb-0">
                      Your request to participate
                      as a presenter has been sent
                      to the Institution Admin who
                      created this conference.
                      Please wait for approval.
                    </p>

                  </div>

                </div>

              </div>

            ) : isApproved && isPresenter ? (

              /* ==========================================
                 APPROVED PRESENTER
              ========================================== */

              <div className="alert alert-success mb-0">

                <div className="d-flex align-items-start gap-3">

                  <div className="fs-3">
                    ✓
                  </div>

                  <div>

                    <h5 className="alert-heading">
                      Presenter Request Approved
                    </h5>

                    <p className="mb-0">
                      Your presenter registration
                      has been approved by the
                      Institution Admin.
                    </p>

                  </div>

                </div>

              </div>

            ) : isRejected && isPresenter ? (

              /* ==========================================
                 REJECTED PRESENTER
              ========================================== */

              <div className="alert alert-danger mb-0">

                <div className="d-flex align-items-start gap-3">

                  <div className="fs-3">
                    ✕
                  </div>

                  <div>

                    <h5 className="alert-heading">
                      Presenter Request Rejected
                    </h5>

                    <p className="mb-0">
                      Your request to participate
                      as a presenter was not approved
                      by the Institution Admin.
                    </p>

                  </div>

                </div>

              </div>

            ) : isRegistered && isAttendee ? (

              /* ==========================================
                 REGISTERED ATTENDEE
              ========================================== */

              <div>

                <div className="alert alert-success">

                  <div className="d-flex align-items-start gap-3">

                    <div className="fs-3">
                      ✓
                    </div>

                    <div>

                      <h5 className="alert-heading">
                        You are registered
                      </h5>

                      <p className="mb-0">
                        You are registered as an
                        attendee for this conference.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="d-flex justify-content-end">

                  <button
                    className="btn btn-outline-danger"
                    onClick={handleLeave}
                    disabled={leaving}
                  >
                    {leaving
                      ? "Leaving..."
                      : "Leave Conference"}
                  </button>

                </div>

              </div>

            ) : (

              /* ==========================================
                 NEW REGISTRATION
              ========================================== */

              <>

                <div className="mb-4">

                  <h5 className="mb-2">
                    Join this Conference
                  </h5>

                  <p className="text-muted mb-0">
                    Choose how you would like to
                    participate in this conference.
                  </p>

                </div>

                <div className="row g-3">

                  {/* ATTENDEE */}

                  <div className="col-md-6">

                    <button
                      type="button"
                      className={`w-100 text-start border rounded-3 p-3 bg-white ${
                        participationType ===
                        "Attendee"
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() =>
                        setParticipationType(
                          "Attendee"
                        )
                      }
                    >

                      <div className="d-flex align-items-start gap-3">

                        <div className="fs-3">
                          👤
                        </div>

                        <div>

                          <h6 className="mb-1">
                            Attendee
                          </h6>

                          <small className="text-muted">
                            Attend the conference
                            and participate in
                            sessions.
                          </small>

                        </div>

                      </div>

                    </button>

                  </div>

                  {/* PRESENTER */}

                  <div className="col-md-6">

                    <button
                      type="button"
                      className={`w-100 text-start border rounded-3 p-3 bg-white ${
                        participationType ===
                        "Presenter"
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() =>
                        setParticipationType(
                          "Presenter"
                        )
                      }
                    >

                      <div className="d-flex align-items-start gap-3">

                        <div className="fs-3">
                          🎤
                        </div>

                        <div>

                          <h6 className="mb-1">
                            Presenter
                          </h6>

                          <small className="text-muted">
                            Request permission to
                            present your research.
                          </small>

                        </div>

                      </div>

                    </button>

                  </div>

                </div>

                {/* PRESENTER INFORMATION */}

                {participationType ===
                  "Presenter" && (

                  <div className="alert alert-info mt-3 mb-3">

                    <strong>
                      Presenter approval required
                    </strong>

                    <p className="mb-0 mt-1">
                      Your presenter request will
                      be sent to the Institution
                      Admin who created this
                      conference. You will receive
                      an in-app notification and
                      email once your request is
                      approved.
                    </p>

                  </div>

                )}

                <button
                  className="btn btn-primary mt-2"
                  onClick={handleJoin}
                  disabled={joining}
                >
                  {joining
                    ? "Submitting..."
                    : participationType ===
                      "Presenter"
                    ? "Request as Presenter"
                    : "Join as Attendee"}
                </button>

              </>

            )}

          </div>

        </div>
      )}

      {/* ===================================================
          PRESENTERS
      =================================================== */}

      <div className="card shadow-sm border-0 mb-4">

        <div className="card-header bg-white border-bottom py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h4 className="mb-0">
              Presenters
            </h4>

            <span className="badge bg-primary">
              {conference.presenters?.length ?? 0}
            </span>

          </div>

        </div>

        <div className="card-body p-4">

          {conference.presenters?.length > 0 ? (

            <div className="row g-3">

              {conference.presenters.map(
                (presenter) => (

                  <div
                    key={presenter.id}
                    className="col-md-6"
                  >

                    <div className="border rounded-3 p-3 h-100">

                      <div className="d-flex align-items-center gap-3">

                        <div
                          className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          🎤
                        </div>

                        <div>

                          <strong>
                            {presenter.name}
                          </strong>

                          <div className="text-muted small">
                            Approved Presenter
                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="text-center py-4">

              <div className="fs-1 mb-2">
                🎤
              </div>

              <p className="text-muted mb-0">
                No presenters registered yet.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default ConferenceDetails;