import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getInstitutions,
  deleteInstitution,
} from "../../services/institutionService";

import InstitutionCard from "../../components/institutions/InstitutionCard";

import "./Institutions.css";

function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);

      const data = await getInstitutions();

      setInstitutions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to load institutions.");
    } finally {
      setLoading(false);
    }
  };

  const locations = useMemo(() => {
    const values = institutions
      .map((institution) => institution.location)
      .filter(Boolean)
      .map((location) => location.trim());

    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    let result = [...institutions];

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((institution) => {
        const name = institution.name?.toLowerCase() || "";
        const acronym =
          institution.acronym?.toLowerCase() || "";
        const email =
          institution.email?.toLowerCase() || "";
        const location =
          institution.location?.toLowerCase() || "";
        const address =
          institution.address?.toLowerCase() || "";

        return (
          name.includes(query) ||
          acronym.includes(query) ||
          email.includes(query) ||
          location.includes(query) ||
          address.includes(query)
        );
      });
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (institution) =>
          institution.location?.trim() === locationFilter
      );
    }

    result.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";

      if (sortBy === "name-desc") {
        return nameB.localeCompare(nameA);
      }

      return nameA.localeCompare(nameB);
    });

    return result;
  }, [
    institutions,
    search,
    locationFilter,
    sortBy,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    locationFilter,
    sortBy,
    itemsPerPage,
  ]);

  const totalPages = Math.ceil(
    filteredInstitutions.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentInstitutions =
    filteredInstitutions.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this institution?"
    );

    if (!confirmed) return;

    try {
      await deleteInstitution(id);
      await fetchInstitutions();

      if (
        currentPage > 1 &&
        currentInstitutions.length === 1
      ) {
        setCurrentPage((page) => page - 1);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete institution.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("all");
    setSortBy("name-asc");
    setCurrentPage(1);
  };

  const firstShown =
    filteredInstitutions.length === 0
      ? 0
      : startIndex + 1;

  const lastShown = Math.min(
    startIndex + itemsPerPage,
    filteredInstitutions.length
  );

  return (
    <main className="institutions-page">
      <div className="institutions-container">

        {/* HEADER */}
        <section className="institutions-header">
          <div>
            <div className="institutions-eyebrow">
              RESEARCH NETWORK
            </div>

            <h1>Institution Management</h1>

            <p>
              Explore universities, research institutions
              and affiliated organizations across the network.
            </p>
          </div>

          <Link
            to="/institutions/create"
            className="institution-create-btn"
          >
            <span>+</span>
            Create Institution
          </Link>
        </section>

        {/* STATS */}
        <section className="institution-stats">

          <div className="institution-stat-card">
            <div className="institution-stat-icon blue">
              ◫
            </div>

            <div>
              <strong>{institutions.length}</strong>
              <span>Total Institutions</span>
            </div>
          </div>

          <div className="institution-stat-card">
            <div className="institution-stat-icon purple">
              ◉
            </div>

            <div>
              <strong>{locations.length}</strong>
              <span>Locations</span>
            </div>
          </div>

          <div className="institution-stat-card">
            <div className="institution-stat-icon green">
              ✓
            </div>

            <div>
              <strong>
                {filteredInstitutions.length}
              </strong>
              <span>Matching Results</span>
            </div>
          </div>

        </section>

        {/* FILTER PANEL */}
        <section className="institution-filter-panel">

          <div className="filter-heading">
            <div>
              <h2>Search & Filter</h2>
              <p>
                Find institutions using name, location or
                other available information.
              </p>
            </div>

            {(search ||
              locationFilter !== "all" ||
              sortBy !== "name-asc") && (
              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="institution-filters">

            <div className="filter-field search-field">
              <label>Search</label>

              <div className="search-input-wrapper">
                <span className="search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by institution, acronym, email or location..."
                />
              </div>
            </div>

            <div className="filter-field">
              <label>Location</label>

              <select
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(e.target.value)
                }
              >
                <option value="all">
                  All locations
                </option>

                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Sort by</label>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="name-asc">
                  Name: A → Z
                </option>

                <option value="name-desc">
                  Name: Z → A
                </option>
              </select>
            </div>

          </div>
        </section>

        {/* RESULTS HEADER */}
        <section className="institutions-results-header">

          <div>
            <h2>
              Institutions
              <span>{filteredInstitutions.length}</span>
            </h2>

            <p>
              {filteredInstitutions.length === 0
                ? "No institutions found"
                : `Showing ${firstShown}–${lastShown} of ${filteredInstitutions.length} institutions`}
            </p>
          </div>

          <div className="per-page-control">
            <label>Show</label>

            <select
              value={itemsPerPage}
              onChange={(e) =>
                setItemsPerPage(Number(e.target.value))
              }
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>

            <span>per page</span>
          </div>

        </section>

        {/* CONTENT */}
        {loading ? (
          <div className="institutions-loading">
            <div className="institution-spinner" />
            <p>Loading institutions...</p>
          </div>
        ) : currentInstitutions.length === 0 ? (
          <div className="institutions-empty">

            <div className="empty-icon">
              ◫
            </div>

            <h3>No institutions found</h3>

            <p>
              Try changing your search or filter criteria.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="empty-clear-btn"
            >
              Clear filters
            </button>

          </div>
        ) : (
          <>
            <div className="institutions-grid">

              {currentInstitutions.map((institution) => (
                <div
                  key={institution.id}
                  className="institution-card-wrapper"
                >
                  <InstitutionCard
                    institution={institution}
                    onDelete={handleDelete}
                  />
                </div>
              ))}

            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="institution-pagination">

                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1
                    )
                  }
                >
                  ←
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`page-btn ${
                      currentPage === page
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

                <button
                  type="button"
                  className="page-btn"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1
                    )
                  }
                >
                  →
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}

export default Institutions;