import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createPublication,
  uploadPublication,
} from "../services/publicationService";

function CreatePublication() {
  const navigate = useNavigate();

  const [pdf, setPdf] = useState(null);

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    doi: "",
    journal: "",
    conference: "",
    publication_year: "",
    publication_type: "",
    status: "",
    url: "",
    citation_count: 0,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "citation_count" ||
        e.target.name === "publication_year"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("CREATE PUBLICATION BUTTON CLICKED");
    console.log("FORM DATA:", form);

    try {
      const data = {
        title: form.title,
        abstract: form.abstract,
        doi: form.doi,
        journal: form.journal,
        conference: form.conference,
        publication_year: Number(form.publication_year),
        publication_type: form.publication_type,
        status: form.status
          ? form.status.charAt(0).toUpperCase() +
            form.status.slice(1).toLowerCase()
          : "Submitted",
        url: form.url,
        citation_count: Number(form.citation_count || 0),
      };

      console.log("SENDING PUBLICATION:", data);

      // Create publication as JSON
      const createdPublication = await createPublication(data);

      console.log("PUBLICATION CREATED:", createdPublication);

      // Upload PDF separately if selected
      if (pdf && createdPublication?.id) {
        console.log("Uploading PDF...");

        await uploadPublication(
          createdPublication.id,
          pdf
        );

        console.log("PDF UPLOADED SUCCESSFULLY");
      }

      alert("Publication created successfully!");

      navigate("/publications");
    } catch (error) {
      console.error("CREATE PUBLICATION ERROR:", error);
      console.error(
        "BACKEND RESPONSE:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.detail
          ? JSON.stringify(error.response.data.detail)
          : "Failed to create publication."
      );
    }
  };

  return (
    <div className="dashboard-page min-vh-100">

      <div className="container py-5">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="mb-5">

          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#0d6efd",
                borderRadius: "50%",
                display: "inline-block",
                boxShadow: "0 0 0 5px rgba(13, 110, 253, 0.12)",
              }}
            />

            <span
              className="text-primary fw-semibold"
              style={{
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
              }}
            >
              PUBLICATION MANAGEMENT
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">

            <div>
              <h1
                className="fw-bold mb-2"
                style={{
                  color: "#17233c",
                  fontSize: "2.5rem",
                }}
              >
                Create Publication
              </h1>

              <p
                className="text-muted mb-0"
                style={{ fontSize: "1rem" }}
              >
                Add a new research publication to the Scientific
                Collaboration Network Analyzer.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => navigate("/publications")}
            >
              ← Back to Publications
            </button>

          </div>
        </div>


        {/* =====================================================
            FORM
        ====================================================== */}
        <form onSubmit={handleSubmit}>

          {/* =====================================================
              BASIC PUBLICATION INFORMATION
          ====================================================== */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4 p-lg-5">

              <div className="d-flex align-items-center mb-4">

                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "#eaf2ff",
                    color: "#0d6efd",
                    fontSize: "1.2rem",
                  }}
                >
                  📄
                </div>

                <div>
                  <h4
                    className="mb-1 fw-semibold"
                    style={{ color: "#17233c" }}
                  >
                    Publication Information
                  </h4>

                  <p className="text-muted mb-0 small">
                    Enter the main information about the research
                    publication.
                  </p>
                </div>

              </div>


              {/* TITLE */}
              <div className="mb-4">

                <label
                  htmlFor="title"
                  className="form-label fw-semibold"
                >
                  Title
                  <span className="text-danger ms-1">*</span>
                </label>

                <input
                  id="title"
                  className="form-control form-control-lg"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter the publication title"
                  required
                />

              </div>


              {/* ABSTRACT */}
              <div className="mb-2">

                <label
                  htmlFor="abstract"
                  className="form-label fw-semibold"
                >
                  Abstract
                  <span className="text-danger ms-1">*</span>
                </label>

                <textarea
                  id="abstract"
                  className="form-control"
                  rows="6"
                  name="abstract"
                  value={form.abstract}
                  onChange={handleChange}
                  placeholder="Enter the abstract of the publication"
                  required
                />

                <div className="form-text">
                  Provide a concise summary of the research,
                  methodology, and key findings.
                </div>

              </div>

            </div>
          </div>


          {/* =====================================================
              PUBLICATION DETAILS
          ====================================================== */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4 p-lg-5">

              <div className="d-flex align-items-center mb-4">

                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "#edf9f2",
                    color: "#198754",
                    fontSize: "1.2rem",
                  }}
                >
                  🔬
                </div>

                <div>
                  <h4
                    className="mb-1 fw-semibold"
                    style={{ color: "#17233c" }}
                  >
                    Publication Details
                  </h4>

                  <p className="text-muted mb-0 small">
                    Add journal, conference, year and publication
                    classification details.
                  </p>
                </div>

              </div>


              <div className="row g-4">

                {/* DOI */}
                <div className="col-md-6">

                  <label
                    htmlFor="doi"
                    className="form-label fw-semibold"
                  >
                    DOI
                  </label>

                  <input
                    id="doi"
                    className="form-control"
                    name="doi"
                    value={form.doi}
                    onChange={handleChange}
                    placeholder="e.g. 10.1000/example"
                  />

                  <div className="form-text">
                    Digital Object Identifier, if available.
                  </div>

                </div>


                {/* JOURNAL */}
                <div className="col-md-6">

                  <label
                    htmlFor="journal"
                    className="form-label fw-semibold"
                  >
                    Journal
                  </label>

                  <input
                    id="journal"
                    className="form-control"
                    name="journal"
                    value={form.journal}
                    onChange={handleChange}
                    placeholder="Enter journal name"
                  />

                </div>


                {/* CONFERENCE */}
                <div className="col-md-6">

                  <label
                    htmlFor="conference"
                    className="form-label fw-semibold"
                  >
                    Conference
                  </label>

                  <input
                    id="conference"
                    className="form-control"
                    name="conference"
                    value={form.conference}
                    onChange={handleChange}
                    placeholder="Enter conference name"
                  />

                </div>


                {/* PUBLICATION YEAR */}
                <div className="col-md-6">

                  <label
                    htmlFor="publication_year"
                    className="form-label fw-semibold"
                  >
                    Publication Year
                  </label>

                  <input
                    id="publication_year"
                    type="number"
                    className="form-control"
                    name="publication_year"
                    value={form.publication_year}
                    onChange={handleChange}
                    placeholder="e.g. 2026"
                    min="1900"
                    max="2100"
                  />

                </div>


                {/* PUBLICATION TYPE */}
                <div className="mb-3">
                  <label className="form-label">Publication Type</label>

                  <select
                    className="form-select"
                    name="publication_type"
                    value={form.publication_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select publication type</option>
                    <option value="Journal">Journal</option>
                    <option value="Conference">Conference</option>
                    <option value="Book">Book</option>
                    <option value="BookChapter">Book Chapter</option>
                    <option value="Patent">Patent</option>
                    <option value="Thesis">Thesis</option>
                  </select>
                </div>


                {/* STATUS */}
                <div className="mb-3">
                  <label className="form-label">Status</label>

                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select status</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Published">Published</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>


                {/* CITATION COUNT */}
                <div className="col-md-6">

                  <label
                    htmlFor="citation_count"
                    className="form-label fw-semibold"
                  >
                    Citation Count
                  </label>

                  <input
                    id="citation_count"
                    type="number"
                    className="form-control"
                    name="citation_count"
                    value={form.citation_count}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />

                </div>

              </div>

            </div>
          </div>


          {/* =====================================================
              ONLINE INFORMATION
          ====================================================== */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4 p-lg-5">

              <div className="d-flex align-items-center mb-4">

                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "#f1edff",
                    color: "#6f42c1",
                    fontSize: "1.2rem",
                  }}
                >
                  🔗
                </div>

                <div>
                  <h4
                    className="mb-1 fw-semibold"
                    style={{ color: "#17233c" }}
                  >
                    Online Information
                  </h4>

                  <p className="text-muted mb-0 small">
                    Add an online link where the publication can
                    be accessed.
                  </p>
                </div>

              </div>


              <label
                htmlFor="url"
                className="form-label fw-semibold"
              >
                Publication URL
              </label>

              <input
                id="url"
                type="url"
                className="form-control form-control-lg"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com/publication"
              />

            </div>
          </div>


          {/* =====================================================
              PDF UPLOAD
          ====================================================== */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-4 p-lg-5">

              <div className="d-flex align-items-center mb-4">

                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "#fff4e5",
                    color: "#fd7e14",
                    fontSize: "1.2rem",
                  }}
                >
                  📎
                </div>

                <div>
                  <h4
                    className="mb-1 fw-semibold"
                    style={{ color: "#17233c" }}
                  >
                    Publication Document
                  </h4>

                  <p className="text-muted mb-0 small">
                    Upload the PDF version of the publication.
                  </p>
                </div>

              </div>


              <div
                className="p-4 rounded-3"
                style={{
                  backgroundColor: "#f8f9fc",
                  border: "1px dashed #ced4da",
                }}
              >

                <label
                  htmlFor="publicationPdf"
                  className="form-label fw-semibold"
                >
                  Upload PDF
                </label>

                <input
                  id="publicationPdf"
                  type="file"
                  accept=".pdf"
                  className="form-control"
                  onChange={(e) =>
                    setPdf(e.target.files[0])
                  }
                />

                <div className="form-text mt-2">
                  Only PDF files are accepted.
                </div>

                {pdf && (
                  <div className="alert alert-success mt-3 mb-0 py-2">
                    <strong>Selected file:</strong>{" "}
                    {pdf.name}
                  </div>
                )}

              </div>

            </div>
          </div>


          {/* =====================================================
              ACTIONS
          ====================================================== */}
          <div className="card border-0 shadow-sm rounded-4 mb-5">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                <div>
                  <h6 className="fw-semibold mb-1">
                    Ready to create this publication?
                  </h6>

                  <p className="text-muted small mb-0">
                    Review the information before submitting.
                  </p>
                </div>


                <div className="d-flex gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2"
                    onClick={() =>
                      navigate("/publications")
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary px-4 py-2 fw-semibold"
                    type="submit"
                  >
                    Create Publication
                  </button>

                </div>

              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CreatePublication;