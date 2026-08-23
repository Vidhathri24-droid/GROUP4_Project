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
  deleteConference,
} from "../../services/conferenceService";

import "./Conferences.css";


function Conferences() {
  /* =========================================================
     STATE
     ========================================================= */

  const [allConferences, setAllConferences] = useState([]);
  const [registeredConferences, setRegisteredConferences] = useState([]);

  const [loading, setLoading] = useState(true);
  const [registeredLoading, setRegisteredLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [error, setError] = useState("");

  const canManage =
    isSystemAdmin() || isInstitutionAdmin();


  /* =========================================================
     DATE HELPERS
     ========================================================= */

  /*
   * Different backend/frontend versions may use different
   * names for the conference date.
   *
   * Support all commonly used names here.
   */
  const getDateValue = (conference) => {
    if (!conference) {
      return null;
    }

    return (
      conference.date ??
      conference.start_date ??
      conference.startDate ??
      conference.conference_date ??
      conference.conferenceDate ??
      conference.event_date ??
      conference.eventDate ??
      conference.start_datetime ??
      conference.startDateTime ??
      conference.event_datetime ??
      conference.eventDateTime ??
      null
    );
  };


  /*
   * Safely parse a conference date.
   *
   * IMPORTANT:
   * A value such as "2026-09-12" is a DATE ONLY value.
   * We create it using local year/month/day so timezone
   * conversion cannot move it to the previous day.
   */
  const parseConferenceDate = (conference) => {
    const value = getDateValue(conference);

    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime())
        ? null
        : value;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return null;
      }

      /*
       * YYYY-MM-DD
       */
      const dateOnlyMatch =
        trimmed.match(
          /^(\d{4})-(\d{2})-(\d{2})$/
        );

      if (dateOnlyMatch) {
        const year = Number(dateOnlyMatch[1]);
        const month = Number(dateOnlyMatch[2]);
        const day = Number(dateOnlyMatch[3]);

        const date = new Date(
          year,
          month - 1,
          day
        );

        /*
         * Validate that JavaScript did not roll the
         * invalid date into another month.
         */
        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return null;
        }

        return date;
      }

      /*
       * ISO datetime or other valid date string.
       */
      const parsed = new Date(trimmed);

      return Number.isNaN(parsed.getTime())
        ? null
        : parsed;
    }

    /*
     * Numeric timestamps or other Date-compatible values.
     */
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? null
      : parsed;
  };


  /*
   * Get a calendar-day-only timestamp.
   *
   * This makes:
   *   today      -> upcoming
   *   tomorrow   -> upcoming
   *   yesterday  -> past
   */
  const getDayTimestamp = (date) => {
    if (!date) {
      return null;
    }

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
  };


  const getTodayTimestamp = () => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
  };


  /*
   * A conference is upcoming if its conference date is
   * today or later.
   */
  const isUpcoming = (conference) => {
    const date = parseConferenceDate(conference);

    if (!date) {
      return false;
    }

    const conferenceDay =
      getDayTimestamp(date);

    const today =
      getTodayTimestamp();

    return conferenceDay >= today;
  };


  /*
   * A conference is past if its conference date is
   * before today.
   */
  const isPast = (conference) => {
    const date = parseConferenceDate(conference);

    if (!date) {
      return false;
    }

    const conferenceDay =
      getDayTimestamp(date);

    const today =
      getTodayTimestamp();

    return conferenceDay < today;
  };


  const formatDate = (conference) => {
    const date = parseConferenceDate(conference);

    if (!date) {
      return "Date not specified";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* =========================================================
     NORMALIZE API RESPONSE
     ========================================================= */

  const normalizeConferenceResponse = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.conferences)) {
      return data.conferences;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };


  /* =========================================================
     FETCH ALL CONFERENCES
     ========================================================= */

  const fetchAllConferences = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getConferences();

      const normalized =
        normalizeConferenceResponse(response);

      console.log(
        "Conferences loaded:",
        normalized
      );

      /*
       * IMPORTANT:
       *
       * Keep the complete backend result here.
       *
       * Statistics such as Total / Upcoming / Past
       * are calculated from this list.
       */
      setAllConferences(normalized);

      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Unable to load conferences:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        "Unable to load conferences."
      );

      setAllConferences([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAllConferences();
  }, []);


  /* =========================================================
     FETCH REGISTERED CONFERENCES
     ========================================================= */

  const fetchRegisteredConferences = async () => {
    try {
      setRegisteredLoading(true);

      const response =
        await getJoinedConferences();

      const normalized =
        normalizeConferenceResponse(response);

      setRegisteredConferences(normalized);
    } catch (err) {
      console.error(
        "Unable to load registered conferences:",
        err
      );

      setRegisteredConferences([]);
    } finally {
      setRegisteredLoading(false);
    }
  };


  /*
   * Only fetch registered conferences when that filter
   * is actually selected.
   */
  useEffect(() => {
    if (filter === "registered") {
      fetchRegisteredConferences();
    }
  }, [filter]);


  /* =========================================================
     FILTER BASE DATA
     ========================================================= */

  const conferences = useMemo(() => {
    if (filter === "registered") {
      return registeredConferences;
    }

    if (filter === "upcoming") {
      return allConferences.filter(
        (conference) =>
          isUpcoming(conference)
      );
    }

    if (filter === "past") {
      return allConferences.filter(
        (conference) =>
          isPast(conference)
      );
    }

    return allConferences;
  }, [
    filter,
    allConferences,
    registeredConferences,
  ]);


  /* =========================================================
     DELETE CONFERENCE
     ========================================================= */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this conference?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteConference(id);

      /*
       * Immediately remove it from all lists.
       */
      setAllConferences((previous) =>
        previous.filter(
          (conference) =>
            conference.id !== id
        )
      );

      setRegisteredConferences(
        (previous) =>
          previous.filter(
            (conference) =>
              conference.id !== id
          )
      );

    } catch (err) {
      console.error(
        "Unable to delete conference:",
        err
      );

      alert(
        err?.response?.data?.detail ||
        "Failed to delete conference."
      );
    }
  };


  /* =========================================================
     SEARCH + SORTING
     ========================================================= */

  const processedConferences =
    useMemo(() => {
      let results = [...conferences];

      const query =
        search.trim().toLowerCase();


      /*
       * SEARCH
       */
      if (query) {
        results =
          results.filter(
            (conference) => {
              const searchableText = [
                conference?.title,
                conference?.venue,
                conference?.description,
                conference?.location,
                conference?.address,
                conference?.organizer,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return searchableText.includes(
                query
              );
            }
          );
      }


      /*
       * SORT
       */
      results.sort((a, b) => {
        if (sortBy === "title-asc") {
          return (
            (a?.title || "").localeCompare(
              b?.title || ""
            )
          );
        }

        if (sortBy === "title-desc") {
          return (
            (b?.title || "").localeCompare(
              a?.title || ""
            )
          );
        }

        const dateA =
          parseConferenceDate(a);

        const dateB =
          parseConferenceDate(b);

        const timestampA =
          dateA
            ? dateA.getTime()
            : Number.MAX_SAFE_INTEGER;

        const timestampB =
          dateB
            ? dateB.getTime()
            : Number.MAX_SAFE_INTEGER;


        if (sortBy === "date-desc") {
          return (
            timestampB - timestampA
          );
        }

        /*
         * Default:
         * earliest date first.
         */
        return (
          timestampA - timestampB
        );
      });

      return results;
    }, [
      conferences,
      search,
      sortBy,
    ]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  /*
   * IMPORTANT:
   *
   * These are ALWAYS calculated from allConferences.
   *
   * They must NOT use the currently filtered list.
   */

  const totalConferences =
    allConferences.length;


  const upcomingCount =
    allConferences.filter(
      (conference) =>
        isUpcoming(conference)
    ).length;


  const pastCount =
    allConferences.filter(
      (conference) =>
        isPast(conference)
    ).length;


  /* =========================================================
     PAGINATION
     ========================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        processedConferences.length /
        itemsPerPage
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const indexOfFirst =
    (safeCurrentPage - 1) *
    itemsPerPage;


  const indexOfLast =
    indexOfFirst +
    itemsPerPage;


  const currentConferences =
    processedConferences.slice(
      indexOfFirst,
      indexOfLast
    );


  /* =========================================================
     RESET PAGE WHEN FILTERS CHANGE
     ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    filter,
    sortBy,
    itemsPerPage,
  ]);


  useEffect(() => {
    if (
      currentPage > totalPages &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);


  /* =========================================================
     CLEAR FILTERS
     ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setSortBy("date-asc");
    setCurrentPage(1);
  };


  /* =========================================================
     PAGINATION UI
     ========================================================= */

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      pages.push(i);
    }

    return (
      <div className="conference-pagination">

        <button
          type="button"
          className="conference-page-btn"
          disabled={
            safeCurrentPage === 1
          }
          onClick={() =>
            setCurrentPage(
              (page) =>
                Math.max(
                  page - 1,
                  1
                )
            )
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
                safeCurrentPage === page
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setCurrentPage(page)
              }
            >
              {page}
            </button>
          ))}
        </div>


        <button
          type="button"
          className="conference-page-btn"
          disabled={
            safeCurrentPage ===
            totalPages
          }
          onClick={() =>
            setCurrentPage(
              (page) =>
                Math.min(
                  page + 1,
                  totalPages
                )
            )
          }
        >
          Next →
        </button>

      </div>
    );
  };


  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="conference-page">

      <div className="conference-container">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="conference-header">

          <div className="conference-header-content">

            <div className="conference-eyebrow">
              RESEARCH NETWORK
            </div>

            <h1>
              Conference Management
            </h1>

            <p>
              Discover academic conferences,
              research events and collaboration
              opportunities across the network.
            </p>

          </div>


          {canManage && (
            <Link
              to="/conferences/create"
              className="conference-add-btn"
            >
              <span className="conference-add-icon">
                +
              </span>

              Add Conference
            </Link>
          )}

        </div>


        {/* =====================================================
            ERROR
            ===================================================== */}

        {error && (
          <div className="conference-error">

            <div>
              <strong>
                Unable to load conferences
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchAllConferences}
            >
              Retry
            </button>

          </div>
        )}


        {/* =====================================================
            STATISTICS
            ===================================================== */}

        {!loading && (
          <div className="conference-stats">

            {/* TOTAL */}

            <div className="conference-stat-card">

              <div className="conference-stat-icon blue">
                ◫
              </div>

              <div className="conference-stat-content">

                <strong>
                  {totalConferences}
                </strong>

                <span>
                  Total Conferences
                </span>

              </div>

            </div>


            {/* UPCOMING */}

            <button
              type="button"
              className="conference-stat-card conference-stat-upcoming"
              onClick={() =>
                setFilter("upcoming")
              }
            >

              <div className="conference-stat-icon green">
                ✓
              </div>

              <div className="conference-stat-content">

                <strong>
                  {upcomingCount}
                </strong>

                <span>
                  Upcoming Events
                </span>

                {upcomingCount > 0 && (
                  <small>
                    View upcoming →
                  </small>
                )}

              </div>

            </button>


            {/* PAST */}

            <button
              type="button"
              className="conference-stat-card conference-stat-past"
              onClick={() =>
                setFilter("past")
              }
            >

              <div className="conference-stat-icon purple">
                ◷
              </div>

              <div className="conference-stat-content">

                <strong>
                  {pastCount}
                </strong>

                <span>
                  Past Events
                </span>

              </div>

            </button>

          </div>
        )}


        {/* =====================================================
            FILTER PANEL
            ===================================================== */}

        <div className="conference-filter-panel">

          <div className="conference-filter-header">

            <div>

              <div className="conference-section-label">
                EXPLORE
              </div>

              <h3>
                Search & Filter
              </h3>

              <p>
                Find conferences by title,
                venue, location or event status.
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
                Reset filters
              </button>

            )}

          </div>


          <div className="conference-filter-grid">

            {/* SEARCH */}

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
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search by title, venue or location..."
                />

                {search && (
                  <button
                    type="button"
                    className="conference-search-clear"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

            </div>


            {/* STATUS */}

            <div className="conference-field">

              <label htmlFor="conference-filter">
                Event Status
              </label>

              <select
                id="conference-filter"
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value
                  )
                }
              >

                <option value="all">
                  All Conferences
                </option>

                <option value="upcoming">
                  Upcoming Conferences
                </option>

                <option value="registered">
                  My Registered Conferences
                </option>

                <option value="past">
                  Past Conferences
                </option>

              </select>

            </div>


            {/* SORT */}

            <div className="conference-field">

              <label htmlFor="conference-sort">
                Sort By
              </label>

              <select
                id="conference-sort"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
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


          {/* ACTIVE FILTERS */}

          <div className="conference-active-filters">

            <span className="conference-results-summary">

              {processedConferences.length}

              {" "}

              {processedConferences.length === 1
                ? "conference"
                : "conferences"}

              {" "}
              found

            </span>


            {filter !== "all" && (

              <span className="conference-filter-chip">

                {filter === "upcoming" &&
                  "Upcoming"}

                {filter === "past" &&
                  "Past"}

                {filter === "registered" &&
                  "Registered"}

                <button
                  type="button"
                  onClick={() =>
                    setFilter("all")
                  }
                  aria-label="Remove status filter"
                >
                  ×
                </button>

              </span>

            )}

          </div>

        </div>


        {/* =====================================================
            RESULTS HEADER
            ===================================================== */}

        {!loading && (

          <div className="conference-results-header">

            <div>

              <div className="conference-results-title">

                <h2>
                  Conferences
                </h2>

                <span className="conference-count-badge">
                  {processedConferences.length}
                </span>

              </div>

              <p>

                {processedConferences.length === 0
                  ? "No matching conferences"
                  : `Showing ${
                      indexOfFirst + 1
                    }–${Math.min(
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
                    Number(
                      e.target.value
                    )
                  )
                }
              >

                <option value={6}>
                  6
                </option>

                <option value={9}>
                  9
                </option>

                <option value={12}>
                  12
                </option>

              </select>

              <span>
                per page
              </span>

            </div>

          </div>

        )}


        {/* =====================================================
            CONTENT
            ===================================================== */}

        {loading ||
        registeredLoading ? (

          <div className="conference-loading">

            <div className="conference-spinner" />

            <h3>
              Loading conferences...
            </h3>

            <p>
              Preparing the latest research
              events for you.
            </p>

          </div>

        ) : currentConferences.length === 0 ? (

          <div className="conference-empty">

            <div className="conference-empty-icon">
              ◫
            </div>

            <h3>
              No conferences found
            </h3>

            <p>
              We couldn't find any conferences
              matching your current search
              or filters.
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

            {/* =================================================
                CONFERENCE GRID
                ================================================= */}

            <div className="conference-grid">

              {currentConferences.map(
                (conference) => (

                  <div
                    key={conference.id}
                    className="conference-card-wrapper"
                  >

                    <ConferenceCard
                      conference={conference}
                      onDelete={handleDelete}
                      refreshConferences={
                        fetchAllConferences
                      }
                      canManage={canManage}
                    />

                  </div>

                )
              )}

            </div>


            {/* PAGINATION */}

            {renderPagination()}

          </>

        )}

      </div>


      {/* =======================================================
          PAGE-SPECIFIC STYLES
          ======================================================= */}

      <style>{`

        .conference-page {
          min-height: calc(100vh - 72px);
          background:
            radial-gradient(
              circle at top right,
              rgba(20, 115, 249, 0.06),
              transparent 34%
            ),
            #f6f8fc;
          padding: 42px 0 70px;
          color: #172033;
        }


        .conference-container {
          width: min(
            1180px,
            calc(100% - 40px)
          );
          margin: 0 auto;
        }


        /* HEADER */

        .conference-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 28px;
        }


        .conference-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 9px;
          color: #1473f9;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
        }


        .conference-eyebrow::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1473f9;
          box-shadow:
            0 0 0 5px
            rgba(20,115,249,.1);
        }


        .conference-header h1 {
          margin: 0;
          color: #172033;
          font-size: 36px;
          font-weight: 750;
          letter-spacing: -.035em;
          line-height: 1.15;
        }


        .conference-header p {
          max-width: 690px;
          margin: 10px 0 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.65;
        }


        .conference-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 18px;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #1473f9,
              #0d66e8
            );
          color: white;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          box-shadow:
            0 8px 20px
            rgba(20,115,249,.18);
          transition: .2s ease;
        }


        .conference-add-btn:hover {
          color: white;
          transform: translateY(-2px);
          box-shadow:
            0 12px 25px
            rgba(20,115,249,.24);
        }


        .conference-add-icon {
          font-size: 20px;
          line-height: 1;
        }


        /* ERROR */

        .conference-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
          padding: 14px 17px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fff1f2;
          color: #991b1b;
        }


        .conference-error div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }


        .conference-error span {
          font-size: 13px;
        }


        .conference-error button {
          border: 0;
          border-radius: 7px;
          padding: 8px 13px;
          background: white;
          color: #b91c1c;
          font-weight: 700;
          cursor: pointer;
        }


        /* STATS */

        .conference-stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }


        .conference-stat-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          min-height: 105px;
          padding: 20px;
          overflow: hidden;
          border: 1px solid #e5eaf1;
          border-radius: 14px;
          background: white;
          box-shadow:
            0 5px 18px
            rgba(25,40,70,.045);
          box-sizing: border-box;
        }


        button.conference-stat-card {
          width: 100%;
          text-align: left;
          font-family: inherit;
        }


        .conference-stat-card::after {
          content: "";
          position: absolute;
          right: -30px;
          bottom: -40px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background:
            rgba(20,115,249,.035);
        }


        .conference-stat-upcoming,
        .conference-stat-past {
          cursor: pointer;
          transition: .2s ease;
        }


        .conference-stat-upcoming:hover,
        .conference-stat-past:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow:
            0 9px 24px
            rgba(25,40,70,.08);
        }


        .conference-stat-icon {
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 21px;
          font-weight: 800;
        }


        .conference-stat-icon.blue {
          background: #eaf2ff;
          color: #1473f9;
        }


        .conference-stat-icon.green {
          background: #eaf9f3;
          color: #14936a;
        }


        .conference-stat-icon.purple {
          background: #f1edff;
          color: #7355d5;
        }


        .conference-stat-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }


        .conference-stat-content strong {
          color: #172033;
          font-size: 28px;
          line-height: 1;
          font-weight: 750;
        }


        .conference-stat-content span {
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
        }


        .conference-stat-content small {
          margin-top: 4px;
          color: #14936a;
          font-size: 10px;
          font-weight: 700;
        }


        /* FILTER */

        .conference-filter-panel {
          margin-bottom: 23px;
          padding: 22px;
          border: 1px solid #e5eaf1;
          border-radius: 15px;
          background: white;
          box-shadow:
            0 5px 18px
            rgba(25,40,70,.04);
        }


        .conference-filter-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }


        .conference-section-label {
          margin-bottom: 5px;
          color: #1473f9;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
        }


        .conference-filter-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }


        .conference-filter-header p {
          margin: 5px 0 0;
          color: #718096;
          font-size: 12px;
        }


        .conference-clear-btn {
          border: 1px solid #d7e3f5;
          border-radius: 8px;
          padding: 8px 12px;
          background: #f7faff;
          color: #1473f9;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }


        .conference-clear-btn:hover {
          background: #edf4ff;
        }


        .conference-filter-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.8fr)
            minmax(190px, .8fr)
            minmax(190px, .8fr);
          gap: 15px;
        }


        .conference-field {
          min-width: 0;
        }


        .conference-field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }


        .conference-field input,
        .conference-field select {
          width: 100%;
          height: 43px;
          padding: 0 12px;
          border: 1px solid #dce3ec;
          border-radius: 9px;
          outline: none;
          background: white;
          color: #172033;
          font-size: 13px;
          transition: .18s ease;
          box-sizing: border-box;
        }


        .conference-field input:focus,
        .conference-field select:focus {
          border-color: #1473f9;
          box-shadow:
            0 0 0 3px
            rgba(20,115,249,.1);
        }


        .conference-search-wrapper {
          position: relative;
        }


        .conference-search-wrapper input {
          padding-left: 38px;
          padding-right: 38px;
        }


        .conference-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 17px;
          pointer-events: none;
        }


        .conference-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          width: 27px;
          height: 27px;
          transform: translateY(-50%);
          border: 0;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
        }


        .conference-active-filters {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 15px;
        }


        .conference-results-summary {
          color: #64748b;
          font-size: 11px;
        }


        .conference-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px 5px 10px;
          border-radius: 20px;
          background: #edf4ff;
          color: #1473f9;
          font-size: 11px;
          font-weight: 700;
        }


        .conference-filter-chip button {
          border: 0;
          background: transparent;
          color: #1473f9;
          cursor: pointer;
          font-size: 15px;
          line-height: 1;
        }


        /* RESULTS */

        .conference-results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 0 0 14px;
        }


        .conference-results-title {
          display: flex;
          align-items: center;
          gap: 9px;
        }


        .conference-results-title h2 {
          margin: 0;
          color: #172033;
          font-size: 20px;
          font-weight: 750;
        }


        .conference-count-badge {
          min-width: 25px;
          height: 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #eaf2ff;
          color: #1473f9;
          font-size: 11px;
          font-weight: 800;
        }


        .conference-results-header p {
          margin: 5px 0 0;
          color: #718096;
          font-size: 12px;
        }


        .conference-per-page {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #64748b;
          font-size: 12px;
        }


        .conference-per-page select {
          height: 35px;
          padding: 0 25px 0 9px;
          border: 1px solid #dce3ec;
          border-radius: 8px;
          background: white;
          outline: none;
        }


        /* GRID */

        .conference-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 17px;
        }


        .conference-card-wrapper {
          min-width: 0;
          height: 100%;
        }


        /* LOADING / EMPTY */

        .conference-loading,
        .conference-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 330px;
          padding: 35px;
          border: 1px solid #e5eaf1;
          border-radius: 15px;
          background: white;
          text-align: center;
        }


        .conference-spinner {
          width: 38px;
          height: 38px;
          margin-bottom: 16px;
          border: 3px solid #dbeafe;
          border-top-color: #1473f9;
          border-radius: 50%;
          animation:
            conference-spin
            .8s linear infinite;
        }


        @keyframes conference-spin {
          to {
            transform: rotate(360deg);
          }
        }


        .conference-loading h3,
        .conference-empty h3 {
          margin: 0;
          font-size: 18px;
        }


        .conference-loading p,
        .conference-empty p {
          max-width: 480px;
          margin: 8px 0 0;
          color: #718096;
          font-size: 13px;
          line-height: 1.6;
        }


        .conference-empty-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          border-radius: 16px;
          background: #edf4ff;
          color: #1473f9;
          font-size: 25px;
        }


        .conference-reset-btn {
          margin-top: 18px;
          border: 0;
          border-radius: 8px;
          padding: 9px 14px;
          background: #1473f9;
          color: white;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }


        /* PAGINATION */

        .conference-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 28px;
        }


        .conference-page-numbers {
          display: flex;
          gap: 5px;
        }


        .conference-page-btn,
        .conference-page-number {
          min-width: 37px;
          height: 36px;
          padding: 0 11px;
          border: 1px solid #dce3ec;
          border-radius: 8px;
          background: white;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }


        .conference-page-number {
          padding: 0;
        }


        .conference-page-number.active {
          border-color: #1473f9;
          background: #1473f9;
          color: white;
        }


        .conference-page-btn:hover:not(:disabled),
        .conference-page-number:hover:not(.active) {
          border-color: #b8cff0;
          background: #f5f9ff;
        }


        .conference-page-btn:disabled {
          opacity: .45;
          cursor: not-allowed;
        }


        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .conference-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }


          .conference-filter-grid {
            grid-template-columns:
              1fr 1fr;
          }


          .search-field {
            grid-column: 1 / -1;
          }

        }


        @media (max-width: 700px) {

          .conference-page {
            padding-top: 25px;
          }


          .conference-container {
            width:
              min(
                calc(100% - 24px),
                1180px
              );
          }


          .conference-header {
            flex-direction: column;
            align-items: flex-start;
          }


          .conference-header h1 {
            font-size: 29px;
          }


          .conference-add-btn {
            width: 100%;
            justify-content: center;
          }


          .conference-stats {
            grid-template-columns: 1fr;
          }


          .conference-filter-grid {
            grid-template-columns: 1fr;
          }


          .search-field {
            grid-column: auto;
          }


          .conference-filter-header {
            flex-direction: column;
          }


          .conference-results-header {
            align-items: flex-start;
            flex-direction: column;
          }


          .conference-grid {
            grid-template-columns: 1fr;
          }


          .conference-pagination {
            flex-wrap: wrap;
          }

        }

      `}</style>

    </div>
  );
}


export default Conferences;