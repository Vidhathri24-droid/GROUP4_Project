import { useEffect, useState } from "react";

function CitationForm({
  initialData = {},
  publications = [],
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    publication_id: "",
    title: "",
    authors: "",
    journal: "",
    year: "",
    volume: "",
    issue: "",
    pages: "",
    doi: "",
    url: "",
    citation_style: "APA",
  });

  /*
   * Load initial data when editing an existing citation.
   */
  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      return;
    }

    setFormData({
      publication_id: initialData.publication_id || "",
      title: initialData.title || "",
      authors: initialData.authors || "",
      journal: initialData.journal || "",
      year: initialData.year || "",
      volume: initialData.volume || "",
      issue: initialData.issue || "",
      pages: initialData.pages || "",
      doi: initialData.doi || "",
      url: initialData.url || "",
      citation_style:
        initialData.citation_style || "APA",
    });
  }, [initialData]);

  /*
   * Handle normal input changes.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Automatically populate citation fields
   * from the selected publication.
   */
  const handlePublicationChange = (e) => {
    const publicationId = e.target.value;

    const selectedPublication = publications.find(
      (publication) =>
        String(publication.id) === String(publicationId)
    );

    if (!selectedPublication) {
      setFormData((previous) => ({
        ...previous,
        publication_id: "",
        title: "",
        journal: "",
        year: "",
        doi: "",
        url: "",
      }));

      return;
    }

    console.log(
      "Selected publication:",
      selectedPublication
    );

    setFormData((previous) => ({
      ...previous,

      publication_id: selectedPublication.id,

      // Automatically populated
      title: selectedPublication.title || "",

      journal: selectedPublication.journal || "",

      year:
        selectedPublication.publication_year ||
        selectedPublication.year ||
        "",

      doi: selectedPublication.doi || "",

      url: selectedPublication.url || "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <div
      className="card border-0 shadow-lg overflow-hidden"
      style={{
        borderRadius: "18px",
      }}
    >

      {/* Card Header */}
      <div
        className="p-4 p-md-5 text-white"
        style={{
          background:
            "linear-gradient(135deg, #1677ff 0%, #0875df 100%)",
        }}
      >

        <div className="d-flex align-items-center gap-3">

          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.18)",
              fontSize: "26px",
            }}
          >
            🔗
          </div>

          <div>
            <h3
              className="mb-1 fw-bold"
              style={{
                fontSize: "1.45rem",
              }}
            >
              Citation Information
            </h3>

            <p className="mb-0">
              Select a publication and enter the citation
              details.
            </p>
          </div>

        </div>

      </div>

      {/* Card Body */}
      <div className="card-body p-4 p-md-5">

        <form onSubmit={handleSubmit}>

          {/* Publication */}
          <div className="mb-4">

            <label
              className="form-label fw-semibold"
              htmlFor="publication_id"
            >
              Publication
            </label>

            <select
              id="publication_id"
              className="form-select form-select-lg"
              name="publication_id"
              value={formData.publication_id}
              onChange={handlePublicationChange}
              required
            >
              <option value="">
                Select Publication
              </option>

              {publications.map((publication) => (
                <option
                  key={publication.id}
                  value={publication.id}
                >
                  {publication.title}
                </option>
              ))}
            </select>

            <div className="form-text">
              Selecting a publication will automatically
              fill its title, journal, year, DOI and URL.
            </div>

          </div>

          {/* Publication Information */}
          {formData.publication_id && (
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: "#f6f9ff",
                borderRadius: "14px",
                border: "1px solid #e2ebf8",
              }}
            >

              <div className="d-flex align-items-center gap-3 mb-4">

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: "#e9f1ff",
                    fontSize: "20px",
                  }}
                >
                  📄
                </div>

                <div>
                  <h5
                    className="mb-1 fw-bold"
                    style={{ color: "#17233c" }}
                  >
                    Publication Information
                  </h5>

                  <small className="text-muted">
                    Automatically retrieved from the
                    selected publication.
                  </small>
                </div>

              </div>

              {/* Title */}
              <div className="mb-3">

                <label
                  className="form-label fw-semibold"
                  htmlFor="title"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="row">

                {/* Journal */}
                <div className="col-md-8 mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="journal"
                  >
                    Journal
                  </label>

                  <input
                    id="journal"
                    type="text"
                    className="form-control"
                    name="journal"
                    value={formData.journal}
                    onChange={handleChange}
                    placeholder="Enter journal name"
                  />

                </div>

                {/* Year */}
                <div className="col-md-4 mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="year"
                  >
                    Year
                  </label>

                  <input
                    id="year"
                    type="number"
                    className="form-control"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <div className="row">

                {/* DOI */}
                <div className="col-md-6 mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="doi"
                  >
                    DOI
                  </label>

                  <input
                    id="doi"
                    type="text"
                    className="form-control"
                    name="doi"
                    value={formData.doi}
                    onChange={handleChange}
                    placeholder="10.xxxx/xxxxx"
                  />

                </div>

                {/* URL */}
                <div className="col-md-6 mb-3">

                  <label
                    className="form-label fw-semibold"
                    htmlFor="url"
                  >
                    URL
                  </label>

                  <input
                    id="url"
                    type="url"
                    className="form-control"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />

                </div>

              </div>

            </div>
          )}

          {/* Citation Details */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "14px",
            }}
          >

            <h5
              className="fw-bold mb-4"
              style={{ color: "#17233c" }}
            >
              Citation Details
            </h5>

            {/* Authors */}
            <div className="mb-3">

              <label
                className="form-label fw-semibold"
                htmlFor="authors"
              >
                Authors
              </label>

              <input
                id="authors"
                type="text"
                className="form-control"
                name="authors"
                value={formData.authors}
                onChange={handleChange}
                placeholder="John Doe, Jane Smith"
                required
              />

              <div className="form-text">
                Separate multiple authors using commas.
              </div>

            </div>

            <div className="row">

              {/* Volume */}
              <div className="col-md-4 mb-3">

                <label
                  className="form-label fw-semibold"
                  htmlFor="volume"
                >
                  Volume
                </label>

                <input
                  id="volume"
                  type="text"
                  className="form-control"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                />

              </div>

              {/* Issue */}
              <div className="col-md-4 mb-3">

                <label
                  className="form-label fw-semibold"
                  htmlFor="issue"
                >
                  Issue
                </label>

                <input
                  id="issue"
                  type="text"
                  className="form-control"
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                />

              </div>

              {/* Pages */}
              <div className="col-md-4 mb-3">

                <label
                  className="form-label fw-semibold"
                  htmlFor="pages"
                >
                  Pages
                </label>

                <input
                  id="pages"
                  type="text"
                  className="form-control"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  placeholder="e.g. 120-135"
                />

              </div>

            </div>

            {/* Citation Style */}
            <div className="col-md-6 mb-2">

              <label
                className="form-label fw-semibold"
                htmlFor="citation_style"
              >
                Citation Style
              </label>

              <select
                id="citation_style"
                className="form-select"
                name="citation_style"
                value={formData.citation_style}
                onChange={handleChange}
              >
                <option value="APA">
                  APA
                </option>

                <option value="IEEE">
                  IEEE
                </option>

                <option value="MLA">
                  MLA
                </option>

                <option value="Chicago">
                  Chicago
                </option>

                <option value="Harvard">
                  Harvard
                </option>
              </select>

            </div>

          </div>

          {/* Submit */}
          <div
            className="d-flex justify-content-end gap-3 pt-2"
          >

            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-success px-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>

                  Saving...
                </>
              ) : (
                "Save Citation"
              )}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CitationForm;