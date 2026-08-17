import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    getPublications,
    deletePublication,
    downloadPublication,
} from "../services/publicationService";

import "./Publications.css";


function Publications() {
    /* =========================================================
       STATE
       ========================================================= */

    const [publications, setPublications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [search, setSearch] = useState("");
    const [publicationType, setPublicationType] = useState("");
    const [status, setStatus] = useState("");
    const [year, setYear] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const publicationsPerPage = 6;

    // Download state
    const [downloadingId, setDownloadingId] = useState(null);


    /* =========================================================
       LOAD PUBLICATIONS
       ========================================================= */

    useEffect(() => {
        loadPublications();
    }, []);


    const loadPublications = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPublications();

            /*
             * API normally returns an array.
             * This also safely handles APIs returning:
             * { publications: [...] }
             * { data: [...] }
             */
            if (Array.isArray(data)) {
                setPublications(data);
            } else if (Array.isArray(data?.publications)) {
                setPublications(data.publications);
            } else if (Array.isArray(data?.data)) {
                setPublications(data.data);
            } else {
                setPublications([]);
            }
        } catch (err) {
            console.error("Unable to load publications:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load publications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    /* =========================================================
       DELETE PUBLICATION
       ========================================================= */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this publication?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deletePublication(id);

            setPublications((previous) =>
                previous.filter(
                    (publication) => publication.id !== id
                )
            );

            /*
             * If deleting the last item on a page,
             * move back to the previous page.
             */
            setCurrentPage((page) => {
                const remaining =
                    publications.length - 1;

                const maxPage = Math.max(
                    1,
                    Math.ceil(
                        remaining / publicationsPerPage
                    )
                );

                return Math.min(page, maxPage);
            });

        } catch (err) {
            console.error("Unable to delete publication:", err);

            alert(
                err.response?.data?.detail ||
                "Unable to delete publication."
            );
        }
    };


    /* =========================================================
       DOWNLOAD PUBLICATION
       ========================================================= */

    const handleDownload = async (id) => {
        try {
            setDownloadingId(id);

            const response = await downloadPublication(id);

            const blob = new Blob(
                [response.data],
                {
                    type:
                        response.headers?.["content-type"] ||
                        "application/pdf",
                }
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "publication.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(
                "Unable to download publication:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to download publication."
            );
        } finally {
            setDownloadingId(null);
        }
    };


    /* =========================================================
       FILTER OPTIONS
       ========================================================= */

    const publicationTypes = useMemo(() => {
        const types = publications
            .map(
                (publication) =>
                    publication.publication_type
            )
            .filter(Boolean);

        return [...new Set(types)].sort();
    }, [publications]);


    const publicationStatuses = useMemo(() => {
        const statuses = publications
            .map(
                (publication) =>
                    publication.status
            )
            .filter(Boolean);

        return [...new Set(statuses)].sort();
    }, [publications]);


    /* =========================================================
       FILTER + SORT
       ========================================================= */

    const filteredPublications = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        let result = publications.filter(
            (publication) => {

                /* -------------------------
                   Search
                   ------------------------- */

                const searchableText = [
                    publication.title,
                    publication.abstract,
                    publication.doi,
                    publication.journal,
                    publication.conference,
                    publication.publication_type,
                    publication.status,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(searchValue);


                /* -------------------------
                   Publication type
                   ------------------------- */

                const matchesType =
                    !publicationType ||
                    publication.publication_type ===
                        publicationType;


                /* -------------------------
                   Status
                   ------------------------- */

                const matchesStatus =
                    !status ||
                    publication.status === status;


                /* -------------------------
                   Year
                   ------------------------- */

                const matchesYear =
                    !year ||
                    String(
                        publication.publication_year
                    ) === String(year);


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesStatus &&
                    matchesYear
                );
            }
        );


        /* =====================================================
           SORT
           ===================================================== */

        result = [...result].sort(
            (a, b) => {

                if (sortBy === "newest") {
                    return (
                        Number(
                            b.publication_year || 0
                        ) -
                        Number(
                            a.publication_year || 0
                        )
                    );
                }


                if (sortBy === "oldest") {
                    return (
                        Number(
                            a.publication_year || 0
                        ) -
                        Number(
                            b.publication_year || 0
                        )
                    );
                }


                if (sortBy === "citations") {
                    return (
                        Number(
                            b.citation_count || 0
                        ) -
                        Number(
                            a.citation_count || 0
                        )
                    );
                }


                if (sortBy === "title") {
                    return String(
                        a.title || ""
                    ).localeCompare(
                        String(
                            b.title || ""
                        )
                    );
                }


                return 0;
            }
        );


        return result;

    }, [
        publications,
        search,
        publicationType,
        status,
        year,
        sortBy,
    ]);


    /* =========================================================
       PAGINATION
       ========================================================= */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredPublications.length /
                publicationsPerPage
        )
    );


    /*
     * Keep page valid when filters reduce
     * the number of results.
     */
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    const startIndex =
        (currentPage - 1) *
        publicationsPerPage;

    const endIndex = Math.min(
        startIndex + publicationsPerPage,
        filteredPublications.length
    );


    const currentPublications =
        filteredPublications.slice(
            startIndex,
            endIndex
        );


    /* =========================================================
       FILTER CHANGE
       ========================================================= */

    const resetToFirstPage = () => {
        setCurrentPage(1);
    };


    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        resetToFirstPage();
    };


    const handleTypeChange = (event) => {
        setPublicationType(
            event.target.value
        );
        resetToFirstPage();
    };


    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        resetToFirstPage();
    };


    const handleYearChange = (event) => {
        setYear(event.target.value);
        resetToFirstPage();
    };


    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        resetToFirstPage();
    };


    /* =========================================================
       CLEAR FILTERS
       ========================================================= */

    const clearFilters = () => {
        setSearch("");
        setPublicationType("");
        setStatus("");
        setYear("");
        setSortBy("newest");
        setCurrentPage(1);
    };


    const hasActiveFilters =
        search ||
        publicationType ||
        status ||
        year ||
        sortBy !== "newest";


    /* =========================================================
       PAGINATION CONTROLS
       ========================================================= */

    const goToPage = (page) => {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    const getPageNumbers = () => {
        const pages = [];

        /*
         * For small number of pages show everything.
         */
        if (totalPages <= 7) {
            for (
                let i = 1;
                i <= totalPages;
                i++
            ) {
                pages.push(i);
            }

            return pages;
        }


        /*
         * Always show first page.
         */
        pages.push(1);


        /*
         * Left ellipsis.
         */
        if (currentPage > 4) {
            pages.push("...");
        }


        /*
         * Pages around current page.
         */
        const start = Math.max(
            2,
            currentPage - 1
        );

        const end = Math.min(
            totalPages - 1,
            currentPage + 1
        );


        for (
            let i = start;
            i <= end;
            i++
        ) {
            pages.push(i);
        }


        /*
         * Right ellipsis.
         */
        if (
            currentPage <
            totalPages - 3
        ) {
            pages.push("...");
        }


        /*
         * Always show last page.
         */
        pages.push(totalPages);


        return pages;
    };


    /* =========================================================
       LOADING
       ========================================================= */

    if (loading) {
        return (
            <div className="publications-page">

                <div className="publications-header">

                    <div className="publications-header-content">

                        <div className="publications-eyebrow">
                            📚 Research Repository
                        </div>

                        <h1 className="publications-title">
                            Publications
                        </h1>

                        <p className="publications-subtitle">
                            Explore and manage research
                            publications across the network.
                        </p>

                    </div>

                </div>


                <div
                    className="publications-empty"
                    style={{ borderStyle: "solid" }}
                >

                    <div className="spinner-border text-primary">
                    </div>

                    <h3 style={{ marginTop: "18px" }}>
                        Loading publications...
                    </h3>

                    <p>
                        Please wait while we retrieve
                        the research repository.
                    </p>

                </div>

            </div>
        );
    }


    /* =========================================================
       ERROR
       ========================================================= */

    if (error) {
        return (
            <div className="publications-page">

                <div className="publications-header">

                    <div className="publications-header-content">

                        <div className="publications-eyebrow">
                            📚 Research Repository
                        </div>

                        <h1 className="publications-title">
                            Publications
                        </h1>

                        <p className="publications-subtitle">
                            Explore and manage research
                            publications across the network.
                        </p>

                    </div>

                    <Link
                        to="/publications/create"
                        className="publications-add-btn"
                    >
                        + Add Publication
                    </Link>

                </div>


                <div className="publications-empty">

                    <div className="publications-empty-icon">
                        ⚠
                    </div>

                    <h3>
                        Unable to load publications
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="publication-action publication-action-primary"
                        style={{
                            marginTop: "18px",
                        }}
                        onClick={loadPublications}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    /* =========================================================
       MAIN UI
       ========================================================= */

    return (
        <div className="publications-page">

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="publications-header">

                <div className="publications-header-content">

                    <div className="publications-eyebrow">
                        📚 Publication Repository
                    </div>

                    <h1 className="publications-title">
                        Publications
                    </h1>

                    <p className="publications-subtitle">
                        Explore and manage research
                        publications across the network.
                    </p>

                </div>


                <Link
                    to="/publications/create"
                    className="publications-add-btn"
                >
                    <span>+</span>
                    Add Publication
                </Link>

            </div>


            {/* =================================================
                FILTER PANEL
                ================================================= */}

            <div className="publications-filter">

                <div className="publications-filter-header">

                    <div>

                        <h2 className="publications-filter-title">
                            Search & Filter
                        </h2>

                        <p className="publications-filter-subtitle">
                            Find publications quickly using
                            the available filters.
                        </p>

                    </div>


                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="publication-action publication-action-secondary"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}

                </div>


                <div className="publications-filter-grid">

                    {/* Search */}

                    <div className="publications-field">

                        <label htmlFor="publication-search">
                            Search
                        </label>

                        <input
                            id="publication-search"
                            type="text"
                            value={search}
                            onChange={
                                handleSearchChange
                            }
                            placeholder="Search title, DOI, journal, conference..."
                        />

                    </div>


                    {/* Publication Type */}

                    <div className="publications-field">

                        <label htmlFor="publication-type">
                            Publication Type
                        </label>

                        <select
                            id="publication-type"
                            value={publicationType}
                            onChange={
                                handleTypeChange
                            }
                        >

                            <option value="">
                                All types
                            </option>

                            {publicationTypes.map(
                                (type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Status */}

                    <div className="publications-field">

                        <label htmlFor="publication-status">
                            Status
                        </label>

                        <select
                            id="publication-status"
                            value={status}
                            onChange={
                                handleStatusChange
                            }
                        >

                            <option value="">
                                All statuses
                            </option>

                            {publicationStatuses.map(
                                (itemStatus) => (
                                    <option
                                        key={itemStatus}
                                        value={itemStatus}
                                    >
                                        {itemStatus}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Year */}

                    <div className="publications-field">

                        <label htmlFor="publication-year">
                            Year
                        </label>

                        <input
                            id="publication-year"
                            type="number"
                            min="1900"
                            max="2100"
                            value={year}
                            onChange={
                                handleYearChange
                            }
                            placeholder="e.g. 2026"
                        />

                    </div>


                    {/* Sort */}

                    <div className="publications-field">

                        <label htmlFor="publication-sort">
                            Sort By
                        </label>

                        <select
                            id="publication-sort"
                            value={sortBy}
                            onChange={
                                handleSortChange
                            }
                        >

                            <option value="newest">
                                Newest first
                            </option>

                            <option value="oldest">
                                Oldest first
                            </option>

                            <option value="citations">
                                Most cited
                            </option>

                            <option value="title">
                                Title A–Z
                            </option>

                        </select>

                    </div>

                </div>

            </div>


            {/* =================================================
                RESULTS TOOLBAR
                ================================================= */}

            <div className="publications-results">

                <div className="publications-result-count">

                    <strong>
                        {filteredPublications.length}
                    </strong>{" "}
                    {filteredPublications.length === 1
                        ? "publication"
                        : "publications"}

                </div>


                {filteredPublications.length > 0 && (
                    <div className="publications-result-range">

                        Showing{" "}
                        <strong>
                            {startIndex + 1}
                        </strong>
                        {" – "}
                        <strong>
                            {endIndex}
                        </strong>

                    </div>
                )}

            </div>


            {/* =================================================
                EMPTY SEARCH RESULT
                ================================================= */}

            {filteredPublications.length === 0 ? (

                <div className="publications-empty">

                    <div className="publications-empty-icon">
                        🔎
                    </div>

                    <h3>
                        No publications found
                    </h3>

                    <p>
                        Try changing your search or
                        filter criteria.
                    </p>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="publication-action publication-action-primary"
                            style={{
                                marginTop: "18px",
                            }}
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}

                </div>

            ) : (

                <>
                    {/* =========================================
                        PUBLICATION CARDS
                        ========================================= */}

                    <div className="publications-grid">

                        {currentPublications.map(
                            (publication) => {

                                const type =
                                    publication.publication_type ||
                                    "Publication";

                                const publicationStatus =
                                    publication.status ||
                                    "Unknown";

                                const citationCount =
                                    Number(
                                        publication.citation_count ||
                                            0
                                    );


                                return (
                                    <article
                                        className="publication-card"
                                        key={publication.id}
                                    >

                                        {/* ---------------------
                                            TOP META
                                            --------------------- */}

                                        <div className="publication-card-top">

                                            <div className="publication-meta">

                                                <span className="publication-type">
                                                    {type}
                                                </span>

                                                <span className="publication-year">
                                                    {publication.publication_year ||
                                                        "—"}
                                                </span>

                                            </div>


                                            <span className="publication-status">
                                                {
                                                    publicationStatus
                                                }
                                            </span>

                                        </div>


                                        {/* ---------------------
                                            TITLE
                                            --------------------- */}

                                        <Link
                                            to={`/publications/${publication.id}`}
                                            className="publication-title"
                                        >
                                            {
                                                publication.title ||
                                                "Untitled Publication"
                                            }
                                        </Link>


                                        {/* ---------------------
                                            ABSTRACT
                                            --------------------- */}

                                        <p className="publication-abstract">

                                            {publication.abstract ||
                                                "No abstract available for this publication."}

                                        </p>


                                        {/* ---------------------
                                            INFORMATION
                                            --------------------- */}

                                        <div className="publication-info">

                                            {publication.journal && (
                                                <div className="publication-info-row">

                                                    <span className="publication-info-label">
                                                        Journal
                                                    </span>

                                                    <span className="publication-info-value">
                                                        {
                                                            publication.journal
                                                        }
                                                    </span>

                                                </div>
                                            )}


                                            {publication.conference && (
                                                <div className="publication-info-row">

                                                    <span className="publication-info-label">
                                                        Conference
                                                    </span>

                                                    <span className="publication-info-value">
                                                        {
                                                            publication.conference
                                                        }
                                                    </span>

                                                </div>
                                            )}


                                            {publication.doi && (
                                                <div className="publication-info-row">

                                                    <span className="publication-info-label">
                                                        DOI
                                                    </span>

                                                    <a
                                                        href={
                                                            publication.doi.startsWith(
                                                                "http"
                                                            )
                                                                ? publication.doi
                                                                : `https://doi.org/${publication.doi}`
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="publication-info-value publication-doi"
                                                    >
                                                        {
                                                            publication.doi
                                                        }
                                                    </a>

                                                </div>
                                            )}

                                        </div>


                                        {/* ---------------------
                                            CITATIONS
                                            --------------------- */}

                                        <div className="publication-citations">

                                            <span>
                                                📑
                                            </span>

                                            <strong>
                                                {
                                                    citationCount
                                                }
                                            </strong>

                                            <span>
                                                {citationCount ===
                                                1
                                                    ? "citation"
                                                    : "citations"}
                                            </span>

                                        </div>


                                        {/* ---------------------
                                            ACTIONS
                                            --------------------- */}

                                        <div className="publication-actions">

                                            {/* Open Link */}

                                            {publication.url && (
                                                <a
                                                    href={
                                                        publication.url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="publication-action publication-action-secondary"
                                                >
                                                    Open Link
                                                </a>
                                            )}


                                            {/* View Details */}

                                            <Link
                                                to={`/publications/${publication.id}`}
                                                className="publication-action publication-action-primary"
                                            >
                                                View Details
                                            </Link>


                                            {/* Download */}

                                            {publication.file_name && (
                                                <button
                                                    type="button"
                                                    className="publication-action publication-action-success"
                                                    onClick={() =>
                                                        handleDownload(
                                                            publication.id
                                                        )
                                                    }
                                                    disabled={
                                                        downloadingId ===
                                                        publication.id
                                                    }
                                                >
                                                    {downloadingId ===
                                                    publication.id
                                                        ? "Downloading..."
                                                        : "Download PDF"}
                                                </button>
                                            )}


                                            {/* Edit */}

                                            <Link
                                                to={`/publications/${publication.id}/edit`}
                                                className="publication-action publication-action-warning"
                                            >
                                                Edit
                                            </Link>


                                            {/* Delete */}

                                            <button
                                                type="button"
                                                className="publication-action publication-action-danger"
                                                onClick={() =>
                                                    handleDelete(
                                                        publication.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>


                    {/* =========================================
                        PAGINATION
                        ========================================= */}

                    {totalPages > 1 && (

                        <div className="publications-pagination">

                            {/* Previous */}

                            <button
                                type="button"
                                className="publications-page-btn"
                                disabled={
                                    currentPage === 1
                                }
                                onClick={() =>
                                    goToPage(
                                        currentPage - 1
                                    )
                                }
                                aria-label="Previous page"
                            >
                                ‹
                            </button>


                            {/* Page Numbers */}

                            {getPageNumbers().map(
                                (page, index) => {

                                    if (
                                        page === "..."
                                    ) {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="publications-page-btn"
                                                style={{
                                                    cursor:
                                                        "default",
                                                    border:
                                                        "none",
                                                    background:
                                                        "transparent",
                                                }}
                                            >
                                                …
                                            </span>
                                        );
                                    }


                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            className={`publications-page-btn ${
                                                currentPage ===
                                                page
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                goToPage(
                                                    page
                                                )
                                            }
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                            )}


                            {/* Next */}

                            <button
                                type="button"
                                className="publications-page-btn"
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                                onClick={() =>
                                    goToPage(
                                        currentPage + 1
                                    )
                                }
                                aria-label="Next page"
                            >
                                ›
                            </button>

                        </div>

                    )}

                </>

            )}

        </div>
    );
}


export default Publications;