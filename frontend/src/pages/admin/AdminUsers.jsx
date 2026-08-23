import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Navigate,
} from "react-router-dom";

import {
    getUsers,
    updateUserRole,
} from "../../services/userService";

import {
    getCurrentUser,
    isSystemAdmin,
} from "../../utils/auth";


// ============================================================
// AVAILABLE ROLES
// ============================================================

const ROLES = [
    {
        value: "Researcher",
        label: "Researcher",
        icon: "🔬",
    },
    {
        value: "Reviewer",
        label: "Reviewer",
        icon: "✓",
    },
    {
        value: "InstitutionAdmin",
        label: "Institution Admin",
        icon: "🏢",
    },
    {
        value: "SystemAdmin",
        label: "System Admin",
        icon: "🛡",
    },
];


// ============================================================
// NORMALIZE ROLE
// ============================================================

const normalizeRole = (role) => {

    if (!role) {
        return "";
    }

    const value =
        String(role).trim();

    const normalized =
        value
            .toUpperCase()
            .replace(
                /[\s-]+/g,
                "_"
            );

    const aliases = {

        RESEARCHER:
            "Researcher",

        REVIEWER:
            "Reviewer",

        INSTITUTION_ADMIN:
            "InstitutionAdmin",

        INSTITUTIONADMIN:
            "InstitutionAdmin",

        SYSTEM_ADMIN:
            "SystemAdmin",

        SYSTEMADMIN:
            "SystemAdmin",
    };

    return (
        aliases[normalized] ||
        value
    );
};


// ============================================================
// ROLE LABEL
// ============================================================

const roleLabel = (role) => {

    const normalized =
        normalizeRole(role);

    const found =
        ROLES.find(
            (item) =>
                item.value ===
                normalized
        );

    return (
        found?.label ||
        normalized ||
        "Unknown"
    );
};


// ============================================================
// ROLE ICON
// ============================================================

const getRoleIcon = (role) => {

    const normalized =
        normalizeRole(role);

    const found =
        ROLES.find(
            (item) =>
                item.value ===
                normalized
        );

    return (
        found?.icon ||
        "👤"
    );
};


// ============================================================
// COMPONENT
// ============================================================

