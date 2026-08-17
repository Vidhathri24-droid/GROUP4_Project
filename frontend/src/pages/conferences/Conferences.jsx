import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ConferenceCard from "../../components/conferences/ConferenceCard";

import {
  isSystemAdmin,
  isInstitutionAdmin,
} from "../../utils/auth";

import {
  getConferences,
  getJoinedConferences,
  getUpcomingConferences,
  getPastConferences,
  deleteConference,
} from "../../services/conferenceService";

import "./Conferences.css";

function Conferences() {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const canManage =
    isSystemAdmin() || isInstitutionAdmin();

  /*
  |--------------------------------------------------------------------------
  | Fetch Conferences
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchConferences();
  }, [filter]);

  const fetchConferences = async () => {
    try {
      setLoading(true);

      let data = [];

      if (filter === "registered") {
        data = await getJoinedConferences();
      } else if (filter === "upcoming") {
        data = await getUpcomingConferences();
      } else if (filter === "past") {
        data = await getPastConferences();
      } else {
        data = await getConferences();
      }

      setConferences(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      alert("Unable to load conferences.");
      setConferences([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Conference
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conference?")) {
      return;
    }

    try {
      await deleteConference(id);
      await fetchConferences();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Failed to delete conference.");
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Search + Sorting
  |--------------------------------------------------------------------------
  */

  const processedConferences = useMemo(() => {
    let results = [...conferences];

    const query = search.trim().toLowerCase();

    /*
     * Search by:
     * - title
     * - venue
     * - description
     * - location
     */

    if (query) {
      results = results.filter((conference) => {
        const searchableText = [
          conference.title,
          conference.venue,
          conference.description,
          conference.location,
          conference.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    /*
     * Sorting
     */

    results.sort((a, b) => {
      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }

      if (sortBy === "title-desc") {
        return (b.title || "").localeCompare(a.title || "");
      }

      if (sortBy === "date-desc") {
        return (
          new Date(b.date || b.start_date || 0) -
          new Date(a.date || a.start_date || 0)
        );
      }

      // Default: oldest/upcoming first
      return (
        new Date(a.date || a.start_date || 0) -
        new Date(b.date || b.start_date || 0)
      );
    });

    return results;
  }, [conferences, search, sortBy]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.ceil(
    processedConferences.length / itemsPerPage
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentConferences = processedConferences.slice(
    indexOfFirst,
    indexOfLast
  );

  /*
  |--------------------------------------------------------------------------
  | Keep page valid when filtering
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, itemsPerPage]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const getDateValue = (conference) => {
    return conference.date || conference.start_date || null;
  };

  const formatDate = (conference) => {
    const value = getDateValue(conference);

    if (!value) {
      return "Date not specified";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSortBy("date-asc");
    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination Buttons
  |--------------------------------------------------------------------------
  */

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="conference-pagination">
        <button
          type="button"
          className="conference-page-btn"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((page) => Math.max(page - 1, 1))
          }
        >
          ← Previous
        </button>

        <div className="conference-page-numbers">
          {pages.map((page) => (
            <button
              type="button"
              key={page}
              className={`conference-page-number ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="conference-page-btn"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(page + 1, totalPages)
            )
          }
        >
          Next →
        </button>
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="conference-page">

      <div className="conference-container">

        {/* ================================================================
            HEADER
        ================================================================ */}

        <div className="conference-header">

          <div>
            <div className="conference-eyebrow">
              RESEARCH NETWORK
            </div>

            <h1>Conference Management</h1>

            <p>
              Discover academic conferences, research events
              and collaboration opportunities.
            </p>
          </div>

          {canManage && (
            <Link
              to="/conferences/create"
              className="conference-add-btn"
            >
              <span>+</span>
              Add Conference
            </Link>
          )}

        </div>

        {/* ================================================================
            STATS
        ================================================================ */}

        {!loading && (
          <div className="conference-stats">

            <div className="conference-stat-card">
              <div className="conference-stat-icon blue">
                ◫
              </div>

              <div>
                <strong>{conferences.length}</strong>
                <span>Total Conferences</span>
              </div>
            </div>

            <div className="conference-stat-card">
              <div className="conference-stat-icon green">
                ✓
              </div>

              <div>
                <strong>
                  {
                    conferences.filter((conference) => {
                      const date = new Date(
                        getDateValue(conference)
                      );

                      return (
                        !Number.isNaN(date.getTime()) &&
                        date >= new Date()
                      );
                    }).length
                  }
                </strong>

                <span>Upcoming Events</span>
              </div>
            </div>

            <div className="conference-stat-card">
              <div className="conference-stat-icon purple">
                ◉
              </div>

              <div>
                <strong>
                  {processedConferences.length}
                </strong>

                <span>Matching Results</span>
              </div>
            </div>

          </div>
        )}

        {/* ================================================================
            FILTER PANEL
        ================================================================ */}

        <div className="conference-filter-panel">

          <div className="conference-filter-header">

            <div>
              <h3>Search & Filter</h3>

              <p>
                Find conferences quickly using the available
                filters.
              </p>
            </div>

            {(search ||
              filter !== "all" ||
              sortBy !== "date-asc") && (
              <button
                type="button"
                className="conference-clear-btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}

          </div>

          <div className="conference-filter-grid">

            {/* Search */}

            <div className="conference-field search-field">

              <label htmlFor="conference-search">
                Search
              </label>

              <div className="conference-search-wrapper">

                <span className="conference-search-icon">
                  ⌕
                </span>

                <input
                  id="conference-search"
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by title, venue or location..."
                />

                {search && (
                  <button
                    type="button"
                    className="conference-search-clear"
                    onClick={() => setSearch("")}
                  >
                    ×
                  </button>
                )}

              </div>

            </div>

            {/* Conference Status */}

            <div className="conference-field">

              <label htmlFor="conference-filter">
                Conference Status
              </label>

              <select
                id="conference-filter"
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="all">
                  All Conferences
                </option>

                <option value="upcoming">
                  Upcoming Conferences
                </option>

                <option value="registered">
                  Registered Conferences
                </option>

                <option value="past">
                  Past Conferences
                </option>
              </select>

            </div>

            {/* Sort */}

            <div className="conference-field">

              <label htmlFor="conference-sort">
                Sort By
              </label>

              <select
                id="conference-sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="date-asc">
                  Date: Earliest first
                </option>

                <option value="date-desc">
                  Date: Latest first
                </option>

                <option value="title-asc">
                  Title: A → Z
                </option>

                <option value="title-desc">
                  Title: Z → A
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* ================================================================
            RESULTS HEADER
        ================================================================ */}

        {!loading && (
          <div className="conference-results-header">

            <div>
              <h2>
                Conferences
                <span>{processedConferences.length}</span>
              </h2>

              <p>
                {processedConferences.length === 0
                  ? "No matching conferences"
                  : `Showing ${indexOfFirst + 1}–${Math.min(
                      indexOfLast,
                      processedConferences.length
                    )} of ${
                      processedConferences.length
                    } conferences`}
              </p>
            </div>

            <div className="conference-per-page">

              <label htmlFor="conference-per-page">
                Show
              </label>

              <select
                id="conference-per-page"
                value={itemsPerPage}
                onChange={(e) =>
                  setItemsPerPage(
                    Number(e.target.value)
                  )
                }
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>

              <span>per page</span>

            </div>

          </div>
        )}

        {/* ================================================================
            CONTENT
        ================================================================ */}

        {loading ? (

          <div className="conference-loading">

            <div className="conference-spinner" />

            <h3>Loading conferences...</h3>

            <p>
              Preparing the latest research events.
            </p>

          </div>

        ) : currentConferences.length === 0 ? (

          <div className="conference-empty">

            <div className="conference-empty-icon">
              ◫
            </div>

            <h3>No conferences found</h3>

            <p>
              We couldn't find any conferences matching
              your current search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="conference-reset-btn"
            >
              Reset filters
            </button>

          </div>

        ) : (

          <>

            {/* ============================================================
                CONFERENCE GRID
            ============================================================ */}

            <div className="conference-grid">

              {currentConferences.map((conference) => (

                <div
                  key={conference.id}
                  className="conference-card-wrapper"
                >

                  <ConferenceCard
                    conference={conference}
                    onDelete={handleDelete}
                    refreshConferences={fetchConferences}
                  />

                </div>

              ))}

            </div>

            {/* ============================================================
                PAGINATION
            ============================================================ */}

            {renderPagination()}

          </>

        )}

      </div>

    </div>
  );
}

export default Conferences;