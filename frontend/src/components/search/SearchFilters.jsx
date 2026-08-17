export default function SearchFilters({ filters, setFilters }) {
  const update = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div className="search-filter-card">
      <div className="search-filter-body">
        <div className="filter-group">
          <label htmlFor="search-type">Search type</label>
          <select
            id="search-type"
            className="form-select"
            value={filters.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="all">Everything</option>
            <option value="researchers">Researchers</option>
            <option value="publications">Publications</option>
            <option value="institutions">Institutions</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="publication-year">Publication year</label>
          <input
            id="publication-year"
            type="number"
            min="1900"
            max="2100"
            className="form-control"
            placeholder="e.g. 2026"
            value={filters.year}
            onChange={(e) => update("year", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="publication-type">Publication type</label>
          <select
            id="publication-type"
            className="form-select"
            value={filters.publicationType}
            onChange={(e) => update("publicationType", e.target.value)}
          >
            <option value="">Any type</option>
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
            <option value="Book">Book</option>
            <option value="BookChapter">Book chapter</option>
            <option value="Patent">Patent</option>
            <option value="Thesis">Thesis</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="publication-status">Publication status</label>
          <select
            id="publication-status"
            className="form-select"
            value={filters.status}
            onChange={(e) => update("status", e.target.value)}
          >
            <option value="">Any status</option>
            <option value="Published">Published</option>
            <option value="Accepted">Accepted</option>
            <option value="Submitted">Submitted</option>
            <option value="Draft">Draft</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="institution">Institution</label>
          <input
            id="institution"
            className="form-control"
            placeholder="Institution name"
            value={filters.institution}
            onChange={(e) => update("institution", e.target.value)}
          />
        </div>

        <div className="filter-group mb-0">
          <label htmlFor="search-sort">Sort by</label>
          <select
            id="search-sort"
            className="form-select"
            value={filters.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="citations">Most cited</option>
          </select>
        </div>
      </div>
    </div>
  );
}
