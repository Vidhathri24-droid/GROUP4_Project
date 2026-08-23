import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { getAllUsers, updateUserRole } from "../../services/adminService";
import { getCurrentUser, isInstitutionAdmin } from "../../utils/auth";

const ROLES = [
  { value: "Researcher", label: "Researcher", icon: "🔬" },
  { value: "Reviewer", label: "Reviewer", icon: "✓" },
];

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (value === "researcher") return "Researcher";
  if (value === "reviewer") return "Reviewer";
  if (value === "institutionadmin") return "InstitutionAdmin";
  if (value === "systemadmin") return "SystemAdmin";
  return String(role || "");
};

const roleLabel = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "InstitutionAdmin") return "Institution Admin";
  if (normalized === "SystemAdmin") return "System Admin";
  return ROLES.find((item) => item.value === normalized)?.label || normalized || "Unknown";
};

const roleIcon = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "InstitutionAdmin") return "🏢";
  if (normalized === "SystemAdmin") return "🛡";
  return ROLES.find((item) => item.value === normalized)?.icon || "👤";
};

export default function InstitutionAdminUsers() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err?.response?.data?.detail || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.username, user.email, roleLabel(user.role)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [users, search]);

  const handleRoleChange = async (user, newRole) => {
    const oldRole = normalizeRole(user.role);
    if (!newRole || newRole === oldRole) return;

    const isSelf = currentUser?.id && String(currentUser.id) === String(user.id);
    const isProtectedAdmin = oldRole === "SystemAdmin" || oldRole === "InstitutionAdmin";

    if (isSelf) {
      setError("You cannot change your own role.");
      return;
    }

    if (isProtectedAdmin) {
      setError("Institution Admin cannot change the role of an Institution Admin or System Admin.");
      return;
    }

    if (!["Researcher", "Reviewer"].includes(newRole)) {
      setError("Institution Admin can only assign Researcher or Reviewer roles.");
      return;
    }

    if (!window.confirm(`Change ${user.username || user.email}'s role from "${roleLabel(oldRole)}" to "${roleLabel(newRole)}"?`)) {
      return;
    }

    try {
      setSavingId(user.id);
      setError("");
      setSuccess("");

      const response = await updateUserRole(user.id, newRole);
      const updatedRole = response?.role || response?.user?.role || newRole;

      setUsers((current) =>
        current.map((item) =>
          String(item.id) === String(user.id)
            ? { ...item, role: updatedRole }
            : item
        )
      );

      setSuccess(`Role updated successfully for ${user.username || user.email}.`);
    } catch (err) {
      console.error("Role update failed:", err);
      setError(err?.response?.data?.detail || "Unable to update the user's role.");
    } finally {
      setSavingId(null);
    }
  };

  if (!isInstitutionAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalUsers = users.length;
  const researchers = users.filter((user) => normalizeRole(user.role) === "Researcher").length;
  const reviewers = users.filter((user) => normalizeRole(user.role) === "Reviewer").length;
  const administrators = users.filter((user) => {
    const role = normalizeRole(user.role);
    return role === "SystemAdmin" || role === "InstitutionAdmin";
  }).length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .ia-page { min-height: calc(100vh - 70px); background: linear-gradient(135deg,#f4f7fb 0%,#eef3fa 100%); padding:34px 24px 60px; }
        .ia-container { max-width:1280px; margin:0 auto; }
        .ia-hero { background:#fff; border:1px solid #e5eaf2; border-radius:22px; padding:32px; box-shadow:0 12px 35px rgba(31,52,86,.08); margin-bottom:24px; }
        .ia-hero-content { display:flex; justify-content:space-between; gap:30px; flex-wrap:wrap; }
        .ia-badge { display:inline-flex; padding:7px 13px; border-radius:999px; background:#e8f1ff; color:#1769e0; font-size:12px; font-weight:800; letter-spacing:.7px; margin-bottom:12px; }
        .ia-title { margin:0; font-size:34px; color:#17233c; font-weight:800; }
        .ia-subtitle { margin:10px 0 0; color:#667085; font-size:15px; }
        .ia-search { min-width:300px; }
        .ia-search label { display:block; font-size:13px; font-weight:700; color:#344054; margin-bottom:8px; }
        .ia-search input { width:100%; height:46px; padding:0 15px; border:1px solid #d9e0ea; border-radius:12px; outline:none; }
        .ia-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .ia-stat { background:#fff; border:1px solid #e5eaf2; border-radius:18px; padding:20px; display:flex; align-items:center; gap:15px; box-shadow:0 7px 24px rgba(31,52,86,.055); }
        .ia-stat-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:21px; }
        .ia-blue{background:#eaf2ff}.ia-orange{background:#fff3e6}.ia-green{background:#e9f9f0}.ia-purple{background:#f1eaff}
        .ia-stat-value{font-size:25px;font-weight:800;color:#17233c}.ia-stat-label{margin-top:5px;font-size:12px;color:#8a94a6;font-weight:600}
        .ia-alert{border-radius:13px;padding:14px 16px;margin-bottom:18px;font-size:14px;font-weight:600}.ia-error{background:#fff0f0;color:#b42318;border:1px solid #ffd0d0}.ia-success{background:#ecfdf3;color:#027a48;border:1px solid #abefc6}
        .ia-card{background:#fff;border:1px solid #e5eaf2;border-radius:20px;overflow:hidden;box-shadow:0 10px 32px rgba(31,52,86,.07)}
        .ia-header{padding:21px 24px;border-bottom:1px solid #edf0f5}.ia-header h2{margin:0;font-size:18px;color:#17233c;font-weight:800}.ia-count{margin-top:5px;color:#8a94a6;font-size:13px}.ia-table-wrap{overflow-x:auto}.ia-table{width:100%;border-collapse:collapse;min-width:900px}.ia-table th{padding:15px 20px;background:#17233c;color:#fff;text-align:left;font-size:12px;font-weight:800;text-transform:uppercase}.ia-table td{padding:17px 20px;border-bottom:1px solid #edf0f5;color:#344054;font-size:14px}.ia-user{display:flex;align-items:center;gap:12px}.ia-avatar{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#1677ff,#5b5bea);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}.ia-name{font-weight:750;color:#17233c}.ia-id{font-size:11px;color:#98a2b3;margin-top:3px}.ia-role{display:inline-flex;gap:6px;padding:7px 11px;border-radius:999px;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:750}.ia-role.system{background:#eaf2ff;color:#175cd3}.ia-role.institution{background:#f3e8ff;color:#7e22ce}.ia-role.reviewer{background:#ecfdf3;color:#15803d}.ia-role.researcher{background:#fff7ed;color:#c2410c}.ia-select{width:100%;min-width:210px;height:42px;padding:0 12px;border:1px solid #d9e0ea;border-radius:10px;background:#fff;color:#344054;font-size:14px;outline:none}.ia-select:disabled{background:#f5f7fa;color:#98a2b3;cursor:not-allowed}.ia-note{margin-top:6px;font-size:11px;color:#98a2b3}.ia-loading,.ia-empty{padding:70px 30px;text-align:center;color:#667085}
        @media(max-width:900px){.ia-page{padding:24px 14px 45px}.ia-title{font-size:28px}.ia-stats{grid-template-columns:repeat(2,1fr)}.ia-search{width:100%;min-width:0}}
        @media(max-width:560px){.ia-hero{padding:22px}.ia-title{font-size:24px}.ia-stats{grid-template-columns:1fr}}
      `}</style>

      <main className="ia-page">
        <div className="ia-container">
          <section className="ia-hero">
            <div className="ia-hero-content">
              <div>
                <div className="ia-badge">🏢 INSTITUTION ADMIN</div>
                <h1 className="ia-title">Institution User Management</h1>
                <p className="ia-subtitle">Assign Researcher or Reviewer roles. Administrator roles are protected.</p>
              </div>
              <div className="ia-search">
                <label>Search users</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Username, email or role..." />
              </div>
            </div>
          </section>

          <section className="ia-stats">
            <div className="ia-stat"><div className="ia-stat-icon ia-blue">👥</div><div><div className="ia-stat-value">{totalUsers}</div><div className="ia-stat-label">Total Users</div></div></div>
            <div className="ia-stat"><div className="ia-stat-icon ia-orange">🔬</div><div><div className="ia-stat-value">{researchers}</div><div className="ia-stat-label">Researchers</div></div></div>
            <div className="ia-stat"><div className="ia-stat-icon ia-green">✓</div><div><div className="ia-stat-value">{reviewers}</div><div className="ia-stat-label">Reviewers</div></div></div>
            <div className="ia-stat"><div className="ia-stat-icon ia-purple">🛡</div><div><div className="ia-stat-value">{administrators}</div><div className="ia-stat-label">Administrators</div></div></div>
          </section>

          {error && <div className="ia-alert ia-error">⚠️ {error}</div>}
          {success && <div className="ia-alert ia-success">✓ {success}</div>}

          <section className="ia-card">
            <div className="ia-header">
              <h2>SCNA Users</h2>
              <div className="ia-count">{loading ? "Loading users..." : `Showing ${filteredUsers.length} of ${users.length} users`}</div>
            </div>

            {loading ? (
              <div className="ia-loading">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="ia-empty">🔎<br/><strong>No users found</strong></div>
            ) : (
              <div className="ia-table-wrap">
                <table className="ia-table">
                  <thead><tr><th>#</th><th>User</th><th>Email</th><th>Current Role</th><th>Assign Role</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const role = normalizeRole(user.role);
                      const isSelf = currentUser?.id && String(currentUser.id) === String(user.id);
                      const isProtectedAdmin = role === "SystemAdmin" || role === "InstitutionAdmin";
                      const isSaving = String(savingId) === String(user.id);
                      const username = user.username || "Unknown User";
                      const initials = username.split(" ").map((p) => p[0]).join("").slice(0,2).toUpperCase();
                      const roleClass = role === "SystemAdmin" ? "system" : role === "InstitutionAdmin" ? "institution" : role === "Reviewer" ? "reviewer" : "researcher";

                      return (
                        <tr key={user.id}>
                          <td><strong>{index + 1}</strong></td>
                          <td><div className="ia-user"><div className="ia-avatar">{initials}</div><div><div className="ia-name">{username}{isSelf && " (YOU)"}</div><div className="ia-id">ID: {user.id ? String(user.id).slice(0,12) : "—"}</div></div></div></td>
                          <td>{user.email || "—"}</td>
                          <td><span className={`ia-role ${roleClass}`}>{roleIcon(role)} {roleLabel(role)}</span></td>
                          <td>
                            <select className="ia-select" value={role} disabled={isSelf || isProtectedAdmin || isSaving} onChange={(e) => handleRoleChange(user, e.target.value)}>
                              {isProtectedAdmin ? <option value={role}>{roleLabel(role)}</option> : ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                            </select>
                            {isProtectedAdmin && <div className="ia-note">Administrator role cannot be changed here.</div>}
                            {isSelf && <div className="ia-note">Your own role cannot be changed.</div>}
                            {isSaving && <div className="ia-note">Updating role...</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
