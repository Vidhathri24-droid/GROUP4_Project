import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getResearchers } from "../../services/researcherService";

import ResearcherTable from "../../components/researchers/ResearcherTable";
import SearchResearcher from "../../components/researchers/SearchResearcher";
import Pagination from "../../components/researchers/Pagination";

export default function Researchers() {
  const [researchers, setResearchers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    loadResearchers();
  }, []);

  async function loadResearchers() {
    try {
      const data = await getResearchers();

      setResearchers(data || []);
    } catch (error) {
      console.error("Failed to load researchers:", error);
      setResearchers([]);
    }
  }

  const filtered = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return researchers;
    }

    return researchers.filter((researcher) => {
      const firstName = researcher.first_name || "";
      const lastName = researcher.last_name || "";
      const phone = researcher.phone || "";
      const orcid = researcher.orcid || "";

      const fullName =
        `${firstName} ${lastName}`.toLowerCase();

      return (
        fullName.includes(searchText) ||
        firstName.toLowerCase().includes(searchText) ||
        lastName.toLowerCase().includes(searchText) ||
        phone.includes(searchText) ||
        orcid.toLowerCase().includes(searchText)
      );
    });
  }, [researchers, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Researchers</h2>

        <Link
          to="/researchers/create"
          className="btn btn-primary"
        >
          + Add Researcher
        </Link>
      </div>

      <div className="mb-4">
        <SearchResearcher
          search={search}
          setSearch={setSearch}
        />
      </div>

      <ResearcherTable
        researchers={paginated}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

    </div>
  );
}