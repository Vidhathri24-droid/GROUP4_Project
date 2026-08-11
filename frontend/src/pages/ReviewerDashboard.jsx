import { useEffect, useState } from "react";

import {
  getReviewerPublications,
  reviewPublication,
} from "../services/publicationService";

function ReviewerDashboard() {
  const [publications, setPublications] = useState([]);
  const [filter, setFilter] = useState("Submitted");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keeps track of publications that the reviewer has fully reviewed
  const [reviewedPublications, setReviewedPublications] = useState({});

  const loadPublications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReviewerPublications(filter);

      setPublications(data);
      setReviewedPublications({});
    } catch (err) {
      console.error(
        "Failed to load reviewer publications:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load reviewer publications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [filter]);

  // Checkbox
  const handleCheckboxChange = (publicationId) => {
    setReviewedPublications((prev) => ({
      ...prev,
      [publicationId]: !prev[publicationId],
    }));
  };

  // Accept / Reject
  const handleReview = async (id, status) => {
    if (!reviewedPublications[id]) {
      alert(
        "Please view and review the full publication before accepting or rejecting it."
      );
      return;
    }

    const action =
      status === "ACCEPTED"
        ? "accept"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this publication?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await reviewPublication(id, status);

      alert(
        status === "ACCEPTED"
          ? "Publication accepted successfully."
          : "Publication rejected successfully."
      );

      await loadPublications();
    } catch (err) {
      console.error(
        "Review publication error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      alert(
        err.response?.data?.detail ||
          "Failed to review publication."
      );
    }
  };

  return (
    <div className="container py-4">

      <h2 className="mb-4 text-primary">
        Reviewer Dashboard
      </h2>

      {/* FILTER */}
      <div className="mb-4">
        <label className="form-label">
          Filter Publications
        </label>

        <select
          className="form-select"
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
        >
          <option value="SUBMITTED">
            Pending Review
          </option>

          <option value="ACCEPTED">
            Accepted
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <p>Loading publications...</p>
      )}

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        publications.length === 0 && (
          <div className="alert alert-info">
            No publications found.
          </div>
        )}

      {/* PUBLICATIONS */}
      {!loading &&
        !error &&
        publications.length > 0 && (
          <div className="row">

            {publications.map((publication) => {

              // Normalize status so UI works even if backend
              // returns different capitalization.
              const publicationStatus =
                String(
                  publication.status || ""
                ).toLowerCase();

              const isSubmitted =
                publicationStatus ===
                "submitted";

              const isReviewed =
                !!reviewedPublications[
                  publication.id
                ];

              return (
                <div
                  className="col-md-6 mb-4"
                  key={publication.id}
                >

                  <div className="card shadow-sm h-100">

                    <div className="card-body">

                      {/* TITLE */}
                      <h5 className="card-title">
                        {publication.title}
                      </h5>

                      {/* ABSTRACT */}
                      <p className="card-text">
                        {publication.abstract}
                      </p>

                      <hr />

                      {/* DOI */}
                      <p>
                        <strong>DOI:</strong>{" "}
                        {publication.doi || "N/A"}
                      </p>

                      {/* JOURNAL */}
                      <p>
                        <strong>Journal:</strong>{" "}
                        {publication.journal || "N/A"}
                      </p>

                      {/* CONFERENCE */}
                      <p>
                        <strong>Conference:</strong>{" "}
                        {publication.conference ||
                          "N/A"}
                      </p>

                      {/* YEAR */}
                      <p>
                        <strong>Year:</strong>{" "}
                        {publication.publication_year ||
                          "N/A"}
                      </p>

                      {/* TYPE */}
                      <p>
                        <strong>Type:</strong>{" "}
                        {publication.publication_type ||
                          "N/A"}
                      </p>

                      {/* STATUS */}
                      <p>
                        <strong>Status:</strong>{" "}

                        <span className="badge bg-secondary">
                          {publication.status}
                        </span>
                      </p>

                      {/* ================================= */}
                      {/* ACTIONS FOR SUBMITTED PUBLICATION */}
                      {/* ================================= */}

                      {isSubmitted && (
                        <div className="mt-3">

                          {/* VIEW FULL PUBLICATION */}
                          <button
                            type="button"
                            className="btn btn-primary mb-3"
                            onClick={() => {
                              window.open(
                                `http://127.0.0.1:8000/publications/${publication.id}/download`,
                                "_blank"
                              );
                            }}
                          >
                            📄 View Full Publication
                          </button>

                          {/* CHECKBOX */}
                          <div
                            className="d-flex align-items-center mb-3"
                            style={{
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onClick={() =>
                              handleCheckboxChange(
                                publication.id
                              )
                            }
                          >

                            {/* CUSTOM CHECKBOX */}
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                minWidth: "20px",
                                border: isReviewed
                                  ? "2px solid #198754"
                                  : "2px solid #0d6efd",
                                borderRadius: "4px",
                                backgroundColor:
                                  isReviewed
                                    ? "#198754"
                                    : "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                  "center",
                                marginRight: "8px",
                              }}
                            >
                              {isReviewed && (
                                <span
                                  style={{
                                    color: "white",
                                    fontSize: "15px",
                                    fontWeight:
                                      "bold",
                                    lineHeight: "1",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>

                            <span>
                              I have reviewed the full
                              publication
                            </span>

                          </div>

                          {/* ACCEPT / REJECT */}
                          {isReviewed && (
                            <div className="d-flex gap-2">

                              <button
                                type="button"
                                className="btn btn-success"
                                onClick={() =>
                                  handleReview(
                                    publication.id,
                                    "ACCEPTED"
                                  )
                                }
                              >
                                ✓ Accept
                              </button>

                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() =>
                                  handleReview(
                                    publication.id,
                                    "REJECTED"
                                  )
                                }
                              >
                                ✕ Reject
                              </button>

                            </div>
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}

export default ReviewerDashboard;