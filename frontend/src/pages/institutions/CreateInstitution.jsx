import { useState } from "react";
import { useNavigate } from "react-router-dom";

import InstitutionForm from "../../components/institutions/InstitutionForm";
import { createInstitution } from "../../services/institutionService";

function CreateInstitution() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError("");

      await createInstitution(formData);

      alert("Institution created successfully.");

      navigate("/institutions");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(
            err.response.data.detail
              .map((item) => item.msg)
              .join(", ")
          );
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError("Failed to create institution.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          "linear-gradient(135deg, #f4f8ff 0%, #f8fbff 45%, #eef5ff 100%)",
      }}
    >
      <div className="container py-5">

        {/* -------------------------------------------------- */}
        {/* Page Header */}
        {/* -------------------------------------------------- */}

        <div className="row justify-content-center mb-4">
          <div className="col-lg-10">

            <div className="mb-2">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  backgroundColor: "#e8f1ff",
                  color: "#0d6efd",
                  fontWeight: "600",
                  letterSpacing: "0.4px",
                }}
              >
                🏛️ INSTITUTION MANAGEMENT
              </span>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">

              <div>
                <h1
                  className="fw-bold mb-2"
                  style={{
                    color: "#172b4d",
                    fontSize: "2.4rem",
                  }}
                >
                  Create Institution
                </h1>

                <p
                  className="mb-0"
                  style={{
                    color: "#667085",
                    fontSize: "1.05rem",
                    maxWidth: "720px",
                  }}
                >
                  Add a research institution to the Scientific Collaboration
                  Network and keep its information organized.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/institutions")}
                disabled={loading}
              >
                ← Back to Institutions
              </button>

            </div>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Error Message */}
        {/* -------------------------------------------------- */}

        {error && (
          <div className="row justify-content-center mb-4">
            <div className="col-lg-10">

              <div
                className="alert alert-danger border-0 shadow-sm d-flex align-items-start"
                role="alert"
                style={{
                  borderRadius: "14px",
                }}
              >
                <div className="me-3 fs-5">⚠️</div>

                <div>
                  <div className="fw-bold mb-1">
                    Unable to create institution
                  </div>

                  <div>
                    {error}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* Main Form Card */}
        {/* -------------------------------------------------- */}

        <div className="row justify-content-center">
          <div className="col-lg-10">

            <div
              className="card border-0 shadow-lg overflow-hidden"
              style={{
                borderRadius: "20px",
              }}
            >

              {/* Card Header */}

              <div
                className="text-white p-4 p-md-5"
                style={{
                  background:
                    "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 55%, #084298 100%)",
                }}
              >

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "62px",
                      height: "62px",
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.16)",
                      fontSize: "30px",
                    }}
                  >
                    🏛️
                  </div>

                  <div>
                    <h3 className="fw-bold mb-1">
                      Institution Information
                    </h3>

                    <p
                      className="mb-0"
                      style={{
                        color: "rgba(255,255,255,0.88)",
                      }}
                    >
                      Enter the details of the research institution.
                    </p>
                  </div>

                </div>
              </div>

              {/* Form Content */}

              <div className="card-body p-4 p-md-5 bg-white">

                <div
                  className="mb-4 p-3"
                  style={{
                    backgroundColor: "#f8faff",
                    border: "1px solid #e5edff",
                    borderRadius: "12px",
                  }}
                >
                  <div className="d-flex align-items-start gap-3">

                    <div
                      style={{
                        fontSize: "22px",
                      }}
                    >
                      ℹ️
                    </div>

                    <div>
                      <div
                        className="fw-semibold mb-1"
                        style={{ color: "#172b4d" }}
                      >
                        Add accurate institution details
                      </div>

                      <div
                        className="small"
                        style={{ color: "#667085" }}
                      >
                        Provide the institution name, contact information,
                        website and location. These details will be available
                        throughout the research network.
                      </div>
                    </div>

                  </div>
                </div>

                <InstitutionForm
                  onSubmit={handleSubmit}
                  loading={loading}
                />

              </div>

            </div>

            {/* -------------------------------------------------- */}
            {/* Bottom Information */}
            {/* -------------------------------------------------- */}

            <div className="row mt-4 g-3">

              <div className="col-md-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "14px",
                  }}
                >
                  <div className="card-body p-4">

                    <div className="fs-3 mb-2">
                      🏛️
                    </div>

                    <h6 className="fw-bold mb-1">
                      Institution Profile
                    </h6>

                    <p
                      className="small mb-0"
                      style={{ color: "#667085" }}
                    >
                      Maintain a centralized profile for each research
                      institution.
                    </p>

                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "14px",
                  }}
                >
                  <div className="card-body p-4">

                    <div className="fs-3 mb-2">
                      🌐
                    </div>

                    <h6 className="fw-bold mb-1">
                      Online Presence
                    </h6>

                    <p
                      className="small mb-0"
                      style={{ color: "#667085" }}
                    >
                      Add the institution website and contact information
                      for easy access.
                    </p>

                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "14px",
                  }}
                >
                  <div className="card-body p-4">

                    <div className="fs-3 mb-2">
                      🤝
                    </div>

                    <h6 className="fw-bold mb-1">
                      Research Network
                    </h6>

                    <p
                      className="small mb-0"
                      style={{ color: "#667085" }}
                    >
                      Connect researchers and publications with their
                      associated institutions.
                    </p>

                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateInstitution;