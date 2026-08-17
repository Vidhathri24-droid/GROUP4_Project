import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    getCitations,
    deleteCitation,
    exportBibtex,
} from "../../services/citationService";

import "./Citations.css";


function Citations() {
    /* =========================================================
       STATE
    ========================================================= */

    const [citations, setCitations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [search, setSearch] = useState("");
    const [citationStyle, setCitationStyle] = useState("");
    const [year, setYear] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const citationsPerPage = 6;

    // Export state
    const [exportingId, setExportingId] = useState(null);


    /* =========================================================
       LOAD CITATIONS
    ========================================================= */

    useEffect(() => {
        loadCitations();
    }, []);


    const loadCitations = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCitations();

            if (Array.isArray(data)) {
                setCitations(data);
            } else if (Array.isArray(data?.citations)) {
                setCitations(data.citations);
            } else if (Array.isArray(data?.data)) {
                setCitations(data.data);
            } else {
                setCitations([]);
            }

        } catch (err) {
            console.error("Unable to load citations:", err);

            setError(
                err.response?.data?.detail ||
                "Unable to load citations. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    /* =========================================================
       DELETE
    ========================================================= */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this citation?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteCitation(id);

            setCitations((previous) =>
                previous.filter(
                    (citation) => citation.id !== id
                )
            );

            setCurrentPage((page) => {
                const remaining = citations.length - 1;

                const maxPage = Math.max(
                    1,
                    Math.ceil(
                        remaining / citationsPerPage
                    )
                );

                return Math.min(page, maxPage);
            });

        } catch (err) {
            console.error("Unable to delete citation:", err);

            alert(
                err.response?.data?.detail ||
                "Unable to delete citation."
            );
        }
    };


    /* =========================================================
       BIBTEX EXPORT
    ========================================================= */

    const handleBibtex = async (id) => {
        try {
            setExportingId(id);

            const response = await exportBibtex(id);

            /*
             * Handle different possible API responses.
             */

            const content =
                typeof response === "string"
                    ? response
                    : response?.data;

            if (!content) {
                throw new Error(
                    "No BibTeX data received."
                );
            }

            const blob = new Blob(
                [content],
                {
                    type: "application/x-bibtex",
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download = "citation.bib";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(
                "Unable to export BibTeX:",
                err
            );

            alert(
                err.response?.data?.detail ||
                "Unable to export BibTeX."
            );
        } finally {
            setExportingId(null);
        }
    };


    /* =========================================================
       FILTER OPTIONS
    ========================================================= */

    const citationStyles = useMemo(() => {
        const styles = citations
            .map(
                (citation) =>
                    citation.citation_style
            )
            .filter(Boolean);

        return [...new Set(styles)].sort();
    }, [citations]);


    /* =========================================================
       FILTER + SORT
    ========================================================= */

    const filteredCitations = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        let result = citations.filter(
            (citation) => {

                const searchableText = [
                    citation.title,
                    citation.authors,
                    citation.journal,
                    citation.doi,
                    citation.url,
                    citation.citation_style,
                    citation.formatted_citation,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );


                const matchesStyle =
                    !citationStyle ||
                    citation.citation_style ===
                        citationStyle;


                const matchesYear =
                    !year ||
                    String(
                        citation.year || ""
                    ) === String(year);


                return (
                    matchesSearch &&
                    matchesStyle &&
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


                if (sortBy === "title") {
                    return String(
                        a.title || ""
                    ).localeCompare(
                        String(
                            b.title || ""
                        )
                    );
                }


                if (sortBy === "authors") {
                    return String(
                        a.authors || ""
                    ).localeCompare(
                        String(
                            b.authors || ""
                        )
                    );
                }


                return 0;
            }
        );


        return result;

    }, [
        citations,
        search,
        citationStyle,
        year,
        sortBy,
    ]);


    /* =========================================================
       PAGINATION
    ========================================================= */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredCitations.length /
                citationsPerPage
        )
    );


    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    const startIndex =
        (currentPage - 1) *
        citationsPerPage;


    const endIndex = Math.min(
        startIndex + citationsPerPage,
        filteredCitations.length
    );


    const currentCitations =
        filteredCitations.slice(
            startIndex,
            endIndex
        );


    /* =========================================================
       RESET PAGE WHEN FILTER CHANGES
    ========================================================= */

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };


    const handleStyleChange = (event) => {
        setCitationStyle(
            event.target.value
        );

        setCurrentPage(1);
    };


    const handleYearChange = (event) => {
        setYear(event.target.value);
        setCurrentPage(1);
    };


    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        setCurrentPage(1);
    };


    /* =========================================================
       CLEAR FILTERS
    ========================================================= */

    const clearFilters = () => {
        setSearch("");
        setCitationStyle("");
        setYear("");
        setSortBy("newest");
        setCurrentPage(1);
    };


    const hasActiveFilters =
        search ||
        citationStyle ||
        year ||
        sortBy !== "newest";


    /* =========================================================
       PAGE NAVIGATION
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


        pages.push(1);


        if (currentPage > 4) {
            pages.push("...");
        }


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


        if (
            currentPage <
            totalPages - 3
        ) {
            pages.push("...");
        }


        pages.push(totalPages);

        return pages;
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div className="citations-page">

                <div className="citations-header">

                    <div>

                        <h1>
                            Citation Management
                        </h1>

                        <p>
                            Manage and organize
                            publication citations.
                        </p>
                    </div>

                </div>


                <div className="citations-empty">

                    <div className="citations-empty-icon">
                        ⏳
                    </div>

                    <h3>
                        Loading citations...
                    </h3>

                    <p>
                        Retrieving citation records
                        from the research network.
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
            <div className="citations-page">

                <div className="citations-header">

                    <div>
                        <div className="citations-eyebrow">
                            📚 Research Network
                        </div>

                        <h1>
                            Citation Management
                        </h1>

                        <p>
                            Manage and organize
                            publication citations.
                        </p>
                    </div>

                    <div className="citations-header-actions">

                        <button
                            type="button"
                            className="citation-btn citation-btn-outline"
                            onClick={loadCitations}
                        >
                            ↻ Refresh
                        </button>

                        <Link
                            to="/citations/add"
                            className="citation-btn citation-btn-primary"
                        >
                            + Add Citation
                        </Link>

                    </div>

                </div>


                <div className="citations-empty">

                    <div className="citations-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load citations
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="citation-btn citation-btn-primary"
                        onClick={loadCitations}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    /* =========================================================
       MAIN
    ========================================================= */

    return (
        <div className="citations-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="citations-header">

                <div>

                    <div className="citations-eyebrow">
                        📚 Research Network
                    </div>

                    <h1>
                        Citation Management
                    </h1>

                    <p>
                        Manage, organize and export
                        publication citations.
                    </p>

                </div>


                <div className="citations-header-actions">

                    <button
                        type="button"
                        className="citation-btn citation-btn-outline"
                        onClick={loadCitations}
                    >
                        ↻ Refresh
                    </button>

                    <Link
                        to="/citations/add"
                        className="citation-btn citation-btn-primary"
                    >
                        + Add Citation
                    </Link>

                </div>

            </div>


            {/* =================================================
                FILTER PANEL
            ================================================= */}

            <section className="citations-filter-card">

                <div className="citations-filter-heading">

                    <div>

                        <h2>
                            Search & Filter
                        </h2>

                        <p>
                            Find citations using title,
                            author, journal, DOI or
                            citation style.
                        </p>

                    </div>


                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="citation-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}

                </div>


                <div className="citations-filter-grid">

                    {/* Search */}

                    <div className="citation-field citation-search-field">

                        <label>
                            Search
                        </label>

                        <div className="citation-input-wrapper">

                            <span>
                                🔎
                            </span>

                            <input
                                type="text"
                                value={search}
                                onChange={
                                    handleSearchChange
                                }
                                placeholder="Search title, authors, journal, DOI..."
                            />

                        </div>

                    </div>


                    {/* Citation Style */}

                    <div className="citation-field">

                        <label>
                            Citation Style
                        </label>

                        <select
                            value={citationStyle}
                            onChange={
                                handleStyleChange
                            }
                        >

                            <option value="">
                                All styles
                            </option>

                            {citationStyles.map(
                                (style) => (
                                    <option
                                        key={style}
                                        value={style}
                                    >
                                        {style}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    {/* Year */}

                    <div className="citation-field">

                        <label>
                            Year
                        </label>

                        <input
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

                    <div className="citation-field">

                        <label>
                            Sort By
                        </label>

                        <select
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

                            <option value="title">
                                Title A–Z
                            </option>

                            <option value="authors">
                                Author A–Z
                            </option>

                        </select>

                    </div>

                </div>

            </section>


            {/* =================================================
                RESULTS BAR
            ================================================= */}

            <div className="citations-results-bar">

                <div className="citations-count">

                    <strong>
                        {filteredCitations.length}
                    </strong>

                    <span>
                        {filteredCitations.length === 1
                            ? " citation"
                            : " citations"}
                    </span>

                </div>


                {filteredCitations.length > 0 && (
                    <div className="citations-range">

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
                EMPTY RESULT
            ================================================= */}

            {filteredCitations.length === 0 ? (

                <div className="citations-empty">

                    <div className="citations-empty-icon">
                        🔎
                    </div>

                    <h3>
                        No citations found
                    </h3>

                    <p>
                        Try changing your search
                        or filter criteria.
                    </p>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="citation-btn citation-btn-primary"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}

                </div>

            ) : (

                <>
                    {/* =========================================
                        CITATION GRID
                    ========================================= */}

                    <div className="citations-grid">

                        {currentCitations.map(
                            (citation) => (

                                <article
                                    className="citation-card"
                                    key={citation.id}
                                >

                                    {/* Card Header */}

                                    <div className="citation-card-header">

                                        <div className="citation-card-meta">

                                            <span className="citation-year">
                                                {citation.year ||
                                                    "—"}
                                            </span>

                                            {citation.citation_style && (
                                                <span className="citation-style-badge">
                                                    {
                                                        citation.citation_style
                                                    }
                                                </span>
                                            )}

                                        </div>

                                    </div>


                                    {/* Title */}

                                    <Link
                                        to={`/citations/${citation.id}`}
                                        className="citation-title"
                                    >
                                        {
                                            citation.title ||
                                            "Untitled Citation"
                                        }
                                    </Link>


                                    {/* Authors */}

                                    {citation.authors && (
                                        <div className="citation-detail">

                                            <span className="citation-detail-label">
                                                Authors
                                            </span>

                                            <span className="citation-detail-value">
                                                {
                                                    citation.authors
                                                }
                                            </span>

                                        </div>
                                    )}


                                    {/* Journal */}

                                    {citation.journal && (
                                        <div className="citation-detail">

                                            <span className="citation-detail-label">
                                                Journal
                                            </span>

                                            <span className="citation-detail-value">
                                                {
                                                    citation.journal
                                                }
                                            </span>

                                        </div>
                                    )}


                                    {/* Year */}

                                    <div className="citation-detail">

                                        <span className="citation-detail-label">
                                            Year
                                        </span>

                                        <span className="citation-detail-value">
                                            {citation.year ||
                                                "—"}
                                        </span>

                                    </div>


                                    {/* DOI */}

                                    {citation.doi && (
                                        <div className="citation-detail">

                                            <span className="citation-detail-label">
                                                DOI
                                            </span>

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
                                                className="citation-doi"
                                            >
                                                {
                                                    citation.doi
                                                }
                                            </a>

                                        </div>
                                    )}


                                    {/* Formatted Citation */}

                                    {citation.formatted_citation && (
                                        <div className="formatted-citation">

                                            <div className="formatted-citation-label">
                                                Formatted Citation
                                            </div>

                                            <p>
                                                {
                                                    citation.formatted_citation
                                                }
                                            </p>

                                        </div>
                                    )}


                                    {/* Actions */}

                                    <div className="citation-actions">

                                        <Link
                                            to={`/citations/${citation.id}`}
                                            className="citation-btn citation-btn-secondary"
                                        >
                                            View
                                        </Link>


                                        <Link
                                            to={`/citations/${citation.id}/edit`}
                                            className="citation-btn citation-btn-warning"
                                        >
                                            Edit
                                        </Link>


                                        <button
                                            type="button"
                                            className="citation-btn citation-btn-danger"
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
                                            className="citation-btn citation-btn-success"
                                            disabled={
                                                exportingId ===
                                                citation.id
                                            }
                                            onClick={() =>
                                                handleBibtex(
                                                    citation.id
                                                )
                                            }
                                        >
                                            {exportingId ===
                                            citation.id
                                                ? "Exporting..."
                                                : "BibTeX"}
                                        </button>

                                    </div>

                                </article>

                            )
                        )}

                    </div>


                    {/* =========================================
                        PAGINATION
                    ========================================= */}

                    {totalPages > 1 && (

                        <div className="citations-pagination">

                            <button
                                type="button"
                                className="citations-page-btn"
                                disabled={
                                    currentPage === 1
                                }
                                onClick={() =>
                                    goToPage(
                                        currentPage - 1
                                    )
                                }
                            >
                                ‹
                            </button>


                            {getPageNumbers().map(
                                (page, index) => {

                                    if (
                                        page === "..."
                                    ) {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="citations-page-ellipsis"
                                            >
                                                …
                                            </span>
                                        );
                                    }


                                    return (
                                        <button
                                            type="button"
                                            key={page}
                                            className={`citations-page-btn ${
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


                            <button
                                type="button"
                                className="citations-page-btn"
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                                onClick={() =>
                                    goToPage(
                                        currentPage + 1
                                    )
                                }
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


export default Citations;