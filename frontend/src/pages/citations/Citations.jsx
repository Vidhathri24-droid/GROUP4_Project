import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getCitations,
    deleteCitation,
    exportBibtex,
} from "../../services/citationService";

import CitationCard from "../../components/citations/CitationCard";
import CitationSearch from "../../components/citations/CitationSearch";
import CitationPagination from "../../components/citations/CitationPagination";

import {
    isSystemAdmin,
    isInstitutionAdmin,
    isResearcher,
} from "../../utils/auth";

export default function Citations() {

    const [citations, setCitations] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const citationsPerPage = 6;

    const canManage =
        isSystemAdmin() || isInstitutionAdmin() || isResearcher();

    useEffect(() => {
        fetchCitations();
    }, []);

    useEffect(() => {

        const results = citations.filter((citation) =>
            citation.title
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );

        setFiltered(results);
        setCurrentPage(1);

    }, [search, citations]);

    const fetchCitations = async () => {

        try {

            setLoading(true);

            const data = await getCitations();

            setCitations(data);
            setFiltered(data);

        } catch (error) {

            console.error(error);

            alert("Unable to load citations.");

        } finally {

            setLoading(false);

        }

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this citation?")) {
            return;
        }

        try {

            await deleteCitation(id);

            fetchCitations();

        } catch (error) {

            console.error(error);

            alert("Unable to delete citation.");

        }

    };

    const handleExportBibtex = async (id) => {

        try {

            const bibtex = await exportBibtex(id);

            const blob = new Blob(
                [bibtex],
                {
                    type: "text/plain",
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;
            a.download = "citation.bib";
            a.click();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(error);

            alert("Unable to export BibTeX.");

        }

    };

    const indexOfLast =
        currentPage * citationsPerPage;

    const indexOfFirst =
        indexOfLast - citationsPerPage;

    const currentCitations =
        filtered.slice(
            indexOfFirst,
            indexOfLast
        );

    return (

        <div className="container py-4">

            {/* Header */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h1 className="fw-bold">
                        Citation Management
                    </h1>

                    <p className="text-muted mb-0">
                        Manage citations and export them in multiple formats.
                    </p>

                </div>

                <div className="d-flex gap-2">

                    {canManage && (

                        <Link
                            to="/citations/create"
                            className="btn btn-success"
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add Citation
                        </Link>

                    )}

                    <button
                        className="btn btn-outline-secondary"
                        onClick={fetchCitations}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                    </button>

                </div>

            </div>

            {/* Search */}

            <CitationSearch
                search={search}
                setSearch={setSearch}
            />

            {/* Loading */}

            {loading ? (

                <div className="text-center mt-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                </div>

            ) : (

                <>

                    <div className="row mt-4">

                        {currentCitations.length === 0 ? (

                            <div className="col-12">

                                <div className="alert alert-warning">

                                    <h5 className="mb-2">
                                        No citations found
                                    </h5>

                                    <p className="mb-0">
                                        There are no citations available yet.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            currentCitations.map((citation) => (

                                <div
                                    key={citation.id}
                                    className="col-md-6 col-lg-4 mb-4"
                                >

                                    <CitationCard
                                        citation={citation}
                                        onDelete={handleDelete}
                                        onExportBibtex={handleExportBibtex}
                                    />

                                </div>

                            ))

                        )}

                    </div>

                    <div className="mt-4">

                        <CitationPagination
                            totalItems={filtered.length}
                            itemsPerPage={citationsPerPage}
                            currentPage={currentPage}
                            paginate={setCurrentPage}
                        />

                    </div>

                </>

            )}

        </div>

    );

}
