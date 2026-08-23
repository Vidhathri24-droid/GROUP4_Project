import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  getInstitutions,
  deleteInstitution,
} from "../../services/institutionService";

import { getCurrentUser } from "../../services/authService";

function Institutions() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Unable to read stored user:", error);
      return null;
    }
  });

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedInstitution, setSelectedInstitution] =
    useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [notification, setNotification] = useState(null);

  // =========================================================
  // ROLE NORMALIZATION
  // =========================================================

  const getUserRole = (user) => {
    if (!user) {
      return "";
    }

    const possibleRoles = [
      user.role,
      user.user_role,
      user.userRole,
      user?.user?.role,
      user?.data?.role,
      user?.data?.user_role,
      user?.data?.userRole,
    ];

    const role = possibleRoles.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );

    return String(role || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  };

  const userRole = getUserRole(currentUser);

  const isSystemAdmin =
    userRole === "systemadmin";

  const isInstitutionAdmin =
    userRole === "institutionadmin";

  const canManageInstitutions =
    isSystemAdmin || isInstitutionAdmin;

  const canExportInstitutions =
    isSystemAdmin || isInstitutionAdmin;

  // =========================================================
  // CURRENT USER
  // =========================================================

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();

        if (user) {
          setCurrentUser(user);

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );

          return;
        }

        const storedUser =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user");

        if (storedUser) {
          setCurrentUser(
            JSON.parse(storedUser)
          );
        }
      } catch (error) {
        console.warn(
          "Unable to load current user from backend:",
          error
        );

        try {
          const storedUser =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

          setCurrentUser(
            storedUser
              ? JSON.parse(storedUser)
              : null
          );
        } catch (storageError) {
          console.error(
            "Unable to read stored user:",
            storageError
          );

          setCurrentUser(null);
        }
      }
    };

    loadCurrentUser();

    const handleUserUpdated = () => {
      try {
        const storedUser =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user");

        setCurrentUser(
          storedUser
            ? JSON.parse(storedUser)
            : null
        );
      } catch (error) {
        console.error(
          "Unable to synchronize user:",
          error
        );

        setCurrentUser(null);
      }
    };

    window.addEventListener(
      "storage",
      handleUserUpdated
    );

    window.addEventListener(
      "userUpdated",
      handleUserUpdated
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUserUpdated
      );

      window.removeEventListener(
        "userUpdated",
        handleUserUpdated
      );
    };
  }, []);

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const showNotification = (
    type,
    message
  ) => {
    setNotification({
      type,
      message,
    });

    window.setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const getErrorMessage = (
    error,
    fallback
  ) => {
    const detail =
      error?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map(
          (item) =>
            item?.msg ||
            item?.message
        )
        .filter(Boolean)
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (
      error?.response?.data?.message
    ) {
      return error.response.data.message;
    }

    return fallback;
  };

  // =========================================================
  // LOAD INSTITUTIONS
  // =========================================================

  const loadInstitutions = async () => {
    try {
      setLoading(true);

      const response =
        await getInstitutions();

      const data =
        response?.data?.items ||
        response?.data ||
        response?.items ||
        response ||
        [];

      setInstitutions(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load institutions:",
        error
      );

      showNotification(
        "error",
        getErrorMessage(
          error,
          "Failed to load institutions."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  // =========================================================
  // EXPORT ALL INSTITUTIONS
  //
  // IMPORTANT:
  // This uses the complete institutions array.
  // It does NOT export only the current page.
  // It also does NOT call /institutions/export.
  // =========================================================

  const handleExportInstitutions = () => {
    if (!canExportInstitutions) {
      return;
    }

    try {
      if (
        !Array.isArray(institutions)
      ) {
        throw new Error(
          "Invalid institution data."
        );
      }

      const rows =
        institutions.map(
          (institution, index) => ({
            "S.No": index + 1,

            "Institution ID":
              institution?.id || "",

            "Institution Name":
              institution?.name ||
              institution?.institution_name ||
              "",

            "Abbreviation":
              institution?.abbreviation ||
              institution?.acronym ||
              "",

            "Email":
              institution?.email || "",

            "Phone":
              institution?.phone || "",

            "Website":
              institution?.website || "",

            "Address":
              institution?.address || "",

            "City":
              institution?.city || "",

            "State":
              institution?.state || "",

            "Country":
              institution?.country || "",

            "Created At":
              institution?.created_at || "",

            "Updated At":
              institution?.updated_at || "",
          })
        );

      if (rows.length === 0) {
        rows.push({
          "S.No": "",
          "Institution ID": "",
          "Institution Name":
            "No institutions found",
          "Abbreviation": "",
          "Email": "",
          "Phone": "",
          "Website": "",
          "Address": "",
          "City": "",
          "State": "",
          "Country": "",
          "Created At": "",
          "Updated At": "",
        });
      }

      const worksheet =
        XLSX.utils.json_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 40 },
        { wch: 42 },
        { wch: 20 },
        { wch: 35 },
        { wch: 22 },
        { wch: 45 },
        { wch: 50 },
        { wch: 24 },
        { wch: 24 },
        { wch: 24 },
        { wch: 25 },
        { wch: 25 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Institutions"
      );

      XLSX.writeFile(
        workbook,
        "SCNA_All_Institutions.xlsx"
      );

      showNotification(
        "success",
        `${institutions.length} institutions exported successfully.`
      );
    } catch (error) {
      console.error(
        "Unable to export institutions:",
        error
      );

      showNotification(
        "error",
        error?.message ||
          "Unable to export institutions."
      );
    }
  };

  // =========================================================
  // LOCATION
  // =========================================================

  const getLocation = (
    institution
  ) => {
    return [
      institution?.city,
      institution?.state,
      institution?.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // =========================================================
  // INSTITUTION NAME
  // =========================================================

  const getInstitutionName = (
    institution
  ) => {
    return (
      institution?.name ||
      institution?.institution_name ||
      "Unnamed Institution"
    );
  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (
    name = ""
  ) => {
    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "IN";
    }

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  };

  // =========================================================
  // FILTER + SORT
  // =========================================================

  const filteredInstitutions =
    useMemo(() => {
      let result = [
        ...institutions,
      ];

      const searchValue =
        search.trim().toLowerCase();

      if (searchValue) {
        result = result.filter(
          (institution) => {
            const searchableText = [
              institution?.name,
              institution?.institution_name,
              institution?.abbreviation,
              institution?.acronym,
              institution?.email,
              institution?.phone,
              institution?.website,
              institution?.address,
              institution?.city,
              institution?.state,
              institution?.country,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
              searchValue
            );
          }
        );
      }

      if (
        locationFilter !== "all"
      ) {
        result =
          result.filter(
            (institution) =>
              getLocation(
                institution
              ).toLowerCase() ===
              locationFilter.toLowerCase()
          );
      }

      result.sort((a, b) => {
        const nameA =
          getInstitutionName(a)
            .toLowerCase();

        const nameB =
          getInstitutionName(b)
            .toLowerCase();

        if (
          sortBy === "name-desc"
        ) {
          return nameB.localeCompare(
            nameA
          );
        }

        if (
          sortBy === "newest"
        ) {
          return (
            new Date(
              b?.created_at || 0
            ) -
            new Date(
              a?.created_at || 0
            )
          );
        }

        if (
          sortBy === "oldest"
        ) {
          return (
            new Date(
              a?.created_at || 0
            ) -
            new Date(
              b?.created_at || 0
            )
          );
        }

        return nameA.localeCompare(
          nameB
        );
      });

      return result;
    }, [
      institutions,
      search,
      locationFilter,
      sortBy,
    ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredInstitutions.length /
          pageSize
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedInstitutions =
    filteredInstitutions.slice(
      (safeCurrentPage - 1) *
        pageSize,
      safeCurrentPage * pageSize
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    locationFilter,
    sortBy,
    pageSize,
  ]);

  // =========================================================
  // LOCATIONS
  // =========================================================

  const locations =
    useMemo(() => {
      const uniqueLocations =
        new Set();

      institutions.forEach(
        (institution) => {
          const location =
            getLocation(
              institution
            );

          if (location) {
            uniqueLocations.add(
              location
            );
          }
        }
      );

      return Array.from(
        uniqueLocations
      ).sort((a, b) =>
        a.localeCompare(b)
      );
    }, [institutions]);

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteClick = (
    institution
  ) => {
    if (!canManageInstitutions) {
      return;
    }

    setDeleteTarget(
      institution
    );
  };

  const confirmDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      if (!canManageInstitutions) {
        setDeleteTarget(null);
        return;
      }

      try {
        await deleteInstitution(
          deleteTarget.id
        );

        setInstitutions(
          (previous) =>
            previous.filter(
              (institution) =>
                institution.id !==
                deleteTarget.id
            )
        );

        setDeleteTarget(null);

        showNotification(
          "success",
          "Institution deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete institution error:",
          error
        );

        setDeleteTarget(null);

        showNotification(
          "error",
          getErrorMessage(
            error,
            "Unable to delete institution."
          )
        );
      }
    };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (
    institution
  ) => {
    if (!canManageInstitutions) {
      return;
    }

    if (!institution?.id) {
      showNotification(
        "error",
        "Institution ID is missing."
      );
      return;
    }

    navigate(
      `/institutions/edit/${institution.id}`
    );
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh =
    async () => {
      await loadInstitutions();

      showNotification(
        "success",
        "Institutions refreshed."
      );
    };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalInstitutions =
    institutions.length;

  const matchingResults =
    filteredInstitutions.length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="institutions-page">

      {/* =====================================================
          NOTIFICATION
      ====================================================== */}

      {notification && (
        <div
          className={`institution-toast ${
            notification.type ===
            "success"
              ? "toast-success"
              : "toast-error"
          }`}
        >
          <div className="toast-icon">
            {notification.type ===
            "success"
              ? "✓"
              : "!"}
          </div>

          <div className="toast-content">
            <strong>
              {notification.type ===
              "success"
                ? "Success"
                : "Action failed"}
            </strong>

            <span>
              {notification.message}
            </span>
          </div>

          <button
            type="button"
            className="toast-close"
            onClick={() =>
              setNotification(null)
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="institutions-container">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="page-header">

          <div>
            <div className="eyebrow">
              RESEARCH NETWORK
            </div>

            <h1>
              Institution Management
            </h1>

            <p>
              Explore universities,
              research institutions
              and affiliated
              organizations across
              the network.
            </p>
          </div>

          <div className="header-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={handleRefresh}
              disabled={loading}
            >
              ↻ Refresh
            </button>

            {/* =================================================
                EXPORT
                SYSTEM ADMIN + INSTITUTION ADMIN ONLY
            ================================================== */}

            {canExportInstitutions && (
              <button
                type="button"
                className="export-button"
                onClick={
                  handleExportInstitutions
                }
              >
                ⇩ Export to Excel
              </button>
            )}

            {/* =================================================
                CREATE
                SYSTEM ADMIN + INSTITUTION ADMIN ONLY
            ================================================== */}

            {canManageInstitutions && (
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/institutions/create"
                  )
                }
              >
                + Create Institution
              </button>
            )}

          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <div className="statistics-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              ▣
            </div>

            <div>
              <strong>
                {totalInstitutions}
              </strong>

              <span>
                Total Institutions
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              ◉
            </div>

            <div>
              <strong>
                {locations.length}
              </strong>

              <span>
                Locations
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <strong>
                {matchingResults}
              </strong>

              <span>
                Matching Results
              </span>
            </div>
          </div>

        </div>

        {/* =====================================================
            SEARCH / FILTER
        ====================================================== */}

        <div className="filter-card">

          <div className="filter-heading">
            <h2>
              Search & Filter
            </h2>

            <p>
              Find institutions using
              their name, abbreviation,
              contact information or
              location.
            </p>
          </div>

          <div className="filter-grid">

            <div className="filter-field search-field">

              <label>
                Search
              </label>

              <div className="input-wrapper">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search institution, acronym, email or location..."
                />

                {search && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    ×
                  </button>
                )}

              </div>
            </div>

            <div className="filter-field">

              <label>
                Location
              </label>

              <select
                value={locationFilter}
                onChange={(event) =>
                  setLocationFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All locations
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="filter-field">

              <label>
                Sort by
              </label>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="name-asc">
                  Name: A → Z
                </option>

                <option value="name-desc">
                  Name: Z → A
                </option>

                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>
              </select>

            </div>

          </div>
        </div>

        {/* =====================================================
            RESULTS HEADER
        ====================================================== */}

        <div className="results-header">

          <div>
            <h2>
              Institutions

              <span className="count-badge">
                {filteredInstitutions.length}
              </span>
            </h2>

            <p>
              Showing{" "}
              {filteredInstitutions.length ===
              0
                ? 0
                : (safeCurrentPage - 1) *
                    pageSize +
                  1}
              –
              {Math.min(
                safeCurrentPage *
                  pageSize,
                filteredInstitutions.length
              )}{" "}
              of{" "}
              {filteredInstitutions.length}{" "}
              institutions
            </p>
          </div>

          <div className="page-size-control">

            <span>
              Show
            </span>

            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(
                  Number(
                    event.target.value
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

              <option value={18}>
                18
              </option>
            </select>

            <span>
              per page
            </span>

          </div>
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>

            <p>
              Loading institutions...
            </p>
          </div>
        )}

        {/* =====================================================
            EMPTY
        ====================================================== */}

        {!loading &&
          filteredInstitutions.length ===
            0 && (
            <div className="empty-state">

              <div className="empty-icon">
                🏛
              </div>

              <h3>
                No institutions found
              </h3>

              <p>
                Try changing your search
                or filter criteria.
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setLocationFilter(
                    "all"
                  );
                  setSortBy(
                    "name-asc"
                  );
                }}
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* =====================================================
            INSTITUTION CARDS
        ====================================================== */}

        {!loading &&
          paginatedInstitutions.length >
            0 && (
            <div className="institution-grid">

              {paginatedInstitutions.map(
                (institution) => {
                  const name =
                    getInstitutionName(
                      institution
                    );

                  const abbreviation =
                    institution?.abbreviation ||
                    institution?.acronym ||
                    "";

                  const location =
                    getLocation(
                      institution
                    );

                  return (
                    <div
                      className="institution-card"
                      key={
                        institution.id
                      }
                    >

                      <div className="card-top-line"></div>

                      <div className="institution-card-header">

                        <div className="institution-avatar">
                          {getInitials(
                            name
                          )}
                        </div>

                        <div className="institution-title">

                          <h3>
                            {name}
                          </h3>

                          {abbreviation && (
                            <span className="abbreviation">
                              {abbreviation}
                            </span>
                          )}

                        </div>

                      </div>

                      <div className="card-divider"></div>

                      <div className="institution-info">

                        {institution?.email && (
                          <div className="info-row">

                            <span className="info-icon">
                              ✉
                            </span>

                            <div>
                              <small>
                                Email
                              </small>

                              <p>
                                {
                                  institution.email
                                }
                              </p>
                            </div>

                          </div>
                        )}

                        {institution?.phone && (
                          <div className="info-row">

                            <span className="info-icon">
                              ☎
                            </span>

                            <div>
                              <small>
                                Phone
                              </small>

                              <p>
                                {
                                  institution.phone
                                }
                              </p>
                            </div>

                          </div>
                        )}

                        {location && (
                          <div className="info-row">

                            <span className="info-icon">
                              ◉
                            </span>

                            <div>
                              <small>
                                Location
                              </small>

                              <p>
                                {location}
                              </p>
                            </div>

                          </div>
                        )}

                        {institution?.website && (
                          <div className="info-row">

                            <span className="info-icon">
                              ↗
                            </span>

                            <div>
                              <small>
                                Website
                              </small>

                              <a
                                href={
                                  institution.website.startsWith(
                                    "http"
                                  )
                                    ? institution.website
                                    : `https://${institution.website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                Visit website
                              </a>
                            </div>

                          </div>
                        )}

                      </div>

                      {/* =================================================
                          CARD ACTIONS
                      ================================================== */}

                      <div
                        className={
                          canManageInstitutions
                            ? "card-actions"
                            : "card-actions view-only"
                        }
                      >

                        <button
                          type="button"
                          className="view-button"
                          onClick={() =>
                            setSelectedInstitution(
                              institution
                            )
                          }
                        >
                          View Details
                        </button>

                        {canManageInstitutions && (
                          <>
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleEdit(
                                  institution
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDeleteClick(
                                  institution
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* =====================================================
            PAGINATION
        ====================================================== */}

        {!loading &&
          filteredInstitutions.length >
            0 &&
          totalPages > 1 && (
            <div className="pagination">

              <button
                type="button"
                disabled={
                  safeCurrentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    safeCurrentPage - 1
                  )
                }
              >
                ← Previous
              </button>

              <div className="page-numbers">

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={
                      page ===
                      safeCurrentPage
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                  >
                    {page}
                  </button>
                ))}

              </div>

              <button
                type="button"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    safeCurrentPage + 1
                  )
                }
              >
                Next →
              </button>

            </div>
          )}

      </div>

      {/* =========================================================
          DETAILS MODAL
      ========================================================== */}

      {selectedInstitution && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedInstitution(
              null
            )
          }
        >

          <div
            className="details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title-wrapper">

                <div className="modal-avatar">
                  {getInitials(
                    getInstitutionName(
                      selectedInstitution
                    )
                  )}
                </div>

                <div>

                  <span className="modal-eyebrow">
                    INSTITUTION DETAILS
                  </span>

                  <h2>
                    {getInstitutionName(
                      selectedInstitution
                    )}
                  </h2>

                  {(selectedInstitution?.abbreviation ||
                    selectedInstitution?.acronym) && (
                    <span className="modal-abbreviation">
                      {selectedInstitution?.abbreviation ||
                        selectedInstitution?.acronym}
                    </span>
                  )}

                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setSelectedInstitution(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="details-grid">

                <DetailItem
                  icon="✉"
                  label="Email"
                  value={
                    selectedInstitution.email
                  }
                />

                <DetailItem
                  icon="☎"
                  label="Phone"
                  value={
                    selectedInstitution.phone
                  }
                />

                <DetailItem
                  icon="◉"
                  label="Country"
                  value={
                    selectedInstitution.country
                  }
                />

                <DetailItem
                  icon="⌖"
                  label="State"
                  value={
                    selectedInstitution.state
                  }
                />

                <DetailItem
                  icon="⌖"
                  label="City"
                  value={
                    selectedInstitution.city
                  }
                />

                <DetailItem
                  icon="▣"
                  label="Address"
                  value={
                    selectedInstitution.address
                  }
                  fullWidth
                />

                {selectedInstitution.website && (
                  <div className="detail-item">

                    <span className="detail-icon">
                      ↗
                    </span>

                    <div>
                      <small>
                        Website
                      </small>

                      <a
                        href={
                          selectedInstitution.website.startsWith(
                            "http"
                          )
                            ? selectedInstitution.website
                            : `https://${selectedInstitution.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        {
                          selectedInstitution.website
                        }
                      </a>
                    </div>

                  </div>
                )}

              </div>

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="modal-secondary-button"
                onClick={() =>
                  setSelectedInstitution(
                    null
                  )
                }
              >
                Close
              </button>

              {canManageInstitutions && (
                <button
                  type="button"
                  className="modal-primary-button"
                  onClick={() => {
                    const institution =
                      selectedInstitution;

                    setSelectedInstitution(
                      null
                    );

                    handleEdit(
                      institution
                    );
                  }}
                >
                  Edit Institution
                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================== */}

      {deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() =>
            setDeleteTarget(null)
          }
        >

          <div
            className="delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="delete-icon">
              !
            </div>

            <h2>
              Delete Institution?
            </h2>

            <p>
              Are you sure you want to
              delete{" "}
              <strong>
                {getInstitutionName(
                  deleteTarget
                )}
              </strong>
              ?
            </p>

            <p className="delete-warning">
              This action cannot be
              undone.
            </p>

            <div className="delete-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={confirmDelete}
              >
                Delete Institution
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          STYLES
      ========================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .institutions-page {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #f5f8fc 0%,
              #eef3f9 100%
            );
          padding: 42px 24px 70px;
          color: #17233c;
        }

        .institutions-container {
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #146cf5;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 7px;
        }

        .page-header h1 {
          margin: 0;
          font-size: 38px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .page-header p {
          margin: 10px 0 0;
          color: #687894;
          font-size: 15px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        button {
          font-family: inherit;
        }

        .primary-button,
        .secondary-button,
        .export-button {
          height: 46px;
          padding: 0 18px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
          white-space: nowrap;
        }

        .primary-button {
          border: 0;
          background: #1672f5;
          color: white;
          box-shadow:
            0 7px 18px
            rgba(22, 114, 245, 0.2);
        }

        .primary-button:hover {
          background: #0d61dc;
          transform: translateY(-1px);
        }

        .secondary-button {
          background: white;
          color: #176cf0;
          border: 1px solid #cfe0fa;
        }

        .secondary-button:hover {
          background: #f5f9ff;
        }

        .export-button {
          background: white;
          color: #198754;
          border: 1px solid #8fd3b0;
        }

        .export-button:hover {
          background: #edf9f3;
          border-color: #198754;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e5ebf4;
          border-radius: 14px;
          min-height: 92px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow:
            0 3px 14px
            rgba(22, 48, 85, 0.05);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 11px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 22px;
          font-weight: 800;
        }

        .stat-icon.blue {
          color: #176cf0;
          background: #eaf2ff;
        }

        .stat-icon.purple {
          color: #7048d8;
          background: #f0eaff;
        }

        .stat-icon.green {
          color: #159563;
          background: #e7f8f0;
        }

        .stat-card strong {
          display: block;
          font-size: 26px;
          line-height: 1;
          margin-bottom: 5px;
        }

        .stat-card span {
          color: #71809a;
          font-size: 13px;
        }

        .filter-card {
          background: white;
          border: 1px solid #e4eaf2;
          border-radius: 15px;
          padding: 24px;
          margin-bottom: 22px;
          box-shadow:
            0 4px 16px
            rgba(22, 48, 85, 0.05);
        }

        .filter-heading h2 {
          margin: 0;
          font-size: 19px;
        }

        .filter-heading p {
          margin: 6px 0 22px;
          color: #72809a;
          font-size: 13px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(190px, 0.8fr)
            minmax(180px, 0.8fr);
          gap: 14px;
        }

        .filter-field label {
          display: block;
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 700;
          color: #27354d;
        }

        .input-wrapper {
          height: 42px;
          border: 1px solid #dce4ef;
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          background: white;
        }

        .input-wrapper:focus-within {
          border-color: #3e8af5;
          box-shadow:
            0 0 0 3px
            rgba(22, 114, 245, 0.08);
        }

        .input-wrapper span {
          color: #8b98aa;
          font-size: 18px;
          margin-right: 8px;
        }

        .input-wrapper input {
          border: 0;
          outline: 0;
          width: 100%;
          height: 100%;
          font-size: 13px;
          color: #26354d;
        }

        .clear-search {
          border: 0;
          background: transparent;
          color: #8c98a9;
          cursor: pointer;
          font-size: 19px;
        }

        .filter-field select,
        .page-size-control select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid #dce4ef;
          background: white;
          color: #26354d;
          outline: none;
          cursor: pointer;
        }

        .results-header {
          background: white;
          border: 1px solid #e4eaf2;
          border-radius: 15px;
          padding: 18px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .results-header h2 {
          margin: 0;
          font-size: 19px;
        }

        .results-header p {
          margin: 5px 0 0;
          color: #748198;
          font-size: 13px;
        }

        .count-badge {
          display: inline-flex;
          margin-left: 8px;
          padding: 3px 8px;
          border-radius: 7px;
          background: #eaf2ff;
          color: #176cf0;
          font-size: 12px;
          vertical-align: middle;
        }

        .page-size-control {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #69778e;
          font-size: 13px;
        }

        .page-size-control select {
          width: 66px;
        }

        .institution-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .institution-card {
          position: relative;
          background: white;
          border-radius: 15px;
          border: 1px solid #e4eaf2;
          overflow: hidden;
          box-shadow:
            0 4px 14px
            rgba(22, 48, 85, 0.06);
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .institution-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 28px
            rgba(22, 48, 85, 0.11);
        }

        .card-top-line {
          height: 4px;
          background:
            linear-gradient(
              90deg,
              #176cf0,
              #7347d9
            );
        }

        .institution-card-header {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 22px 20px 15px;
        }

        .institution-avatar {
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #eaf2ff;
          color: #176cf0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
        }

        .institution-title {
          min-width: 0;
        }

        .institution-title h3 {
          margin: 0 0 7px;
          color: #146cf5;
          font-size: 19px;
          line-height: 1.2;
          font-weight: 750;
        }

        .abbreviation {
          display: inline-block;
          padding: 3px 7px;
          border-radius: 5px;
          border: 1px solid #dfe5ec;
          background: #f7f9fb;
          color: #64738a;
          font-size: 11px;
          font-weight: 700;
        }

        .card-divider {
          height: 1px;
          background: #e5eaf0;
          margin: 0 20px;
        }

        .institution-info {
          padding: 17px 20px 10px;
          min-height: 190px;
        }

        .info-row {
          display: flex;
          gap: 10px;
          margin-bottom: 13px;
        }

        .info-icon {
          width: 24px;
          color: #5f7da7;
          font-size: 14px;
          padding-top: 2px;
        }

        .info-row small {
          display: block;
          margin-bottom: 3px;
          color: #8995a8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .info-row p {
          margin: 0;
          color: #34435b;
          font-size: 13px;
          line-height: 1.4;
          word-break: break-word;
        }

        .info-row a {
          color: #176cf0;
          font-size: 13px;
          text-decoration: none;
        }

        .info-row a:hover {
          text-decoration: underline;
        }

        .card-actions {
          display: grid;
          grid-template-columns:
            1.3fr 0.7fr 0.8fr;
          gap: 8px;
          padding: 14px 20px 19px;
        }

        .card-actions.view-only {
          grid-template-columns: 1fr;
        }

        .card-actions button {
          height: 38px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.15s;
        }

        .view-button {
          background: white;
          border: 1px solid #8ab5fa;
          color: #176cf0;
        }

        .view-button:hover {
          background: #eef5ff;
        }

        .edit-button {
          border: 1px solid #f0c33c;
          background: #ffc21a;
          color: #332800;
        }

        .edit-button:hover {
          background: #f4b700;
        }

        .delete-button {
          border: 0;
          background: #e73549;
          color: white;
        }

        .delete-button:hover {
          background: #cc2437;
        }

        .loading-container {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #738198;
        }

        .spinner {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 4px solid #dce8fa;
          border-top-color: #176cf0;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          background: white;
          border: 1px solid #e4eaf2;
          border-radius: 15px;
          padding: 65px 20px;
          text-align: center;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 0 0 7px;
        }

        .empty-state p {
          color: #748198;
          margin: 0 0 20px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 25px;
        }

        .pagination > button,
        .page-numbers button {
          height: 38px;
          min-width: 38px;
          padding: 0 12px;
          border-radius: 7px;
          border: 1px solid #dce4ef;
          background: white;
          color: #506078;
          cursor: pointer;
        }

        .pagination button:hover:not(:disabled) {
          border-color: #8ab5fa;
          color: #176cf0;
        }

        .pagination button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 5px;
        }

        .page-numbers button.active {
          background: #176cf0;
          border-color: #176cf0;
          color: white;
        }

        .institution-toast {
          position: fixed;
          top: 88px;
          right: 28px;
          z-index: 5000;
          width: min(420px, calc(100vw - 40px));
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 16px;
          border-radius: 12px;
          background: white;
          box-shadow:
            0 14px 40px
            rgba(16, 35, 66, 0.2);
          border: 1px solid #e1e7ef;
        }

        .toast-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .toast-success .toast-icon {
          background: #e4f7ed;
          color: #15915c;
        }

        .toast-error .toast-icon {
          background: #fee9ec;
          color: #d92e42;
        }

        .toast-content {
          flex: 1;
        }

        .toast-content strong {
          display: block;
          font-size: 13px;
          margin-bottom: 2px;
        }

        .toast-content span {
          color: #64728a;
          font-size: 12px;
          line-height: 1.4;
        }

        .toast-close {
          border: 0;
          background: transparent;
          color: #8995a8;
          font-size: 21px;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 4000;
          background: rgba(15, 28, 48, 0.58);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .details-modal {
          width: min(680px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: white;
          border-radius: 17px;
          box-shadow:
            0 25px 70px
            rgba(10, 25, 50, 0.28);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px;
          background:
            linear-gradient(
              135deg,
              #0f70f4,
              #1763d4
            );
          color: white;
        }

        .modal-title-wrapper {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .modal-avatar {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: rgba(
            255,
            255,
            255,
            0.17
          );
          font-weight: 800;
        }

        .modal-eyebrow {
          display: block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
          opacity: 0.8;
          margin-bottom: 5px;
        }

        .modal-header h2 {
          margin: 0 0 7px;
          font-size: 23px;
          line-height: 1.2;
        }

        .modal-abbreviation {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 5px;
          background: rgba(
            255,
            255,
            255,
            0.16
          );
          font-size: 11px;
        }

        .modal-close {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.12
          );
          color: white;
          font-size: 24px;
          cursor: pointer;
        }

        .modal-body {
          padding: 25px;
        }

        .details-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          display: flex;
          gap: 11px;
          padding: 15px;
          border-radius: 10px;
          background: #f7f9fc;
          border: 1px solid #e9edf3;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-icon {
          color: #176cf0;
          font-size: 17px;
          width: 22px;
        }

        .detail-item small {
          display: block;
          color: #8995a8;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .detail-item p,
        .detail-item a {
          margin: 0;
          color: #34435b;
          font-size: 13px;
          line-height: 1.45;
          word-break: break-word;
        }

        .detail-item a {
          color: #176cf0;
          text-decoration: none;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 17px 25px;
          border-top: 1px solid #e9edf3;
        }

        .modal-secondary-button,
        .modal-primary-button {
          height: 40px;
          padding: 0 17px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-secondary-button {
          background: white;
          border: 1px solid #dbe3ed;
          color: #53627a;
        }

        .modal-primary-button {
          background: #176cf0;
          color: white;
          border: 0;
        }

        .delete-modal {
          width: min(430px, 100%);
          background: white;
          border-radius: 17px;
          padding: 30px;
          text-align: center;
          box-shadow:
            0 25px 70px
            rgba(10, 25, 50, 0.28);
        }

        .delete-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #feecef;
          color: #d92e42;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
        }

        .delete-modal h2 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .delete-modal p {
          color: #66758d;
          font-size: 14px;
          line-height: 1.5;
          margin: 0 auto 7px;
        }

        .delete-warning {
          color: #d12d40 !important;
          font-size: 12px !important;
        }

        .delete-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
        }

        .cancel-button,
        .confirm-delete-button {
          height: 42px;
          padding: 0 19px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-button {
          background: white;
          color: #526078;
          border: 1px solid #dce4ef;
        }

        .confirm-delete-button {
          border: 0;
          background: #e73549;
          color: white;
        }

        @media (max-width: 900px) {
          .institution-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .filter-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .search-field {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 700px) {
          .institutions-page {
            padding: 25px 15px 50px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            width: 100%;
            justify-content: stretch;
          }

          .header-actions button {
            flex: 1;
          }

          .page-header h1 {
            font-size: 30px;
          }

          .statistics-grid {
            grid-template-columns: 1fr;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .search-field {
            grid-column: auto;
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .institution-grid {
            grid-template-columns: 1fr;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .detail-item.full-width {
            grid-column: auto;
          }
        }

        @media (max-width: 480px) {
          .header-actions {
            flex-direction: column;
          }

          .header-actions button {
            width: 100%;
          }

          .card-actions {
            grid-template-columns: 1fr;
          }

          .institution-toast {
            top: 75px;
            right: 15px;
            width: calc(100vw - 30px);
          }

          .delete-actions {
            flex-direction: column;
          }

          .cancel-button,
          .confirm-delete-button {
            width: 100%;
          }
        }

      `}</style>
    </div>
  );
}

// =========================================================
// DETAIL ITEM COMPONENT
// =========================================================

function DetailItem({
  icon,
  label,
  value,
  fullWidth = false,
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      className={
        fullWidth
          ? "detail-item full-width"
          : "detail-item"
      }
    >
      <span className="detail-icon">
        {icon}
      </span>

      <div>
        <small>
          {label}
        </small>

        <p>
          {value}
        </p>
      </div>
    </div>
  );
}

export default Institutions;