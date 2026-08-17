import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getResearchers, deleteResearcher } from "../../services/researcherService";
import "./Researchers.css";

export default function Researchers() {
    const [researchers, setResearchers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const pageSize = 8;

    useEffect(() => { loadResearchers(); }, []);

    async function loadResearchers() {
        try {
            setLoading(true);
            setError("");
            const data = await getResearchers();
            setResearchers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.detail || "Unable to load researchers. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return researchers;
        return researchers.filter((r) => {
            const name = [r.first_name, r.last_name].filter(Boolean).join(" ");
            return [name, r.phone, r.orcid, r.skills, r.interests, r.bio]
                .filter(Boolean).join(" ").toLowerCase().includes(term);
        });
    }, [researchers, search]);

    useEffect(() => { setPage(1); }, [search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const totalPublications = researchers.reduce(
        (sum, r) => sum + (Array.isArray(r.publications) ? r.publications.length : 0), 0
    );
    const experienced = researchers.filter(r => Number(r.experience || 0) > 0).length;

    const fullName = (r) => [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || "Unnamed Researcher";
    const initials = (r) => ((r.first_name?.[0] || "") + (r.last_name?.[0] || "")).toUpperCase() || "?";

    async function handleDelete(researcher) {
        if (!window.confirm(`Delete the researcher profile for ${fullName(researcher)}? This action cannot be undone.`)) return;
        try {
            setDeletingId(researcher.id);
            setError("");
            await deleteResearcher(researcher.id);
            setResearchers(current => current.filter(r => r.id !== researcher.id));
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.detail || "Unable to delete this researcher.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className="researchers-page">
            <div className="researchers-container">
                <section className="researchers-hero">
                    <div>
                        <div className="researchers-eyebrow"><span className="eyebrow-dot" /> Research Community</div>
                        <h1>Researchers</h1>
                        <p>Explore researcher profiles, expertise, experience, and academic activity across SCNA.</p>
                    </div>
                    <Link to="/researchers/create" className="researcher-add-btn">
                        <span className="add-icon">+</span> Add Researcher
                    </Link>
                </section>

                <section className="researcher-stats">
                    <Stat icon="bi-people-fill" tone="blue" label="Total Researchers" value={researchers.length} />
                    <Stat icon="bi-award-fill" tone="green" label="With Experience" value={experienced} />
                    <Stat icon="bi-journal-richtext" tone="purple" label="Linked Publications" value={totalPublications} />
                </section>

                {error && (
                    <div className="researcher-alert">
                        <div><strong>Something went wrong</strong><span>{error}</span></div>
                        <button type="button" onClick={loadResearchers}>Retry</button>
                    </div>
                )}

                <section className="researchers-panel">
                    <div className="researchers-toolbar">
                        <div>
                            <h2>Research Directory</h2>
                            <p>{search ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} matching "${search}"` : `Showing ${filtered.length} researcher${filtered.length === 1 ? "" : "s"}`}</p>
                        </div>
                        <div className="researcher-search">
                            <i className="bi bi-search" />
                            <input
                                type="search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, ORCID, skills..."
                                aria-label="Search researchers"
                            />
                            {search && <button type="button" className="search-clear" onClick={() => setSearch("")}>×</button>}
                        </div>
                    </div>

                    <div className="researchers-table-wrap">
                        {loading ? (
                            <div className="researchers-loading">
                                <div className="researcher-spinner" />
                                <strong>Loading researchers</strong>
                                <span>Fetching the latest profiles...</span>
                            </div>
                        ) : paginated.length === 0 ? (
                            <div className="researchers-empty">
                                <div className="empty-icon"><i className="bi bi-person-x" /></div>
                                <h3>{search ? "No researchers found" : "No researcher profiles yet"}</h3>
                                <p>{search ? "Try a different name, skill, ORCID, or keyword." : "Add the first researcher profile to start building the directory."}</p>
                                {search
                                    ? <button type="button" className="empty-action" onClick={() => setSearch("")}>Clear Search</button>
                                    : <Link to="/researchers/create" className="empty-action">Add Researcher</Link>}
                            </div>
                        ) : (
                            <table className="researchers-table">
                                <thead>
                                    <tr>
                                        <th>Researcher</th><th>Experience</th><th>Contact</th><th>Research Profile</th><th className="actions-heading">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <div className="researcher-identity">
                                                    <div className="researcher-avatar">{initials(r)}</div>
                                                    <div className="researcher-name-block">
                                                        <Link to={`/researchers/${r.id}`} className="researcher-name">{fullName(r)}</Link>
                                                        <span>Researcher</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><div className="experience-cell"><strong>{Number(r.experience || 0)}</strong><span>years</span></div></td>
                                            <td>
                                                <div className="contact-cell">
                                                    {r.phone ? <><i className="bi bi-telephone" /><span>{r.phone}</span></> : <span className="muted-value">No phone</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="profile-cell">
                                                    {r.orcid && <span className="profile-badge"><i className="bi bi-patch-check-fill" /> ORCID</span>}
                                                    {Array.isArray(r.publications) && r.publications.length > 0
                                                        ? <span className="publication-count"><i className="bi bi-file-earmark-text" /> {r.publications.length} publication{r.publications.length === 1 ? "" : "s"}</span>
                                                        : !r.orcid && <span className="muted-value">Profile incomplete</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="researcher-actions">
                                                    <Link to={`/researchers/${r.id}`} className="action-btn view"><i className="bi bi-eye" /><span>View</span></Link>
                                                    <Link to={`/researchers/${r.id}/edit`} className="action-btn edit"><i className="bi bi-pencil-square" /><span>Edit</span></Link>
                                                    <button type="button" className="action-btn delete" disabled={deletingId === r.id} onClick={() => handleDelete(r)}>
                                                        {deletingId === r.id ? <span className="mini-spinner" /> : <i className="bi bi-trash3" />}<span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading && filtered.length > 0 && (
                        <div className="researchers-footer">
                            <span>Page {safePage} of {totalPages}</span>
                            <div className="pagination-controls">
                                <button type="button" disabled={safePage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><i className="bi bi-chevron-left" /> Previous</button>
                                <div className="page-number">{safePage}</div>
                                <button type="button" disabled={safePage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next <i className="bi bi-chevron-right" /></button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function Stat({ icon, tone, label, value }) {
    return (
        <div className="researcher-stat-card">
            <div className={`stat-icon ${tone}`}><i className={`bi ${icon}`} /></div>
            <div><span>{label}</span><strong>{value}</strong></div>
        </div>
    );
}
