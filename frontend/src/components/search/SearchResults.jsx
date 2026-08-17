import { BookOpen, Building2, FileText, SearchX, UserRound } from "lucide-react";
import SearchCard from "./SearchCard";
import Pagination from "./Pagination";

function SectionHeader({ icon, title, count }) {
  return (
    <div className="results-section-header">
      <div className="results-section-title">
        <span className="results-section-icon">{icon}</span>
        <h2>{title}</h2>
      </div>
      <span className="results-count">{count}</span>
    </div>
  );
}

export default function SearchResults({
  loading,
  keyword,
  results,
  page,
  setPage,
  hasActiveFilters,
  onResetFilters,
  onClearSearch,
}) {
  const researchers = results.researchers || [];
  const publications = results.publications || [];
  const institutions = results.institutions || [];
  const hasResults = researchers.length + publications.length + institutions.length > 0;

  if (!keyword.trim()) {
    return (
      <div className="search-empty-state search-empty-initial">
        <div className="empty-icon"><SearchX size={28} /></div>
        <h2>Start exploring the research network</h2>
        <p>Enter a researcher, publication title, topic, DOI, or institution above.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="search-loading">
        <div className="search-spinner" />
        <h2>Searching the network...</h2>
        <p>Looking through researchers, publications, and institutions.</p>
      </div>
    );
  }

  return (
    <div className="search-results-panel">
      <div className="results-header">
        <div>
          <span className="results-eyebrow">Search results</span>
          <h2>
            Results for <span>“{keyword}”</span>
          </h2>
          <p>
            {results.total} matching record{results.total === 1 ? "" : "s"}
            {hasActiveFilters ? " with the current filters" : ""}
          </p>
        </div>
        <div className="results-header-actions">
          {hasActiveFilters && (
            <button type="button" className="btn btn-light border" onClick={onResetFilters}>
              Clear filters
            </button>
          )}
          <button type="button" className="btn btn-outline-secondary" onClick={onClearSearch}>
            New search
          </button>
        </div>
      </div>

      {hasResults ? (
        <>
          {researchers.length > 0 && (
            <section className="results-section">
              <SectionHeader icon={<UserRound size={18} />} title="Researchers" count={researchers.length} />
              {researchers.map((researcher) => (
                <SearchCard
                  key={`researcher-${researcher.id}`}
                  id={researcher.id}
                  type="researcher"
                  title={researcher.name}
                  subtitle={researcher.department}
                  badge={researcher.institution}
                  description={
                    researcher.bio ||
                    `${researcher.publication_count} publication${researcher.publication_count === 1 ? "" : "s"} • ${researcher.experience} year${researcher.experience === 1 ? "" : "s"} experience`
                  }
                />
              ))}
            </section>
          )}

          {publications.length > 0 && (
            <section className="results-section">
              <SectionHeader icon={<FileText size={18} />} title="Publications" count={publications.length} />
              {publications.map((publication) => (
                <SearchCard
                  key={`publication-${publication.id}`}
                  id={publication.id}
                  type="publication"
                  title={publication.title}
                  subtitle={publication.authors?.length ? publication.authors.join(", ") : "Author information unavailable"}
                  badge={publication.publication_type}
                  description={`${publication.publication_year} • ${publication.citation_count || 0} citation${publication.citation_count === 1 ? "" : "s"}${publication.status ? ` • ${publication.status}` : ""}`}
                />
              ))}
            </section>
          )}

          {institutions.length > 0 && (
            <section className="results-section">
              <SectionHeader icon={<Building2 size={18} />} title="Institutions" count={institutions.length} />
              {institutions.map((institution) => (
                <SearchCard
                  key={`institution-${institution.id}`}
                  id={institution.id}
                  type="institution"
                  title={institution.name}
                  subtitle={[institution.city, institution.state, institution.country].filter(Boolean).join(", ")}
                  badge={institution.abbreviation}
                  description={`${institution.department_count || 0} department${institution.department_count === 1 ? "" : "s"}`}
                />
              ))}
            </section>
          )}

          <Pagination
            page={page}
            pageSize={results.page_size || 10}
            total={results.total || 0}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="search-empty-state">
          <div className="empty-icon"><SearchX size={28} /></div>
          <h3>No matches found</h3>
          <p>
            We couldn't find a record matching <strong>“{keyword}”</strong>.
          </p>
          <div className="empty-tips">
            <span>Try a broader keyword</span>
            <span>Check spelling</span>
            <span>Remove filters</span>
          </div>
          <button type="button" className="btn btn-primary mt-3" onClick={hasActiveFilters ? onResetFilters : onClearSearch}>
            {hasActiveFilters ? "Clear filters" : "Start a new search"}
          </button>
        </div>
      )}
    </div>
  );
}
