import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    getResearchers,
    deleteResearcher,
} from "../../services/researcherService";

import { getCurrentUser } from "../../services/authService";

import "./Researchers.css";

export default function Researchers() {

    const navigate = useNavigate();

    const [researchers, setResearchers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const [currentUser, setCurrentUser] = useState(null);

    const pageSize = 8;


    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {
        loadResearchers();
        loadCurrentUser();
    }, []);


    async function loadResearchers() {

        try {

            setLoading(true);
            setError("");

            const data = await getResearchers();

            setResearchers(
                Array.isArray(data) ? data : []
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to load researchers. Please try again."
            );

        } finally {

            setLoading(false);

        }
    }


    async function loadCurrentUser() {

        try {

            const user = await getCurrentUser();

            console.log("CURRENT USER:", user);
            console.log("CURRENT USER ID:", user?.id);
            console.log("CURRENT USER ROLE:", user?.role);

            setCurrentUser(user);

        } catch (err) {

            console.error(
                "Unable to load current user:",
                err
            );

        }
    }


    // ============================================================
    // AUTHORIZATION HELPERS
    // ============================================================

    /*
     * Normalize the role so the UI works whether the backend returns
     * SYSTEM_ADMIN, system_admin, System Admin, etc.
     */
    const normalizedRole = String(
        currentUser?.role ||
        currentUser?.user_role ||
        currentUser?.role_name ||
        ""
    )
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

    /*
     * Researchers are read-only on this page.
     *
     * System Admin:
     *   - Add researcher
     *   - Edit researcher
     *   - Delete researcher
     *
     * Institution Admin:
     *   - Keep the existing management access
     *
     * Researcher / Reviewer:
     *   - View/search only
     */
    const canManageResearchers =
    normalizedRole === "SYSTEM_ADMIN" ||
    normalizedRole === "SYSTEMADMIN" ||
    normalizedRole === "INSTITUTION_ADMIN" ||
    normalizedRole === "INSTITUTIONADMIN";


    const isAdmin = () => canManageResearchers;


    const isOwnProfile = (researcher) => {

        if (!currentUser || !researcher) {
            return false;
        }

        return (
            String(currentUser.id) ===
            String(researcher.user_id)
        );
    };


    const canEditResearcher = (researcher) => {

        // Admins can edit everyone
        if (isAdmin()) {
            return true;
        }

        // A researcher can edit only their own profile
        if (
            currentUser?.role === "RESEARCHER" &&
            isOwnProfile(researcher)
        ) {
            return true;
        }

        return false;
    };


    const canDeleteResearcher = (researcher) => {

        // ========================================================
        // SYSTEM ADMIN
        // System admins can delete ANY researcher profile.
        // ========================================================

        if (normalizedRole === "SYSTEM_ADMIN") {
            return true;
        }

        // ========================================================
        // OTHER ADMINS
        // ========================================================

        if (isAdmin()) {
            return true;
        }

        // ========================================================
        // RESEARCHER
        // A researcher can delete only their own profile.
        // ========================================================

        if (
            currentUser?.role &&
            String(currentUser.role)
                .trim()
                .toUpperCase()
                .replace(/[\s-]+/g, "_") === "RESEARCHER" &&
            isOwnProfile(researcher)
        ) {
            return true;
        }

        return false;
    };


    // ============================================================
    // ADD RESEARCHER
    // ============================================================

    const handleAddResearcher = () => {

        if (isAdmin()) {

            navigate("/researchers/create");

            return;
        }

        alert(
            "Only System Admin and Institution Admin are allowed to add researchers."
        );
    };


    // ============================================================
    // EDIT RESEARCHER
    // ============================================================

    const handleEditResearcher = (researcher) => {

        if (!canEditResearcher(researcher)) {

            alert(
                "You are not allowed to edit this researcher profile."
            );

            return;
        }


        navigate(
            `/researchers/edit/${researcher.id}`
        );
    };


    // ============================================================
    // SEARCH
    // ============================================================

    const filtered = useMemo(() => {

        const term = search.trim().toLowerCase();

        if (!term) return researchers;

        return researchers.filter((r) => {

            const name = [
                r.first_name,
                r.last_name,
            ]
                .filter(Boolean)
                .join(" ");


            return [
                name,
                r.phone,
                r.orcid,
                r.skills,
                r.interests,
                r.bio,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term);

        });

    }, [researchers, search]);


    useEffect(() => {

        setPage(1);

    }, [search]);


    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );


    const safePage = Math.min(
        page,
        totalPages
    );


    const paginated = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalPublications =
        researchers.reduce(
            (sum, r) =>
                sum +
                (
                    Array.isArray(r.publications)
                        ? r.publications.length
                        : 0
                ),
            0
        );


    const experienced =
        researchers.filter(
            r =>
                Number(r.experience || 0) > 0
        ).length;


    // ============================================================
    // HELPERS
    // ============================================================

    const fullName = (r) =>
        [
            r.first_name,
            r.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        "Unnamed Researcher";


    const initials = (r) =>
        (
            (r.first_name?.[0] || "") +
            (r.last_name?.[0] || "")
        )
            .toUpperCase() ||
        "?";


    // ============================================================
    // DELETE
    // ============================================================

    async function handleDelete(researcher) {

        // Check authorization BEFORE showing confirmation
        if (!canDeleteResearcher(researcher)) {

            alert(
                "You are not allowed to delete this researcher profile."
            );

            return;
        }


        if (
            !window.confirm(
                `Delete the researcher profile for ${fullName(
                    researcher
                )}? This action cannot be undone.`
            )
        ) {
            return;
        }


        try {

            setDeletingId(researcher.id);
            setError("");

            await deleteResearcher(
                researcher.id
            );


            setResearchers(
                current =>
                    current.filter(
                        r =>
                            r.id !==
                            researcher.id
                    )
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to delete this researcher."
            );

        } finally {

            setDeletingId(null);

        }
    }


    // ============================================================
    // UI
    // ============================================================

    return (

        <main className="researchers-page">

            <div className="researchers-container">


                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="researchers-hero">

                    <div>

                        <div className="researchers-eyebrow">

                            <span className="eyebrow-dot" />

                            Research Community

                        </div>


                        <h1>
                            Researchers
                        </h1>


                        <p>
                            Explore researcher profiles,
                            expertise, experience, and
                            academic activity across SCNA.
                        </p>

                    </div>


                    {/* ADD RESEARCHER
                        Hidden for Researcher/Reviewer accounts.
                        Visible for System Admin and Institution Admin. */}

                    {canManageResearchers && (
                        <button
                            type="button"
                            className="researcher-add-btn"
                            onClick={handleAddResearcher}
                        >
                            <span className="add-icon">
                                +
                            </span>

                            Add Researcher
                        </button>
                    )}

                </section>


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section className="researcher-stats">

                    <Stat
                        icon="bi-people-fill"
                        tone="blue"
                        label="Total Researchers"
                        value={researchers.length}
                    />


                    <Stat
                        icon="bi-award-fill"
                        tone="green"
                        label="With Experience"
                        value={experienced}
                    />


                    <Stat
                        icon="bi-journal-richtext"
                        tone="purple"
                        label="Linked Publications"
                        value={totalPublications}
                    />

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="researcher-alert">

                        <div>

                            <strong>
                                Something went wrong
                            </strong>

                            <span>
                                {error}
                            </span>

                        </div>


                        <button
                            type="button"
                            onClick={loadResearchers}
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* ==================================================
                    RESEARCH DIRECTORY
                ================================================== */}

                <section className="researchers-panel">


                    <div className="researchers-toolbar">

                        <div>

                            <h2>
                                Research Directory
                            </h2>


                            <p>

                                {search
                                    ? `${filtered.length} result${
                                          filtered.length === 1
                                              ? ""
                                              : "s"
                                      } matching "${search}"`

                                    : `Showing ${
                                          filtered.length
                                      } researcher${
                                          filtered.length === 1
                                              ? ""
                                              : "s"
                                      }`

                                }

                            </p>

                        </div>


                        <div className="researcher-search">

                            <i className="bi bi-search" />


                            <input
                                type="search"
                                value={search}
                                onChange={e =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by name, ORCID, skills..."
                                aria-label="Search researchers"
                            />


                            {search && (

                                <button
                                    type="button"
                                    className="search-clear"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    ×
                                </button>

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        TABLE
                    ================================================== */}

                    <div className="researchers-table-wrap">


                        {loading ? (

                            <div className="researchers-loading">

                                <div className="researcher-spinner" />

                                <strong>
                                    Loading researchers
                                </strong>

                                <span>
                                    Fetching the latest profiles...
                                </span>

                            </div>


                        ) : paginated.length === 0 ? (

                            <div className="researchers-empty">

                                <div className="empty-icon">

                                    <i className="bi bi-person-x" />

                                </div>


                                <h3>

                                    {search
                                        ? "No researchers found"
                                        : "No researcher profiles yet"}

                                </h3>


                                <p>

                                    {search
                                        ? "Try a different name, skill, ORCID, or keyword."
                                        : "Add the first researcher profile to start building the directory."}

                                </p>


                                {search ? (

                                    <button
                                        type="button"
                                        className="empty-action"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                    >
                                        Clear Search
                                    </button>

                                ) : (

                                    canManageResearchers && (
                                        <button
                                            type="button"
                                            className="empty-action"
                                            onClick={
                                                handleAddResearcher
                                            }
                                        >
                                            Add Researcher
                                        </button>
                                    )

                                )}

                            </div>


                        ) : (

                            <table className="researchers-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Researcher
                                        </th>

                                        <th>
                                            Experience
                                        </th>

                                        <th>
                                            Contact
                                        </th>

                                        <th>
                                            Research Profile
                                        </th>

                                        <th className="actions-heading">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {paginated.map(r => (

                                        <tr key={r.id}>


                                            {/* RESEARCHER */}

                                            <td>

                                                <div className="researcher-identity">

                                                    <div className="researcher-avatar">

                                                        {initials(r)}

                                                    </div>


                                                    <div className="researcher-name-block">

                                                        <Link
                                                            to={`/researchers/${r.id}`}
                                                            className="researcher-name"
                                                        >
                                                            {fullName(r)}
                                                        </Link>


                                                        <span>
                                                            Researcher
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* EXPERIENCE */}

                                            <td>

                                                <div className="experience-cell">

                                                    <strong>
                                                        {Number(
                                                            r.experience || 0
                                                        )}
                                                    </strong>

                                                    <span>
                                                        years
                                                    </span>

                                                </div>

                                            </td>


                                            {/* CONTACT */}

                                            <td>

                                                <div className="contact-cell">

                                                    {r.phone ? (

                                                        <>
                                                            <i className="bi bi-telephone" />

                                                            <span>
                                                                {r.phone}
                                                            </span>
                                                        </>

                                                    ) : (

                                                        <span className="muted-value">
                                                            No phone
                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            {/* PROFILE */}

                                            <td>

                                                <div className="profile-cell">

                                                    {r.orcid && (

                                                        <span className="profile-badge">

                                                            <i className="bi bi-patch-check-fill" />

                                                            ORCID

                                                        </span>

                                                    )}


                                                    {Array.isArray(
                                                        r.publications
                                                    ) &&
                                                    r.publications.length >
                                                        0 ? (

                                                        <span className="publication-count">

                                                            <i className="bi bi-file-earmark-text" />

                                                            {
                                                                r.publications
                                                                    .length
                                                            }{" "}

                                                            publication
                                                            {
                                                                r.publications
                                                                    .length ===
                                                                1
                                                                    ? ""
                                                                    : "s"
                                                            }

                                                        </span>

                                                    ) : (

                                                        !r.orcid && (

                                                            <span className="muted-value">

                                                                Profile incomplete

                                                            </span>

                                                        )

                                                    )}

                                                </div>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>
                                                <div className="researcher-actions">

                                                    {/* VIEW
                                                        Visible to every role. */}
                                                    <Link
                                                        to={`/researchers/${r.id}`}
                                                        className="action-btn view"
                                                    >
                                                        <i className="bi bi-eye" />
                                                        <span>
                                                            View
                                                        </span>
                                                    </Link>

                                                    {/* EDIT
                                                        Hidden for Researcher/Reviewer. */}
                                                    {canManageResearchers && (
                                                        <button
                                                            type="button"
                                                            className="action-btn edit"
                                                            onClick={() =>
                                                                handleEditResearcher(r)
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square" />
                                                            <span>
                                                                Edit
                                                            </span>
                                                        </button>
                                                    )}

                                                    {/* DELETE
                                                        Hidden for Researcher/Reviewer. */}
                                                    {canManageResearchers && (
                                                        <button
                                                            type="button"
                                                            className="action-btn delete"
                                                            disabled={deletingId === r.id}
                                                            onClick={() =>
                                                                handleDelete(r)
                                                            }
                                                        >
                                                            {deletingId === r.id ? (
                                                                <span className="mini-spinner" />
                                                            ) : (
                                                                <i className="bi bi-trash3" />
                                                            )}

                                                            <span>
                                                                Delete
                                                            </span>
                                                        </button>
                                                    )}

                                                </div>
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                    </div>


                    {/* ==================================================
                        PAGINATION
                    ================================================== */}

                    {!loading &&
                        filtered.length > 0 && (

                            <div className="researchers-footer">

                                <span>
                                    Page {safePage} of {totalPages}
                                </span>


                                <div className="pagination-controls">

                                    <button
                                        type="button"
                                        disabled={
                                            safePage === 1
                                        }
                                        onClick={() =>
                                            setPage(
                                                p =>
                                                    Math.max(
                                                        1,
                                                        p - 1
                                                    )
                                            )
                                        }
                                    >

                                        <i className="bi bi-chevron-left" />

                                        Previous

                                    </button>


                                    <div className="page-number">
                                        {safePage}
                                    </div>


                                    <button
                                        type="button"
                                        disabled={
                                            safePage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setPage(
                                                p =>
                                                    Math.min(
                                                        totalPages,
                                                        p + 1
                                                    )
                                            )
                                        }
                                    >

                                        Next

                                        <i className="bi bi-chevron-right" />

                                    </button>

                                </div>

                            </div>

                        )}

                </section>

            </div>

        </main>

    );
}


// ============================================================
// STAT COMPONENT
// ============================================================

function Stat({
    icon,
    tone,
    label,
    value,
}) {

    return (

        <div className="researcher-stat-card">

            <div
                className={`stat-icon ${tone}`}
            >

                <i
                    className={`bi ${icon}`}
                />

            </div>


            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>

    );
}