import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";

import { search } from "../services/searchService";
import SearchFilters from "../components/search/SearchFilters";
import SearchResults from "../components/search/SearchResults";
import "../styles/Search.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "";

  const [input, setInput] = useState(keyword);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const emptyResults = {
    researchers: [],
    publications: [],
    institutions: [],
    total: 0,
    page_size: 10,
  };

  const [results, setResults] = useState(emptyResults);

  const [filters, setFilters] = useState({
    type: "all",
    year: "",
    publicationType: "",
    status: "",
    institution: "",
    sort: "relevance",
  });

  useEffect(() => {
    setInput(keyword);
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults(emptyResults);
      return;
    }

    const loadSearch = async () => {
      try {
        setLoading(true);

        const data = await search({
          q: keyword,
          page,
          pageSize: 10,
          ...filters,
        });

        setResults({ ...emptyResults, ...data });
      } catch (error) {
        console.error("Search failed:", error);
        setResults(emptyResults);
      } finally {
        setLoading(false);
      }
    };

    loadSearch();
  }, [keyword, page, filters]);

  const handleSearch = (event) => {
    event?.preventDefault();
    const value = input.trim();

    if (!value) {
      setSearchParams({});
      return;
    }

    setSearchParams({ q: value });
  };

  const clearSearch = () => {
    setInput("");
    setSearchParams({});
    setResults(emptyResults);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) =>
      key !== "type" && key !== "sort" && String(value).trim() !== ""
  ) || filters.type !== "all" || filters.sort !== "relevance";

  const resetFilters = () => {
    setFilters({
      type: "all",
      year: "",
      publicationType: "",
      status: "",
      institution: "",
      sort: "relevance",
    });
    setPage(1);
  };

  return (
    <main className="search-page">
      <section className="search-hero">
        <div className="container">
          <div className="search-hero-content">
            <div>
              <span className="search-eyebrow">
                <SearchIcon size={16} /> Research discovery
              </span>
              <h1>Search the research network</h1>
              <p>
                Find researchers, publications, and institutions using the
                information stored in SCNA.
              </p>
            </div>

            <form className="search-main-form" onSubmit={handleSearch}>
              <SearchIcon className="search-main-icon" size={21} />
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search by name, title, topic, DOI, institution..."
                aria-label="Search SCNA"
              />
              {input && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setInput("")}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              <button className="search-submit-btn" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="container search-content">
        <button
          type="button"
          className="filter-toggle d-lg-none"
          onClick={() => setShowFilters((value) => !value)}
        >
          <SlidersHorizontal size={18} />
          {showFilters ? "Hide filters" : "Show filters"}
        </button>

        <div className="row g-4 align-items-start">
          <aside className={`col-lg-3 ${showFilters ? "" : "d-none d-lg-block"}`}>
            <div className="search-sidebar">
              <div className="search-sidebar-header">
                <div>
                  <span className="sidebar-kicker">Refine</span>
                  <h2>Filters</h2>
                </div>
                {hasActiveFilters && (
                  <button type="button" onClick={resetFilters}>
                    Reset
                  </button>
                )}
              </div>
              <SearchFilters filters={filters} setFilters={setFilters} />
            </div>
          </aside>

          <section className="col-lg-9">
            <SearchResults
              loading={loading}
              keyword={keyword}
              results={results}
              page={page}
              setPage={setPage}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
              onClearSearch={clearSearch}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
