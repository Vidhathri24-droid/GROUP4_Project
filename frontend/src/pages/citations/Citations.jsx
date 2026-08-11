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
    const results = citations.filter((citation) => {
      const value = (citation.title || citation.citing_title || "").toLowerCase();
      return value.includes(search.toLowerCase());
    });

    setFiltered(results);
    setCurrentPage(1);
  }, [search, citations]);

  const fetchCitations = async () => {
    try {
      setLoading(true);
      const data = await getCitations();
      setCitations(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert("Unable to delete citation.");
    }
  };

  const handleExportBibtex = async (id) => {
    try {
      const bibtex = await exportBibtex(id);
      const blob = new Blob([bibtex], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "citation.bib";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Unable to export BibTeX.");
    }
  };

  const indexOfLast = currentPage * citationsPerPage;
  const indexOfFirst = indexOfLast - citationsPerPage;
  const currentCitations = filtered.slice(indexOfFirst, indexOfLast);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h2 className="mb-1">Citation Management</h2>
          <p className="text-muted mb-0">Manage and organize publication citations.</p>
        </div>

        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-primary" onClick={fetchCitations}>
            🔄 Refresh
          </button>

          {canManage && (
            <Link to="/citations/create" className="btn btn-success">
              + Add Citation
            </Link>
          )}
        </div>
      </div>

      <CitationSearch search={search} setSearch={setSearch} />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading citations...</p>
        </div>
      ) : currentCitations.length === 0 ? (
        <div className="alert alert-warning mt-4">
          <h5>No citations found.</h5>
          <p className="mb-0">Try changing your search or create a new citation.</p>
        </div>
      ) : (
        <>
          <div className="row">
            {currentCitations.map((citation) => (
              <div key={citation.id} className="col-md-6 col-lg-4 mb-4">
                <CitationCard
                  citation={citation}
                  onDelete={handleDelete}
                  onExportBibtex={handleExportBibtex}
                />
              </div>
            ))}
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
