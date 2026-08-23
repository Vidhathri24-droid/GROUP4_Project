import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCitations,
  deleteCitation,
} from "../../services/citationService";

function Citations() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [citations, setCitations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & filters
  const [search, setSearch] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;


  // ============================================================
  // LOAD CITATIONS
  // ============================================================

  const fetchCitations = async () => {
    try {
      setLoading(true);
      setError("");

      const mine = ownershipFilter === "mine";

      const data = await getCitations(mine);

      console.log("Citations loaded:", data);

      if (Array.isArray(data)) {
        setCitations(data);
      } else if (Array.isArray(data?.items)) {
        setCitations(data.items);
      } else {
        setCitations([]);
      }

    } catch (err) {
      console.error("Failed to load citations:", err);

      setError(
        err?.response?.data?.detail ||
        "Failed to load citations."
      );

      setCitations([]);
    } finally {
      setLoading(false);
    }
  };


  // Reload whenever ownership changes
  useEffect(() => {
    fetchCitations();
    setCurrentPage(1);
  }, [ownershipFilter]);


  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    fetchCitations();
    setCurrentPage(1);
  };


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (citationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this citation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCitation(citationId);

      alert("Citation deleted successfully.");

      await fetchCitations();

    } catch (err) {
      console.error("Delete citation error:", err);

      alert(
        err?.response?.data?.detail ||
        "Failed to delete citation."
      );
    }
  };


  // ============================================================
  // BIBTEX GENERATOR
  // ============================================================

  const generateBibTeX = (citation) => {
    const authors = citation.authors || "Unknown Author";

    const firstAuthor =
      authors
        .split(",")[0]
        ?.trim()
        ?.replace(/\s+/g, "_")
        ?.replace(/[^a-zA-Z0-9_-]/g, "") ||
      "citation";

    const year =
      citation.year ||
      new Date().getFullYear();

    const title =
      citation.title ||
      "Untitled Publication";

    const key = `${firstAuthor}${year}`;

    const escapeBibtex = (value) => {
      if (!value) return "";

      return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/[{}]/g, "")
        .replace(/&/g, "\\&");
    };

    let bibtex = `@article{${key},
  title = {${escapeBibtex(title)}},
  author = {${escapeBibtex(authors)}},
  year = {${year}}`;

    if (citation.journal) {
      bibtex += `,
  journal = {${escapeBibtex(citation.journal)}}`;
    }

    if (citation.volume) {
      bibtex += `,
  volume = {${escapeBibtex(citation.volume)}}`;
    }

    if (citation.issue) {
      bibtex += `,
  number = {${escapeBibtex(citation.issue)}}`;
    }

    if (citation.pages) {
      bibtex += `,
  pages = {${escapeBibtex(citation.pages)}}`;
    }

    if (citation.doi) {
      bibtex += `,
  doi = {${escapeBibtex(citation.doi)}}`;
    }

    if (citation.url) {
      bibtex += `,
  url = {${escapeBibtex(citation.url)}}`;
    }

    bibtex += "\n}";

    return bibtex;
  };


  const handleBibTeX = (citation) => {
    try {
      const bibtex = generateBibTeX(citation);

      const blob = new Blob(
        [bibtex],
        {
          type: "application/x-bibtex",
        }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        `${(citation.title || "citation")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}.bib`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("BibTeX export error:", err);

      alert("Unable to export BibTeX.");
    }
  };


  // ============================================================
  // SEARCH + FILTER + SORT
  // ============================================================

  const filteredCitations = useMemo(() => {
    let result = [...citations];

    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    const searchValue = search
      .trim()
      .toLowerCase();

    if (searchValue) {
      result = result.filter((citation) => {

        const searchableText = [
          citation.title,
          citation.authors,
          citation.journal,
          citation.doi,
          citation.url,
          citation.citation_style,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchValue);
      });
    }


    // ----------------------------------------------------------
    // Citation Style
    // ----------------------------------------------------------

    if (styleFilter) {
      result = result.filter(
        (citation) =>
          String(
            citation.citation_style || ""
          ).toUpperCase() ===
          styleFilter.toUpperCase()
      );
    }


    // ----------------------------------------------------------
    // Year
    // ----------------------------------------------------------

    if (yearFilter) {
      result = result.filter(
        (citation) =>
          String(citation.year || "") ===
          String(yearFilter)
      );
    }


    // ----------------------------------------------------------
    // Sorting
    // ----------------------------------------------------------

    result.sort((a, b) => {

      if (sortBy === "newest") {
        return (
          Number(b.year || 0) -
          Number(a.year || 0)
        );
      }

      if (sortBy === "oldest") {
        return (
          Number(a.year || 0) -
          Number(b.year || 0)
        );
      }

      if (sortBy === "title_asc") {
        return String(
          a.title || ""
        ).localeCompare(
          String(b.title || "")
        );
      }

      if (sortBy === "title_desc") {
        return String(
          b.title || ""
        ).localeCompare(
          String(a.title || "")
        );
      }

      return 0;
    });

    return result;

  }, [
    citations,
    search,
    styleFilter,
    yearFilter,
    sortBy,
  ]);


  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.ceil(
    filteredCitations.length /
      ITEMS_PER_PAGE
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      Math.max(totalPages, 1)
    );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedCitations =
    filteredCitations.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );


  // ============================================================
  // RESET FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setOwnershipFilter("all");
    setStyleFilter("");
    setYearFilter("");
    setSortBy("newest");
    setCurrentPage(1);
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="container py-5">

        <div className="text-center py-5">

          <div
            className="spinner-border text-primary"
            role="status"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          >
          </div>

          <p className="text-muted mt-3">
            Loading citations...
          </p>

        </div>

      </div>
    );
  }


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      className="citations-page"
      style={{
        minHeight: "100vh",
        background: "#f5f8fc",
      }}
    >

      <div className="container py-5">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">

          <div>

            <div
              className="text-primary fw-bold mb-2"
              style={{
                fontSize: "14px",
                letterSpacing: "0.5px",
              }}
            >
              📚 RESEARCH NETWORK
            </div>

            <h1
              className="fw-bold mb-2"
              style={{
                color: "#18243d",
                fontSize: "36px",
              }}
            >
              Citation Management
            </h1>

            <p
              className="text-muted mb-0"
              style={{
                fontSize: "16px",
              }}
            >
              Manage, organize and export publication citations.
            </p>

          </div>


          <div className="d-flex gap-2">

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleRefresh}
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/citations/add")
              }
            >
              + Add Citation
            </button>

          </div>

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div
            className="alert alert-danger d-flex justify-content-between align-items-center"
            role="alert"
          >

            <span>
              {error}
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleRefresh}
            >
              Retry
            </button>

          </div>

        )}


        {/* ======================================================
            SEARCH & FILTER
        ====================================================== */}

        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "16px",
          }}
        >

          <div className="card-body p-4">

            <h5
              className="fw-bold mb-1"
              style={{
                color: "#18243d",
              }}
            >
              Search & Filter
            </h5>

            <p className="text-muted mb-4">
              Find citations using title, author, journal,
              DOI or citation style.
            </p>


            <div className="row g-3">

              {/* Search */}

              <div className="col-xl-4 col-lg-4 col-md-6">

                <label className="form-label fw-semibold">
                  Search
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="🔎 Search title, authors, journal, DOI..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />

              </div>


              {/* Ownership */}

              <div className="col-xl-2 col-lg-2 col-md-6">

                <label className="form-label fw-semibold">
                  Ownership
                </label>

                <select
                  className="form-select"
                  value={ownershipFilter}
                  onChange={(e) => {
                    setOwnershipFilter(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                >

                  <option value="all">
                    All Citations
                  </option>

                  <option value="mine">
                    My Citations
                  </option>

                </select>

              </div>


              {/* Citation Style */}

              <div className="col-xl-2 col-lg-2 col-md-6">

                <label className="form-label fw-semibold">
                  Citation Style
                </label>

                <select
                  className="form-select"
                  value={styleFilter}
                  onChange={(e) => {
                    setStyleFilter(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                >

                  <option value="">
                    All styles
                  </option>

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


              {/* Year */}

              <div className="col-xl-2 col-lg-2 col-md-6">

                <label className="form-label fw-semibold">
                  Year
                </label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 2026"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                />

              </div>


              {/* Sort */}

              <div className="col-xl-2 col-lg-2 col-md-6">

                <label className="form-label fw-semibold">
                  Sort By
                </label>

                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >

                  <option value="newest">
                    Newest first
                  </option>

                  <option value="oldest">
                    Oldest first
                  </option>

                  <option value="title_asc">
                    Title A–Z
                  </option>

                  <option value="title_desc">
                    Title Z–A
                  </option>

                </select>

              </div>

            </div>


            {/* Active filter / clear */}

            {(search ||
              ownershipFilter !== "all" ||
              styleFilter ||
              yearFilter) && (

              <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">

                <span className="text-muted small">
                  Active filters:
                </span>

                {ownershipFilter === "mine" && (
                  <span className="badge bg-primary">
                    My Citations
                  </span>
                )}

                {styleFilter && (
                  <span className="badge bg-primary">
                    {styleFilter}
                  </span>
                )}

                {yearFilter && (
                  <span className="badge bg-primary">
                    Year: {yearFilter}
                  </span>
                )}

                {search && (
                  <span className="badge bg-primary">
                    Search: {search}
                  </span>
                )}

                <button
                  type="button"
                  className="btn btn-sm btn-link text-danger"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>

              </div>

            )}

          </div>

        </div>


        {/* ======================================================
            RESULT SUMMARY
        ====================================================== */}

        <div className="d-flex justify-content-between align-items-center mb-3">

          <div>

            <span
              className="fw-bold"
              style={{
                color: "#18243d",
                fontSize: "18px",
              }}
            >
              {filteredCitations.length}
            </span>

            <span className="text-muted ms-1">
              {filteredCitations.length === 1
                ? "citation"
                : "citations"}
            </span>

          </div>


          {filteredCitations.length > 0 && (

            <div className="text-muted small">

              Showing{" "}
              <strong>
                {startIndex + 1}
              </strong>
              {" – "}
              <strong>
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredCitations.length
                )}
              </strong>
              {" of "}
              <strong>
                {filteredCitations.length}
              </strong>

            </div>

          )}

        </div>


        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {filteredCitations.length === 0 ? (

          <div
            className="card border-0 shadow-sm text-center"
            style={{
              borderRadius: "16px",
            }}
          >

            <div className="card-body py-5">

              <div
                style={{
                  fontSize: "48px",
                }}
              >
                🔗
              </div>

              <h4
                className="fw-bold mt-3"
                style={{
                  color: "#18243d",
                }}
              >
                No citations found
              </h4>

              <p className="text-muted">
                {search ||
                styleFilter ||
                yearFilter ||
                ownershipFilter === "mine"
                  ? "Try changing your filters or search terms."
                  : "There are no citations available yet."}
              </p>

              {(search ||
                styleFilter ||
                yearFilter ||
                ownershipFilter === "mine") && (

                <button
                  className="btn btn-outline-primary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              )}

            </div>

          </div>

        ) : (

          <>
            {/* ==================================================
                CITATION CARDS
            ================================================== */}

            <div className="row g-4">

              {paginatedCitations.map(
                (citation) => (

                  <div
                    className="col-xl-4 col-lg-6"
                    key={citation.id}
                  >

                    <div
                      className="card h-100 border-0 shadow-sm"
                      style={{
                        borderRadius: "16px",
                      }}
                    >

                      <div className="card-body p-4 d-flex flex-column">

                        {/* Year + Style */}

                        <div className="d-flex justify-content-between align-items-center mb-3">

                          <span
                            className="small fw-semibold text-muted"
                          >
                            {citation.year || "—"}
                          </span>

                          {citation.citation_style && (

                            <span
                              className="badge rounded-pill"
                              style={{
                                background:
                                  "#e8f1ff",
                                color:
                                  "#1769e0",
                                padding:
                                  "7px 11px",
                              }}
                            >
                              {citation.citation_style}
                            </span>

                          )}

                        </div>


                        {/* Title */}

                        <h5
                          className="fw-bold mb-4"
                          style={{
                            color: "#1769e0",
                            lineHeight: "1.35",
                            minHeight: "50px",
                          }}
                        >
                          {citation.title ||
                            "Untitled Citation"}
                        </h5>


                        {/* Authors */}

                        <div className="mb-3">

                          <div
                            className="fw-semibold small mb-1"
                          >
                            Authors
                          </div>

                          <div className="text-muted small">
                            {citation.authors ||
                              "Not specified"}
                          </div>

                        </div>


                        {/* Journal */}

                        <div className="mb-3">

                          <div
                            className="fw-semibold small mb-1"
                          >
                            Journal
                          </div>

                          <div className="text-muted small">
                            {citation.journal ||
                              "Not specified"}
                          </div>

                        </div>


                        {/* Year */}

                        <div className="mb-3">

                          <div
                            className="fw-semibold small mb-1"
                          >
                            Year
                          </div>

                          <div className="text-muted small">
                            {citation.year ||
                              "Not specified"}
                          </div>

                        </div>


                        {/* DOI */}

                        <div className="mb-3">

                          <div
                            className="fw-semibold small mb-1"
                          >
                            DOI
                          </div>

                          {citation.doi ? (

                            <a
                              href={
                                citation.doi.startsWith(
                                  "http"
                                )
                                  ? citation.doi
                                  : `https://doi.org/${citation.doi}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="small text-decoration-none"
                              style={{
                                color: "#1769e0",
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {citation.doi}
                            </a>

                          ) : (

                            <span className="text-muted small">
                              Not specified
                            </span>

                          )}

                        </div>


                        {/* Spacer */}

                        <div className="mt-auto">

                          <hr />


                          {/* Actions */}

                          <div className="d-flex gap-2 flex-wrap">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                navigate(
                                  `/citations/${citation.id}`
                                )
                              }
                            >
                              View
                            </button>


                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning"
                              onClick={() =>
                                navigate(
                                  `/citations/${citation.id}/edit`
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDelete(
                                  citation.id
                                )
                              }
                            >
                              Delete
                            </button>


                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                handleBibTeX(
                                  citation
                                )
                              }
                            >
                              BibTeX
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* ==================================================
                PAGINATION
            ================================================== */}

            {totalPages > 1 && (

              <div className="d-flex justify-content-center mt-5">

                <nav>

                  <ul className="pagination">

                    <li
                      className={`page-item ${
                        safeCurrentPage === 1
                          ? "disabled"
                          : ""
                      }`}
                    >

                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.max(
                                page - 1,
                                1
                              )
                          )
                        }
                        disabled={
                          safeCurrentPage === 1
                        }
                      >
                        Previous
                      </button>

                    </li>


                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) => index + 1
                    ).map((page) => (

                      <li
                        key={page}
                        className={`page-item ${
                          safeCurrentPage === page
                            ? "active"
                            : ""
                        }`}
                      >

                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage(page)
                          }
                        >
                          {page}
                        </button>

                      </li>

                    ))}


                    <li
                      className={`page-item ${
                        safeCurrentPage ===
                        totalPages
                          ? "disabled"
                          : ""
                      }`}
                    >

                      <button
                        className="page-link"
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.min(
                                page + 1,
                                totalPages
                              )
                          )
                        }
                        disabled={
                          safeCurrentPage ===
                          totalPages
                        }
                      >
                        Next
                      </button>

                    </li>

                  </ul>

                </nav>

              </div>

            )}

          </>

        )}

      </div>

    </div>
  );
}

export default Citations;