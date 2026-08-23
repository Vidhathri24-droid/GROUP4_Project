import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CitationForm from "../../components/citations/CitationForm";
import { createCitation } from "../../services/citationService";
import { getPublications } from "../../services/publicationService";

function CreateCitation() {
  const navigate = useNavigate();

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const data = await getPublications();

      console.log("Publications:", data);

      setPublications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load publications:", err);
      setError("Unable to load publications.");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError("");

      console.log("Citation data:", formData);

      await createCitation(formData);

      alert("Citation created successfully.");

      navigate("/citations");
    } catch (err) {
      console.error("Create citation error:", err);

      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(
            err.response.data.detail
              .map((item) => item.msg || "Invalid input")
              .join(", ")
          );
        } else {
          setError(String(err.response.data.detail));
        }
      } else {
        setError("Failed to create citation.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-muted mt-3">
          Loading publications...
        </p>
      </div>
    );
  }

  return (
    <div className="citation-page">
      <div className="container py-5">

        {/* Page Header */}
        <div className="mb-4">

          <div
            className="d-inline-block px-3 py-2 rounded-pill mb-2"
            style={{
              backgroundColor: "#e8f1ff",
              color: "#0d6efd",
              fontSize: "0.8rem",
              fontWeight: "700",
              letterSpacing: "0.4px",
            }}
          >
            CITATION MANAGEMENT
          </div>

          <h1
            className="fw-bold mb-2"
            style={{
              color: "#17233c",
              fontSize: "2.4rem",
            }}
          >
            Create Citation
          </h1>

          <p
            className="text-muted mb-0"
            style={{
              maxWidth: "760px",
              fontSize: "1.05rem",
            }}
          >
            Generate and save a properly formatted citation
            for a publication in the Scientific Collaboration
            Network Analyzer.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div
            className="alert alert-danger shadow-sm"
            role="alert"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Citation Form */}
        <CitationForm
          publications={publications}
          onSubmit={handleSubmit}
          loading={loading}
        />

      </div>
    </div>
  );
}

export default CreateCitation;