export default function AdminUsers() {

    const currentUser =
        getCurrentUser();

    const [users, setUsers] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [savingId, setSavingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // ========================================================
    // LOAD USERS
    // ========================================================

    useEffect(() => {

        loadUsers();

    }, []);


    const loadUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getUsers();

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load users:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load users."
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================================
    // SEARCH
    // ========================================================

    const filteredUsers =
        useMemo(() => {

            const term =
                search
                    .trim()
                    .toLowerCase();

            if (!term) {
                return users;
            }

            return users.filter(
                (user) => {

                    const username =
                        user.username ||
                        "";

                    const email =
                        user.email ||
                        "";

                    const role =
                        roleLabel(
                            user.role
                        );

                    return [
                        username,
                        email,
                        role,
                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(
                            term
                        );
                }
            );

        }, [
            users,
            search,
        ]);


    // ========================================================
    // CHANGE ROLE
    // ========================================================

    const handleRoleChange = async (
        user,
        newRole
    ) => {

        const oldRole =
            normalizeRole(
                user.role
            );

        const normalizedNewRole =
            normalizeRole(
                newRole
            );

        // Nothing changed
        if (
            !normalizedNewRole ||
            normalizedNewRole ===
                oldRole
        ) {
            return;
        }

        // ----------------------------------------------------
        // Prevent changing own role
        // ----------------------------------------------------

        const isSelf =
            currentUser?.id &&
            String(
                currentUser.id
            ) ===
                String(
                    user.id
                );

        if (isSelf) {

            alert(
                "You cannot change your own role."
            );

            return;
        }

        // ----------------------------------------------------
        // Confirm
        // ----------------------------------------------------

        const confirmed =
            window.confirm(
                `Change ${
                    user.username ||
                    user.email
                }'s role from "${roleLabel(
                    oldRole
                )}" to "${roleLabel(
                    normalizedNewRole
                )}"?`
            );

        if (!confirmed) {
            return;
        }

        // ----------------------------------------------------
        // Update
        // ----------------------------------------------------

        try {

            setSavingId(
                user.id
            );

            setError("");
            setSuccess("");

            const updated =
                await updateUserRole(
                    user.id,
                    normalizedNewRole
                );

            const updatedRole =
                normalizeRole(
                    updated?.role ||
                    normalizedNewRole
                );

            setUsers(
                (current) =>
                    current.map(
                        (item) => {

                            if (
                                String(
                                    item.id
                                ) !==
                                String(
                                    user.id
                                )
                            ) {
                                return item;
                            }

                            return {
                                ...item,
                                ...updated,
                                role:
                                    updatedRole,
                            };
                        }
                    )
            );

            setSuccess(
                `Role updated successfully for ${
                    user.username ||
                    user.email
                }.`
            );

        } catch (err) {

            console.error(
                "Role update failed:",
                err
            );

            const detail =
                err?.response?.data
                    ?.detail;

            if (
                Array.isArray(
                    detail
                )
            ) {

                setError(
                    detail
                        .map(
                            (item) =>
                                item.msg
                        )
                        .join(", ")
                );

            } else {

                setError(
                    detail ||
                    err?.message ||
                    "Unable to update the user's role."
                );
            }

        } finally {

            setSavingId(null);
        }
    };


    // ========================================================
    // SYSTEM ADMIN ACCESS
    // ========================================================

    if (!isSystemAdmin()) {

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    // ========================================================
    // STATISTICS
    // ========================================================

    const totalUsers =
        users.length;

    const researchers =
        users.filter(
            (user) =>
                normalizeRole(
                    user.role
                ) === "Researcher"
        ).length;

    const reviewers =
        users.filter(
            (user) =>
                normalizeRole(
                    user.role
                ) === "Reviewer"
        ).length;

    const administrators =
        users.filter(
            (user) => {

                const role =
                    normalizeRole(
                        user.role
                    );

                return (
                    role ===
                        "SystemAdmin" ||
                    role ===
                        "InstitutionAdmin"
                );
            }
        ).length;


    // ========================================================
    // UI
    // ========================================================

    return (
        <main className="admin-users-page">

            <style>{`

                .admin-users-page {
                    min-height:
                        calc(100vh - 70px);

                    background:
                        linear-gradient(
                            135deg,
                            #f4f7fb,
                            #eef3fa
                        );

                    padding:
                        34px 24px 60px;
                }

                .admin-users-container {
                    max-width:
                        1280px;

                    margin:
                        0 auto;
                }

                .admin-hero {
                    background:
                        #ffffff;

                    border:
                        1px solid #e5eaf2;

                    border-radius:
                        22px;

                    padding:
                        30px;

                    margin-bottom:
                        24px;

                    box-shadow:
                        0 12px 35px
                        rgba(
                            31,
                            52,
                            86,
                            .08
                        );
                }

                .admin-hero-content {
                    display:
                        flex;

                    align-items:
                        flex-start;

                    justify-content:
                        space-between;

                    gap:
                        30px;

                    flex-wrap:
                        wrap;
                }

                .admin-badge {
                    display:
                        inline-flex;

                    padding:
                        7px 13px;

                    border-radius:
                        999px;

                    background:
                        #e8f1ff;

                    color:
                        #1769e0;

                    font-size:
                        12px;

                    font-weight:
                        800;

                    margin-bottom:
                        12px;
                }

                .admin-title {
                    margin:
                        0;

                    color:
                        #17233c;

                    font-size:
                        34px;

                    font-weight:
                        800;
                }

                .admin-subtitle {
                    margin-top:
                        10px;

                    color:
                        #667085;
                }

                .admin-search-wrapper {
                    min-width:
                        300px;
                }

                .admin-search-label {
                    display:
                        block;

                    margin-bottom:
                        8px;

                    font-size:
                        13px;

                    font-weight:
                        700;

                    color:
                        #344054;
                }

                .admin-search {
                    width:
                        100%;

                    height:
                        46px;

                    padding:
                        0 15px;

                    border:
                        1px solid #d9e0ea;

                    border-radius:
                        12px;

                    outline:
                        none;

                    font-size:
                        14px;
                }

                .admin-search:focus {
                    border-color:
                        #1677ff;

                    box-shadow:
                        0 0 0 4px
                        rgba(
                            22,
                            119,
                            255,
                            .10
                        );
                }

                .admin-stats {
                    display:
                        grid;

                    grid-template-columns:
                        repeat(
                            4,
                            1fr
                        );

                    gap:
                        16px;

                    margin-bottom:
                        24px;
                }

                .admin-stat {
                    background:
                        #ffffff;

                    border:
                        1px solid #e5eaf2;

                    border-radius:
                        18px;

                    padding:
                        20px;

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        15px;

                    box-shadow:
                        0 7px 24px
                        rgba(
                            31,
                            52,
                            86,
                            .055
                        );
                }

                .admin-stat-icon {
                    width:
                        48px;

                    height:
                        48px;

                    border-radius:
                        14px;

                    display:
                        flex;

                    align-items:
                        center;

                    justify-content:
                        center;

                    font-size:
                        21px;
                }

                .stat-blue {
                    background:
                        #eaf2ff;
                }

                .stat-purple {
                    background:
                        #f1eaff;
                }

                .stat-green {
                    background:
                        #e9f9f0;
                }

                .stat-orange {
                    background:
                        #fff3e6;
                }

                .admin-stat-value {
                    font-size:
                        25px;

                    font-weight:
                        800;

                    color:
                        #17233c;
                }

                .admin-stat-label {
                    margin-top:
                        5px;

                    font-size:
                        12px;

                    color:
                        #8a94a6;
                }

                .admin-alert {
                    padding:
                        14px 16px;

                    border-radius:
                        13px;

                    margin-bottom:
                        18px;

                    font-size:
                        14px;

                    font-weight:
                        600;
                }

                .admin-error {
                    background:
                        #fff0f0;

                    color:
                        #b42318;

                    border:
                        1px solid #ffd0d0;
                }

                .admin-success {
                    background:
                        #ecfdf3;

                    color:
                        #027a48;

                    border:
                        1px solid #abefc6;
                }

                .admin-table-card {
                    background:
                        #ffffff;

                    border:
                        1px solid #e5eaf2;

                    border-radius:
                        20px;

                    overflow:
                        hidden;

                    box-shadow:
                        0 10px 32px
                        rgba(
                            31,
                            52,
                            86,
                            .07
                        );
                }

                .admin-table-header {
                    padding:
                        21px 24px;

                    border-bottom:
                        1px solid #edf0f5;
                }

                .admin-table-title {
                    margin:
                        0;

                    color:
                        #17233c;

                    font-size:
                        18px;

                    font-weight:
                        800;
                }

                .admin-table-subtitle {
                    margin-top:
                        5px;

                    color:
                        #8a94a6;

                    font-size:
                        13px;
                }

                .admin-table-wrapper {
                    overflow-x:
                        auto;
                }

                table {
                    width:
                        100%;

                    border-collapse:
                        collapse;
                }

                th {
                    background:
                        #17233c;

                    color:
                        #ffffff;

                    padding:
                        15px 18px;

                    text-align:
                        left;

                    font-size:
                        12px;

                    letter-spacing:
                        .5px;
                }

                td {
                    padding:
                        15px 18px;

                    border-bottom:
                        1px solid #edf0f5;

                    color:
                        #344054;

                    font-size:
                        14px;
                }

                tr:last-child td {
                    border-bottom:
                        none;
                }

                .user-name {
                    font-weight:
                        700;

                    color:
                        #17233c;
                }

                .user-id {
                    margin-top:
                        4px;

                    color:
                        #98a2b3;

                    font-size:
                        11px;
                }

                .role-badge {
                    display:
                        inline-flex;

                    align-items:
                        center;

                    gap:
                        6px;

                    padding:
                        7px 11px;

                    border-radius:
                        999px;

                    background:
                        #eef4ff;

                    color:
                        #1769e0;

                    font-size:
                        12px;

                    font-weight:
                        700;
                }

                .role-select {
                    width:
                        100%;

                    min-width:
                        180px;

                    padding:
                        10px 12px;

                    border:
                        1px solid #d9e0ea;

                    border-radius:
                        10px;

                    background:
                        #ffffff;

                    font-size:
                        13px;

                    color:
                        #344054;

                    cursor:
                        pointer;
                }

                .role-select:disabled {
                    background:
                        #f2f4f7;

                    cursor:
                        not-allowed;

                    opacity:
                        .7;
                }

                .self-note {
                    margin-top:
                        5px;

                    font-size:
                        11px;

                    color:
                        #98a2b3;
                }

                .empty-state {
                    padding:
                        60px 20px;

                    text-align:
                        center;

                    color:
                        #667085;
                }

                @media (
                    max-width: 900px
                ) {

                    .admin-stats {
                        grid-template-columns:
                            repeat(
                                2,
                                1fr
                            );
                    }

                }

                @media (
                    max-width: 600px
                ) {

                    .admin-users-page {
                        padding:
                            20px 12px;
                    }

                    .admin-stats {
                        grid-template-columns:
                            1fr;
                    }

                    .admin-title {
                        font-size:
                            28px;
                    }

                    .admin-search-wrapper {
                        min-width:
                            100%;
                    }

                }

            `}</style>


            <div className="admin-users-container">

                {/* ==================================================
                    HERO
                   ================================================== */}

                <section className="admin-hero">

                    <div className="admin-hero-content">

                        <div>

                            <div className="admin-badge">
                                🛡 SYSTEM ADMIN
                            </div>

                            <h1 className="admin-title">
                                User & Role Management
                            </h1>

                            <p className="admin-subtitle">
                                Manage SCNA users and
                                control their system
                                access levels.
                            </p>

                        </div>


                        <div className="admin-search-wrapper">

                            <label className="admin-search-label">
                                Search users
                            </label>

                            <input
                                className="admin-search"
                                type="text"
                                placeholder="Username, email or role..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    STATISTICS
                   ================================================== */}

                <section className="admin-stats">

                    <div className="admin-stat">

                        <div className="admin-stat-icon stat-blue">
                            👥
                        </div>

                        <div>
                            <div className="admin-stat-value">
                                {totalUsers}
                            </div>

                            <div className="admin-stat-label">
                                Total Users
                            </div>
                        </div>

                    </div>


                    <div className="admin-stat">

                        <div className="admin-stat-icon stat-orange">
                            🔬
                        </div>

                        <div>
                            <div className="admin-stat-value">
                                {researchers}
                            </div>

                            <div className="admin-stat-label">
                                Researchers
                            </div>
                        </div>

                    </div>


                    <div className="admin-stat">

                        <div className="admin-stat-icon stat-green">
                            ✓
                        </div>

                        <div>
                            <div className="admin-stat-value">
                                {reviewers}
                            </div>

                            <div className="admin-stat-label">
                                Reviewers
                            </div>
                        </div>

                    </div>


                    <div className="admin-stat">

                        <div className="admin-stat-icon stat-purple">
                            🛡
                        </div>

                        <div>
                            <div className="admin-stat-value">
                                {administrators}
                            </div>

                            <div className="admin-stat-label">
                                Administrators
                            </div>
                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                   ================================================== */}

                {error && (

                    <div className="admin-alert admin-error">
                        ⚠️ {error}
                    </div>

                )}


                {/* ==================================================
                    SUCCESS
                   ================================================== */}

                {success && (

                    <div className="admin-alert admin-success">
                        ✓ {success}
                    </div>

                )}


                {/* ==================================================
                    TABLE
                   ================================================== */}

                <section className="admin-table-card">

                    <div className="admin-table-header">

                        <h2 className="admin-table-title">
                            SCNA Users
                        </h2>

                        <div className="admin-table-subtitle">
                            {loading
                                ? "Loading users..."
                                : `Showing ${
                                      filteredUsers.length
                                  } of ${
                                      users.length
                                  } users`}
                        </div>

                    </div>


                    {loading ? (

                        <div className="empty-state">
                            Loading users...
                        </div>

                    ) : filteredUsers.length === 0 ? (

                        <div className="empty-state">
                            🔎
                            <br />
                            <strong>
                                No users found
                            </strong>
                        </div>

                    ) : (

                        <div className="admin-table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            USER
                                        </th>

                                        <th>
                                            EMAIL
                                        </th>

                                        <th>
                                            CURRENT ROLE
                                        </th>

                                        <th>
                                            ASSIGN ROLE
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredUsers.map(
                                        (
                                            user,
                                            index
                                        ) => {

                                            const currentRole =
                                                normalizeRole(
                                                    user.role
                                                );

                                            const isSelf =
                                                currentUser?.id &&
                                                String(
                                                    currentUser.id
                                                ) ===
                                                    String(
                                                        user.id
                                                    );

                                            return (

                                                <tr
                                                    key={
                                                        user.id
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    <td>

                                                        <div className="user-name">

                                                            {user.username ||
                                                                "Unnamed User"}

                                                            {isSelf && (
                                                                <span
                                                                    style={{
                                                                        marginLeft:
                                                                            8,
                                                                        padding:
                                                                            "3px 7px",
                                                                        borderRadius:
                                                                            999,
                                                                        background:
                                                                            "#e8f1ff",
                                                                        color:
                                                                            "#1769e0",
                                                                        fontSize:
                                                                            10,
                                                                        fontWeight:
                                                                            800,
                                                                    }}
                                                                >
                                                                    YOU
                                                                </span>
                                                            )}

                                                        </div>

                                                        <div className="user-id">
                                                            ID:{" "}
                                                            {user.id}
                                                        </div>

                                                    </td>


                                                    <td>
                                                        {user.email}
                                                    </td>


                                                    <td>

                                                        <span className="role-badge">

                                                            <span>
                                                                {getRoleIcon(
                                                                    currentRole
                                                                )}
                                                            </span>

                                                            {roleLabel(
                                                                currentRole
                                                            )}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <select
                                                            className="role-select"
                                                            value={
                                                                currentRole
                                                            }
                                                            disabled={
                                                                isSelf ||
                                                                savingId ===
                                                                    user.id
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleRoleChange(
                                                                    user,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        >

                                                            {ROLES.map(
                                                                (
                                                                    role
                                                                ) => (

                                                                    <option
                                                                        key={
                                                                            role.value
                                                                        }
                                                                        value={
                                                                            role.value
                                                                        }
                                                                    >
                                                                        {
                                                                            role.label
                                                                        }
                                                                    </option>

                                                                )
                                                            )}

                                                        </select>


                                                        {isSelf && (

                                                            <div className="self-note">
                                                                Your own role cannot
                                                                be changed.
                                                            </div>

                                                        )}

                                                        {savingId ===
                                                            user.id && (

                                                            <div className="self-note">
                                                                Updating role...
                                                            </div>

                                                        )}

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>

        </main>
    );
}