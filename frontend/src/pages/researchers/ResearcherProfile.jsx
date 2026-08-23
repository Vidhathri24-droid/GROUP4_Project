import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getUserById,
  updateUser,
} from "../../services/userService";

import {
  getResearchers,
  updateResearcher,
} from "../../services/researcherService";

function ResearcherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [researcher, setResearcher] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingResearchProfile, setEditingResearchProfile] =
    useState(false);

  const [profileForm, setProfileForm] = useState({
    email: "",
  });

  const [researcherForm, setResearcherForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    experience: 0,
    bio: "",
    orcid: "",
    google_scholar: "",
    research_gate: "",
    linkedin: "",
  });

  /* ============================================================
     LOAD LOGGED-IN USER
  ============================================================ */

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      let storedUser = null;

      const localUser = localStorage.getItem("user");
      const sessionUser = sessionStorage.getItem("user");

      if (localUser) {
        try {
          storedUser = JSON.parse(localUser);
        } catch (err) {
          console.error("Failed to parse localStorage user:", err);
        }
      }

      if (!storedUser && sessionUser) {
        try {
          storedUser = JSON.parse(sessionUser);
        } catch (err) {
          console.error("Failed to parse sessionStorage user:", err);
        }
      }

      if (!storedUser) {
        throw new Error(
          "Logged-in user information could not be found."
        );
      }

      /*
       * /profile should normally show the logged-in user.
       *
       * If an ID is explicitly supplied, use that user instead.
       */
      const userId = id || storedUser.id;

      if (!userId) {
        throw new Error("User ID is missing.");
      }

      const userData = await getUserById(userId);

      setUser(userData);

      setProfileForm({
        email: userData?.email || "",
      });

      /*
       * ----------------------------------------------------------
       * OPTIONAL RESEARCHER PROFILE
       * ----------------------------------------------------------
       *
       * A user does NOT need to have a researcher profile.
       *
       * If this user happens to be a researcher, load their
       * researcher information as an optional extension.
       */
      try {
        const researchers = await getResearchers();

        const researcherData = Array.isArray(researchers)
          ? researchers.find(
              (item) =>
                String(item.user_id) === String(userData.id)
            )
          : null;

        if (researcherData) {
          setResearcher(researcherData);

          setResearcherForm({
            first_name: researcherData.first_name || "",
            last_name: researcherData.last_name || "",
            phone: researcherData.phone || "",
            experience: researcherData.experience || 0,
            bio: researcherData.bio || "",
            orcid: researcherData.orcid || "",
            google_scholar:
              researcherData.google_scholar || "",
            research_gate:
              researcherData.research_gate || "",
            linkedin: researcherData.linkedin || "",
          });
        } else {
          setResearcher(null);
        }
      } catch (researcherError) {
        /*
         * Failure to load researcher information should NOT
         * break the generic user profile.
         */
        console.warn(
          "No researcher profile available:",
          researcherError
        );

        setResearcher(null);
      }

      /*
       * Update cached user information so Navbar and other
       * components have the latest role/email.
       */
      const updatedStoredUser = {
        ...storedUser,
        ...userData,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedStoredUser)
      );

      if (sessionStorage.getItem("user")) {
        sessionStorage.setItem(
          "user",
          JSON.stringify(updatedStoredUser)
        );
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load user profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     ROLE HELPERS
  ============================================================ */

  const normalizedRole = String(
    user?.role ||
      user?.user_role ||
      user?.role_name ||
      "USER"
  )
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const getRoleInfo = () => {
    switch (normalizedRole) {
      case "SYSTEM_ADMIN":
      case "SYSTEMADMIN":
        return {
          label: "System Administrator",
          shortLabel: "System Admin",
          profileLabel: "SYSTEM ADMIN PROFILE",
          icon: "bi-shield-check",
          description:
            "Full system administration privileges",
          accent: "admin",
        };

      case "INSTITUTION_ADMIN":
      case "INSTITUTIONADMIN":
        return {
          label: "Institution Administrator",
          shortLabel: "Institution Admin",
          profileLabel: "INSTITUTION ADMIN PROFILE",
          icon: "bi-building-check",
          description:
            "Institution administration privileges",
          accent: "institution",
        };

      case "REVIEWER":
        return {
          label: "Reviewer",
          shortLabel: "Reviewer",
          profileLabel: "REVIEWER PROFILE",
          icon: "bi-clipboard-check",
          description:
            "Publication and research review privileges",
          accent: "reviewer",
        };

      case "RESEARCHER":
        return {
          label: "Researcher",
          shortLabel: "Researcher",
          profileLabel: "RESEARCHER PROFILE",
          icon: "bi-flask",
          description:
            "Research and collaboration account",
          accent: "researcher",
        };

      default:
        return {
          label: "User",
          shortLabel: "User",
          profileLabel: "USER PROFILE",
          icon: "bi-person",
          description:
            "SCNA platform user account",
          accent: "user",
        };
    }
  };

  const roleInfo = getRoleInfo();

  /* ============================================================
     NAME / INITIALS
  ============================================================ */

  const getDisplayName = () => {
    /*
     * Researcher accounts may have a proper first/last name.
     */
    if (researcher) {
      const researcherName =
        `${researcher.first_name || ""} ${
          researcher.last_name || ""
        }`.trim();

      if (researcherName) {
        return researcherName;
      }
    }

    /*
     * Some user responses may contain first_name / last_name.
     */
    const userName =
      `${user?.first_name || ""} ${
        user?.last_name || ""
      }`.trim();

    if (userName) {
      return userName;
    }

    /*
     * Fall back to username if available.
     */
    if (user?.username) {
      return user.username;
    }

    /*
     * Finally use the email before @.
     */
    if (user?.email) {
      return user.email.split("@")[0];
    }

    return "SCNA User";
  };

  const displayName = getDisplayName();

  const initials = (() => {
    const parts = displayName
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }

    return (
      displayName.substring(0, 2) || "U"
    ).toUpperCase();
  })();

  /* ============================================================
     OWN PROFILE
  ============================================================ */

  const storedLocalUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  })();

  const isOwnProfile =
    !id ||
    !storedLocalUser ||
    String(storedLocalUser.id) === String(user?.id);

  /* ============================================================
     RESEARCHER DATA
  ============================================================ */

  const publications = researcher?.publications || [];

  const latestPublication =
    publications.length > 0
      ? publications[0]
      : null;

  /* ============================================================
     PROFILE EDIT
  ============================================================ */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setSaving(true);

      /*
       * Only send editable generic user fields.
       *
       * IMPORTANT:
       * Role and account status are deliberately NOT sent.
       * They must remain controlled by the backend/admin.
       */
      const updatedUser = await updateUser(user.id, {
        email: profileForm.email,
      });

      setUser(updatedUser);

      /*
       * Keep local authentication user data synchronized.
       */
      const localUser =
        localStorage.getItem("user");

      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              ...updatedUser,
            })
          );
        } catch (err) {
          console.error(
            "Failed to update cached user:",
            err
          );
        }
      }

      const sessionUser =
        sessionStorage.getItem("user");

      if (sessionUser) {
        try {
          const parsed =
            JSON.parse(sessionUser);

          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              ...updatedUser,
            })
          );
        } catch (err) {
          console.error(
            "Failed to update session user:",
            err
          );
        }
      }

      setEditingProfile(false);

      alert("Account information updated successfully.");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to update account information."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     RESEARCHER PROFILE EDIT
     ============================================================ */

  const handleResearcherChange = (event) => {
    const { name, value } = event.target;

    setResearcherForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveResearcherProfile = async () => {
    if (!researcher?.id) {
      return;
    }

    try {
      setSaving(true);

      const updated = await updateResearcher(
        researcher.id,
        {
          ...researcherForm,
          experience:
            Number(researcherForm.experience) || 0,
        }
      );

      setResearcher(updated);

      setResearcherForm({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        phone: updated.phone || "",
        experience: updated.experience || 0,
        bio: updated.bio || "",
        orcid: updated.orcid || "",
        google_scholar:
          updated.google_scholar || "",
        research_gate:
          updated.research_gate || "",
        linkedin: updated.linkedin || "",
      });

      setEditingResearchProfile(false);

      alert("Research profile updated successfully.");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to update research profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     SOCIAL LINKS
     ============================================================ */

  const socialLinks = researcher
    ? [
        {
          name: "ORCID",
          value: researcher.orcid,
          icon: "bi-person-badge",
          accent: "green",
        },
        {
          name: "Google Scholar",
          value: researcher.google_scholar,
          icon: "bi-mortarboard",
          accent: "blue",
        },
        {
          name: "ResearchGate",
          value: researcher.research_gate,
          icon: "bi-journal-richtext",
          accent: "cyan",
        },
        {
          name: "LinkedIn",
          value: researcher.linkedin,
          icon: "bi-linkedin",
          accent: "indigo",
        },
      ]
    : [];

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="user-profile-page">
          <div className="profile-loader">
            <div className="loader-orbit">
              <div></div>
            </div>

            <h3>Loading profile</h3>
            <p>
              Preparing your SCNA account information...
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !user) {
    return (
      <>
        <style>{styles}</style>

        <div className="user-profile-page">
          <div className="profile-error-box">
            <div className="error-symbol">
              <i className="bi bi-person-x"></i>
            </div>

            <h3>Unable to load profile</h3>

            <p>
              {error ||
                "The requested user profile could not be found."}
            </p>

            <div className="error-actions">
              <button
                className="btn-outline-ui"
                onClick={() => navigate("/")}
              >
                <i className="bi bi-house"></i>
                Home
              </button>

              <button
                className="btn-primary-ui"
                onClick={loadUserProfile}
              >
                <i className="bi bi-arrow-clockwise"></i>
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     MAIN PROFILE
  ============================================================ */

  return (
    <>
      <style>{styles}</style>

      <div className="user-profile-page">
        <div className="profile-container">

          {/* =====================================================
              PROFILE HEADER
          ===================================================== */}

          <section className="profile-header card-ui">
            <div className="profile-header-main">

              <div className={`avatar avatar-${roleInfo.accent}`}>
                {initials}
              </div>

              <div className="profile-identity">

                <div className="eyebrow">
                  <i className={`bi ${roleInfo.icon}`}></i>
                  {roleInfo.profileLabel}
                </div>

                <h1>{displayName}</h1>

                <div className="role-line">

                  <span>
                    <i
                      className={`bi ${roleInfo.icon}`}
                    ></i>

                    {roleInfo.label}
                  </span>

                  <span className="dot-separator">
                    •
                  </span>

                  <span>
                    {user.is_active === false
                      ? "Inactive account"
                      : roleInfo.description}
                  </span>
                </div>

                <div className="profile-meta">

                  {user.email && (
                    <span>
                      <i className="bi bi-envelope"></i>
                      {user.email}
                    </span>
                  )}

                  {user.username && (
                    <span>
                      <i className="bi bi-at"></i>
                      {user.username}
                    </span>
                  )}

                  {user.id && (
                    <span>
                      <i className="bi bi-fingerprint"></i>
                      ID: {String(user.id).slice(0, 12)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="header-actions">

              {isOwnProfile && (
                <button
                  className="btn-primary-ui"
                  onClick={() =>
                    setEditingProfile(true)
                  }
                >
                  <i className="bi bi-pencil-square"></i>
                  Edit Account
                </button>
              )}

              {researcher && isOwnProfile && (
                <button
                  className="btn-outline-ui"
                  onClick={() =>
                    setEditingResearchProfile(true)
                  }
                >
                  <i className="bi bi-person-badge"></i>
                  Research Profile
                </button>
              )}
            </div>
          </section>

          {/* =====================================================
              ACCOUNT STATS
          ===================================================== */}

          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon blue">
                <i className="bi bi-person-badge"></i>
              </div>

              <div>
                <strong>
                  {roleInfo.shortLabel}
                </strong>

                <span>Account Role</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <i className="bi bi-check-circle"></i>
              </div>

              <div>
                <strong>
                  {user.is_active === false
                    ? "Inactive"
                    : "Active"}
                </strong>

                <span>Account Status</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <i className="bi bi-envelope"></i>
              </div>

              <div>
                <strong>
                  {user.email ? "Verified" : "—"}
                </strong>

                <span>Email Account</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <i className="bi bi-calendar-check"></i>
              </div>

              <div>
                <strong>
                  {user.created_at
                    ? new Date(
                        user.created_at
                      ).getFullYear()
                    : "—"}
                </strong>

                <span>Joined</span>
              </div>
            </div>
          </section>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="content-grid">

            <main>

              {/* =================================================
                  ABOUT ACCOUNT
              ================================================= */}

              <section className="card-ui section-card">

                <div className="section-title">
                  <div>
                    <h2>About Your Account</h2>

                    <p>
                      Your SCNA account information
                    </p>
                  </div>
                </div>

                <div className="section-body">

                  <div className="account-information">

                    <div className="info-row">
                      <div className="info-icon blue">
                        <i className="bi bi-envelope"></i>
                      </div>

                      <div>
                        <label>Email Address</label>
                        <strong>
                          {user.email ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-icon purple">
                        <i className="bi bi-person-badge"></i>
                      </div>

                      <div>
                        <label>Role</label>
                        <strong>
                          {roleInfo.label}
                        </strong>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-icon green">
                        <i className="bi bi-shield-check"></i>
                      </div>

                      <div>
                        <label>Account Status</label>
                        <strong>
                          {user.is_active === false
                            ? "Inactive"
                            : "Active"}
                        </strong>
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-icon orange">
                        <i className="bi bi-calendar3"></i>
                      </div>

                      <div>
                        <label>Account Created</label>

                        <strong>
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Not available"}
                        </strong>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* =================================================
                  ROLE INFORMATION
              ================================================= */}

              <section className="card-ui section-card">

                <div className="section-title">
                  <div>
                    <h2>Role & Permissions</h2>

                    <p>
                      Your access level within SCNA
                    </p>
                  </div>
                </div>

                <div className="section-body">

                  <div className="role-information">

                    <div
                      className={`large-role-icon ${roleInfo.accent}`}
                    >
                      <i
                        className={`bi ${roleInfo.icon}`}
                      ></i>
                    </div>

                    <div>
                      <h3>
                        {roleInfo.label}
                      </h3>

                      <p>
                        {roleInfo.description}.
                      </p>

                      <div className="role-badge">
                        {normalizedRole}
                      </div>
                    </div>
                  </div>

                  <div className="security-note">
                    <i className="bi bi-lock"></i>

                    <div>
                      <strong>
                        Role managed securely
                      </strong>

                      <span>
                        Your role and administrative
                        privileges cannot be changed
                        from this profile page.
                      </span>
                    </div>
                  </div>

                </div>
              </section>

              {/* =================================================
                  RESEARCHER EXTENSION
                  Only shown when the user actually has one.
              ================================================= */}

              {researcher && (
                <>
                  <section className="card-ui section-card">

                    <div className="section-title with-action">

                      <div>
                        <h2>
                          Research Profile
                        </h2>

                        <p>
                          Research information associated
                          with your account
                        </p>
                      </div>

                      {isOwnProfile && (
                        <button
                          className="small-outline"
                          onClick={() =>
                            setEditingResearchProfile(
                              true
                            )
                          }
                        >
                          <i className="bi bi-pencil"></i>
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="section-body">

                      <div className="researcher-summary">

                        <div className="summary-item">
                          <strong>
                            {researcher.experience ||
                              0}
                          </strong>

                          <span>
                            Years Experience
                          </span>
                        </div>

                        <div className="summary-item">
                          <strong>
                            {publications.length}
                          </strong>

                          <span>
                            Publications
                          </span>
                        </div>

                        <div className="summary-item">
                          <strong>
                            {researcher.skills
                              ? researcher.skills
                                  .split(",")
                                  .filter(Boolean)
                                  .length
                              : 0}
                          </strong>

                          <span>
                            Technical Skills
                          </span>
                        </div>

                        <div className="summary-item">
                          <strong>
                            {researcher.interests
                              ? researcher.interests
                                  .split(",")
                                  .filter(Boolean)
                                  .length
                              : 0}
                          </strong>

                          <span>
                            Research Interests
                          </span>
                        </div>

                      </div>

                      {researcher.bio && (
                        <div className="research-bio">
                          <h3>Biography</h3>
                          <p>
                            {researcher.bio}
                          </p>
                        </div>
                      )}

                    </div>
                  </section>

                  {/* =============================================
                      PUBLICATIONS
                  ============================================= */}

                  <section className="card-ui section-card">

                    <div className="section-title with-count">

                      <div>
                        <h2>
                          Publications
                        </h2>

                        <p>
                          Research work associated
                          with this account
                        </p>
                      </div>

                      <span className="count-badge">
                        {publications.length}
                      </span>
                    </div>

                    <div className="publication-list">

                      {publications.length ? (
                        publications.map(
                          (publication) => (
                            <article
                              className="publication-item"
                              key={publication.id}
                              onClick={() =>
                                publication.id &&
                                navigate(
                                  `/publications/${publication.id}`
                                )
                              }
                            >
                              <div className="publication-main">

                                <div className="publication-year">
                                  {publication.publication_year ||
                                    "—"}
                                </div>

                                <div className="publication-info">

                                  <h3>
                                    {publication.title ||
                                      "Untitled Publication"}
                                  </h3>

                                  {publication.abstract && (
                                    <p>
                                      {
                                        publication.abstract
                                      }
                                    </p>
                                  )}

                                  <div className="publication-meta">

                                    {publication.journal && (
                                      <span>
                                        <i className="bi bi-journal"></i>
                                        {
                                          publication.journal
                                        }
                                      </span>
                                    )}

                                    {publication.conference && (
                                      <span>
                                        <i className="bi bi-mic"></i>
                                        {
                                          publication.conference
                                        }
                                      </span>
                                    )}

                                    {publication.publication_type && (
                                      <span className="type-badge">
                                        {
                                          publication.publication_type
                                        }
                                      </span>
                                    )}

                                  </div>
                                </div>
                              </div>

                              <i className="bi bi-chevron-right publication-arrow"></i>
                            </article>
                          )
                        )
                      ) : (
                        <div className="empty-publications">
                          <i className="bi bi-journal-x"></i>

                          <strong>
                            No publications yet
                          </strong>

                          <span>
                            Research publications
                            will appear here once
                            associated with your
                            profile.
                          </span>
                        </div>
                      )}

                    </div>
                  </section>
                </>
              )}

            </main>

            {/* ===================================================
                SIDEBAR
            =================================================== */}

            <aside>

              {/* ACCOUNT */}
              <section className="card-ui side-card">

                <div className="side-title">
                  Account
                </div>

                <div className="contact-row">

                  <div className="side-icon blue">
                    <i className="bi bi-envelope"></i>
                  </div>

                  <div>
                    <label>Email</label>

                    <strong>
                      {user.email ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="contact-row">

                  <div className="side-icon purple">
                    <i className="bi bi-person-badge"></i>
                  </div>

                  <div>
                    <label>Role</label>

                    <strong>
                      {roleInfo.label}
                    </strong>
                  </div>
                </div>

                <div className="contact-row">

                  <div className="side-icon green">
                    <i className="bi bi-shield-check"></i>
                  </div>

                  <div>
                    <label>Status</label>

                    <strong>
                      {user.is_active === false
                        ? "Inactive"
                        : "Active"}
                    </strong>
                  </div>
                </div>

              </section>

              {/* RESEARCH PROFILES */}
              {researcher && (
                <section className="card-ui side-card">

                  <div className="side-title">
                    Research Profiles
                  </div>

                  <div className="social-list">

                    {socialLinks.map(
                      (social) => (
                        <div
                          key={social.name}
                          className={`social-row ${
                            social.value
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            social.value &&
                            window.open(
                              social.value,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          <div
                            className={`side-icon ${social.accent}`}
                          >
                            <i
                              className={`bi ${social.icon}`}
                            ></i>
                          </div>

                          <div>
                            <strong>
                              {social.name}
                            </strong>

                            <span>
                              {social.value
                                ? "View profile"
                                : "Not provided"}
                            </span>
                          </div>

                          {social.value && (
                            <i className="bi bi-box-arrow-up-right"></i>
                          )}
                        </div>
                      )
                    )}

                  </div>
                </section>
              )}

              {/* SECURITY */}
              <section className="card-ui side-card security-card">

                <div className="side-title">
                  Account Security
                </div>

                <div className="security-status">

                  <div className="security-icon">
                    <i className="bi bi-shield-lock"></i>
                  </div>

                  <div>
                    <strong>
                      Account protected
                    </strong>

                    <span>
                      Authentication is handled
                      securely by SCNA.
                    </span>
                  </div>
                </div>

              </section>

              {/* RESEARCH SNAPSHOT */}
              {researcher && (
                <section className="card-ui side-card snapshot-card">

                  <div className="side-title">
                    Research Snapshot
                  </div>

                  <div className="snapshot-number">
                    {publications.length}
                  </div>

                  <strong>
                    Published works
                  </strong>

                  <p>
                    Research output currently
                    associated with this profile.
                  </p>

                  {latestPublication && (
                    <div className="latest-publication">

                      <label>
                        Latest publication
                      </label>

                      <strong>
                        {latestPublication.title}
                      </strong>

                      {latestPublication.publication_year && (
                        <span>
                          {
                            latestPublication.publication_year
                          }
                        </span>
                      )}

                    </div>
                  )}

                </section>
              )}

            </aside>
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="profile-footer">

            <span>
              SCNA User Account
            </span>

            <span className="footer-line"></span>

            <code>
              {user.id}
            </code>
          </div>

          {/* =====================================================
              EDIT ACCOUNT MODAL
          ===================================================== */}

          {editingProfile && (
            <div
              className="modal-overlay"
              onMouseDown={(event) => {
                if (
                  event.target === event.currentTarget
                ) {
                  setEditingProfile(false);
                }
              }}
            >
              <div className="profile-modal">

                <div className="modal-header">

                  <div>
                    <span>
                      ACCOUNT SETTINGS
                    </span>

                    <h2>
                      Edit Account
                    </h2>

                    <p>
                      Update the editable information
                      associated with your SCNA account.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setEditingProfile(false)
                    }
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>

                </div>

                <div className="modal-body">

                  <div className="form-section-label">
                    <i className="bi bi-person"></i>
                    Account Information
                  </div>

                  <div className="form-grid">

                    <div className="field full">

                      <label>
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={
                          profileForm.email
                        }
                        onChange={
                          handleProfileChange
                        }
                        placeholder="Enter your email address"
                      />

                    </div>

                  </div>

                  <div className="read-only-account">

                    <div>
                      <label>
                        Role
                      </label>

                      <strong>
                        {roleInfo.label}
                      </strong>
                    </div>

                    <div>
                      <label>
                        Account Status
                      </label>

                      <strong>
                        {user.is_active === false
                          ? "Inactive"
                          : "Active"}
                      </strong>
                    </div>

                  </div>

                  <div className="security-note modal-note">

                    <i className="bi bi-lock"></i>

                    <div>
                      <strong>
                        Protected information
                      </strong>

                      <span>
                        Your role and account status
                        cannot be changed from here.
                      </span>
                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    className="btn-outline-ui"
                    onClick={() =>
                      setEditingProfile(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-primary-ui"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    <i className="bi bi-check2"></i>

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              EDIT RESEARCHER PROFILE MODAL
          ===================================================== */}

          {editingResearchProfile &&
            researcher && (
              <div
                className="modal-overlay"
                onMouseDown={(event) => {
                  if (
                    event.target ===
                    event.currentTarget
                  ) {
                    setEditingResearchProfile(
                      false
                    );
                  }
                }}
              >
                <div className="profile-modal">

                  <div className="modal-header">

                    <div>
                      <span>
                        RESEARCH PROFILE
                      </span>

                      <h2>
                        Edit Research Profile
                      </h2>

                      <p>
                        Update your professional and
                        research information.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingResearchProfile(
                          false
                        )
                      }
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>

                  </div>

                  <div className="modal-body">

                    <div className="form-section-label">
                      <i className="bi bi-person"></i>
                      Basic Information
                    </div>

                    <div className="form-grid">

                      <div className="field">
                        <label>
                          First Name
                        </label>

                        <input
                          name="first_name"
                          value={
                            researcherForm.first_name
                          }
                          onChange={
                            handleResearcherChange
                          }
                        />
                      </div>

                      <div className="field">
                        <label>
                          Last Name
                        </label>

                        <input
                          name="last_name"
                          value={
                            researcherForm.last_name
                          }
                          onChange={
                            handleResearcherChange
                          }
                        />
                      </div>

                      <div className="field">
                        <label>
                          Phone
                        </label>

                        <input
                          name="phone"
                          value={
                            researcherForm.phone
                          }
                          onChange={
                            handleResearcherChange
                          }
                        />
                      </div>

                      <div className="field">
                        <label>
                          Experience
                        </label>

                        <input
                          type="number"
                          min="0"
                          name="experience"
                          value={
                            researcherForm.experience
                          }
                          onChange={
                            handleResearcherChange
                          }
                        />
                      </div>

                      <div className="field full">

                        <label>
                          Biography
                        </label>

                        <textarea
                          rows="4"
                          name="bio"
                          value={
                            researcherForm.bio
                          }
                          onChange={
                            handleResearcherChange
                          }
                          placeholder="Tell the research community about yourself..."
                        />

                      </div>

                    </div>

                    <div className="form-section-label second">
                      <i className="bi bi-globe2"></i>
                      Research Profiles
                    </div>

                    <div className="form-grid">

                      <div className="field">
                        <label>
                          ORCID
                        </label>

                        <input
                          name="orcid"
                          value={
                            researcherForm.orcid
                          }
                          onChange={
                            handleResearcherChange
                          }
                          placeholder="https://orcid.org/..."
                        />
                      </div>

                      <div className="field">
                        <label>
                          Google Scholar
                        </label>

                        <input
                          name="google_scholar"
                          value={
                            researcherForm.google_scholar
                          }
                          onChange={
                            handleResearcherChange
                          }
                          placeholder="Google Scholar URL"
                        />
                      </div>

                      <div className="field">
                        <label>
                          ResearchGate
                        </label>

                        <input
                          name="research_gate"
                          value={
                            researcherForm.research_gate
                          }
                          onChange={
                            handleResearcherChange
                          }
                          placeholder="ResearchGate URL"
                        />
                      </div>

                      <div className="field">
                        <label>
                          LinkedIn
                        </label>

                        <input
                          name="linkedin"
                          value={
                            researcherForm.linkedin
                          }
                          onChange={
                            handleResearcherChange
                          }
                          placeholder="LinkedIn URL"
                        />
                      </div>

                    </div>

                  </div>

                  <div className="modal-footer">

                    <button
                      className="btn-outline-ui"
                      onClick={() =>
                        setEditingResearchProfile(
                          false
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      className="btn-primary-ui"
                      onClick={
                        saveResearcherProfile
                      }
                      disabled={saving}
                    >
                      <i className="bi bi-check2"></i>

                      {saving
                        ? "Saving..."
                        : "Save Profile"}
                    </button>

                  </div>

                </div>
              </div>
            )}

        </div>
      </div>
    </>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = `
.user-profile-page{
  min-height:calc(100vh - 70px);
  background:#f8f9fb;
  padding:30px 0 50px;
  color:#212529;
  font-family:inherit;
}

.profile-container{
  width:min(1060px,calc(100% - 32px));
  margin:0 auto;
}

.card-ui{
  background:#fff;
  border:1px solid #e4e7eb;
  border-radius:12px;
  box-shadow:0 2px 8px rgba(25,35,50,.05);
}

/* ================================================================
   HEADER
================================================================ */

.profile-header{
  padding:25px 28px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:25px;
  margin-bottom:18px;
}

.profile-header-main{
  display:flex;
  align-items:center;
  gap:20px;
  min-width:0;
}

.avatar{
  width:100px;
  height:100px;
  flex:0 0 100px;
  border-radius:50%;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:34px;
  font-weight:700;
}

.avatar-admin{
  background:#6f42c1;
}

.avatar-institution{
  background:#198754;
}

.avatar-reviewer{
  background:#fd7e14;
}

.avatar-researcher{
  background:#0d6efd;
}

.avatar-user{
  background:#6c757d;
}

.profile-identity{
  min-width:0;
}

.eyebrow{
  text-transform:uppercase;
  letter-spacing:.7px;
  color:#6c757d;
  font-size:11px;
  font-weight:600;
  margin-bottom:6px;
}

.eyebrow i{
  color:#0d6efd;
  margin-right:5px;
}

.profile-identity h1{
  margin:0;
  font-size:27px;
  font-weight:500;
  color:#212529;
  word-break:break-word;
}

.role-line{
  display:flex;
  align-items:center;
  gap:8px;
  margin-top:7px;
  color:#6c757d;
  font-size:13px;
  flex-wrap:wrap;
}

.role-line span:first-child{
  color:#495057;
}

.role-line i{
  color:#0d6efd;
  margin-right:5px;
}

.dot-separator{
  color:#adb5bd;
}

.profile-meta{
  display:flex;
  gap:18px;
  flex-wrap:wrap;
  margin-top:10px;
  color:#7a828a;
  font-size:11px;
}

.profile-meta i{
  color:#6c757d;
  margin-right:6px;
}

.header-actions{
  display:flex;
  gap:8px;
  flex-shrink:0;
}

/* ================================================================
   BUTTONS
================================================================ */

.btn-primary-ui,
.btn-outline-ui{
  height:36px;
  padding:0 13px;
  border-radius:6px;
  font-size:12px;
  font-weight:600;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  cursor:pointer;
  transition:.15s;
  border:1px solid transparent;
}

.btn-primary-ui{
  background:#0d6efd;
  color:#fff;
  border-color:#0d6efd;
}

.btn-primary-ui:hover{
  background:#0b5ed7;
  border-color:#0a58ca;
}

.btn-primary-ui:disabled{
  opacity:.65;
  cursor:not-allowed;
}

.btn-outline-ui{
  background:#fff;
  color:#0d6efd;
  border-color:#86b7fe;
}

.btn-outline-ui:hover{
  background:#f0f6ff;
}

/* ================================================================
   STATS
================================================================ */

.stats-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
  margin-bottom:18px;
}

.stat-card{
  background:#fff;
  border:1px solid #e4e7eb;
  border-radius:10px;
  min-height:76px;
  padding:14px 16px;
  display:flex;
  align-items:center;
  gap:12px;
}

.stat-icon{
  width:38px;
  height:38px;
  border-radius:8px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.stat-icon.blue{
  background:#eaf2ff;
  color:#0d6efd;
}

.stat-icon.purple{
  background:#f1edff;
  color:#7657d7;
}

.stat-icon.green{
  background:#eaf8f2;
  color:#198754;
}

.stat-icon.orange{
  background:#fff3e5;
  color:#e58b22;
}

.stat-card strong{
  display:block;
  font-size:15px;
  line-height:1.1;
}

.stat-card span{
  display:block;
  color:#6c757d;
  font-size:11px;
  margin-top:4px;
}

/* ================================================================
   CONTENT
================================================================ */

.content-grid{
  display:grid;
  grid-template-columns:minmax(0,1fr) 290px;
  gap:18px;
  align-items:start;
}

.section-card{
  margin-bottom:18px;
  overflow:hidden;
}

.section-title{
  padding:16px 20px;
  border-bottom:1px solid #e9ecef;
  display:flex;
  align-items:center;
}

.section-title.with-action,
.section-title.with-count{
  justify-content:space-between;
}

.section-title h2{
  margin:0;
  font-size:18px;
  font-weight:500;
  color:#212529;
}

.section-title p{
  margin:3px 0 0;
  color:#6c757d;
  font-size:11px;
}

.section-body{
  padding:20px;
}

/* ================================================================
   ACCOUNT INFORMATION
================================================================ */

.account-information{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
}

.info-row{
  display:flex;
  align-items:center;
  gap:12px;
}

.info-icon{
  width:40px;
  height:40px;
  border-radius:8px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.info-icon.blue{
  background:#eaf2ff;
  color:#0d6efd;
}

.info-icon.purple{
  background:#f1edff;
  color:#7657d7;
}

.info-icon.green{
  background:#eaf8f2;
  color:#198754;
}

.info-icon.orange{
  background:#fff3e5;
  color:#e58b22;
}

.info-row label{
  display:block;
  color:#8a929a;
  font-size:10px;
  margin-bottom:3px;
}

.info-row strong{
  display:block;
  color:#343a40;
  font-size:12px;
  font-weight:600;
  word-break:break-word;
}

/* ================================================================
   ROLE
================================================================ */

.role-information{
  display:flex;
  align-items:center;
  gap:15px;
  padding-bottom:18px;
  border-bottom:1px solid #edf0f2;
}

.large-role-icon{
  width:55px;
  height:55px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:22px;
}

.large-role-icon.admin{
  background:#f1eaff;
  color:#6f42c1;
}

.large-role-icon.institution{
  background:#eaf8f2;
  color:#198754;
}

.large-role-icon.reviewer{
  background:#fff3e5;
  color:#fd7e14;
}

.large-role-icon.researcher{
  background:#eaf2ff;
  color:#0d6efd;
}

.large-role-icon.user{
  background:#f1f3f5;
  color:#6c757d;
}

.role-information h3{
  margin:0 0 4px;
  font-size:16px;
  font-weight:600;
}

.role-information p{
  margin:0 0 7px;
  color:#6c757d;
  font-size:11px;
}

.role-badge{
  display:inline-block;
  padding:4px 8px;
  border-radius:5px;
  background:#eef2f6;
  color:#495057;
  font-size:9px;
  font-weight:700;
  letter-spacing:.4px;
}

.security-note{
  display:flex;
  align-items:center;
  gap:10px;
  margin-top:16px;
  padding:12px;
  border-radius:8px;
  background:#f8f9fa;
}

.security-note>i{
  color:#198754;
  font-size:16px;
}

.security-note strong{
  display:block;
  font-size:11px;
  color:#343a40;
}

.security-note span{
  display:block;
  margin-top:2px;
  color:#7d858e;
  font-size:10px;
}

/* ================================================================
   RESEARCHER EXTENSION
================================================================ */

.researcher-summary{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
}

.summary-item{
  background:#f8f9fb;
  border:1px solid #edf0f2;
  border-radius:8px;
  padding:13px;
  text-align:center;
}

.summary-item strong{
  display:block;
  color:#0d6efd;
  font-size:20px;
}

.summary-item span{
  display:block;
  color:#7d858e;
  font-size:9px;
  margin-top:3px;
}

.research-bio{
  margin-top:18px;
  padding-top:18px;
  border-top:1px solid #edf0f2;
}

.research-bio h3{
  margin:0 0 7px;
  font-size:13px;
  font-weight:600;
}

.research-bio p{
  margin:0;
  color:#495057;
  font-size:12px;
  line-height:1.7;
}

/* ================================================================
   PUBLICATIONS
================================================================ */

.count-badge{
  min-width:28px;
  height:28px;
  border-radius:6px;
  background:#eaf2ff;
  color:#0d6efd;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:700;
}

.publication-list{
  padding:4px 20px 10px;
}

.publication-item{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:15px;
  padding:17px 3px;
  border-bottom:1px solid #edf0f2;
  cursor:pointer;
}

.publication-item:last-child{
  border-bottom:0;
}

.publication-item:hover
.publication-info h3{
  color:#0d6efd;
}

.publication-main{
  display:flex;
  gap:14px;
  min-width:0;
}

.publication-year{
  width:42px;
  flex:0 0 42px;
  color:#0d6efd;
  font-size:12px;
  font-weight:700;
  padding-top:2px;
}

.publication-info{
  min-width:0;
}

.publication-info h3{
  margin:0 0 6px;
  font-size:15px;
  line-height:1.35;
  font-weight:600;
  color:#212529;
  transition:.15s;
}

.publication-info p{
  margin:0 0 9px;
  color:#6c757d;
  font-size:11px;
  line-height:1.55;
  display:-webkit-box;
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
  overflow:hidden;
}

.publication-meta{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  color:#6c757d;
  font-size:10px;
}

.publication-meta span{
  display:inline-flex;
  align-items:center;
  gap:5px;
}

.publication-meta i{
  color:#0d6efd;
}

.type-badge{
  padding:3px 6px;
  background:#f1f3f5;
  border-radius:4px;
  color:#495057;
  font-weight:600;
}

.publication-arrow{
  color:#adb5bd;
  font-size:12px;
  padding-top:4px;
}

.empty-publications{
  padding:40px 20px;
  text-align:center;
  color:#8a929a;
}

.empty-publications i{
  display:block;
  font-size:25px;
  color:#adb5bd;
  margin-bottom:9px;
}

.empty-publications strong{
  display:block;
  color:#495057;
  font-size:13px;
}

.empty-publications span{
  display:block;
  margin-top:4px;
  font-size:10px;
}

/* ================================================================
   SIDEBAR
================================================================ */

.side-card{
  padding:18px;
  margin-bottom:18px;
}

.side-title{
  text-transform:uppercase;
  letter-spacing:.6px;
  font-size:11px;
  font-weight:700;
  color:#495057;
  padding-bottom:12px;
  border-bottom:1px solid #edf0f2;
}

.contact-row{
  display:flex;
  gap:10px;
  align-items:center;
  padding-top:15px;
}

.side-icon{
  width:34px;
  height:34px;
  flex:0 0 34px;
  border-radius:7px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
}

.side-icon.blue{
  background:#eaf2ff;
  color:#0d6efd;
}

.side-icon.purple{
  background:#f1edff;
  color:#7657d7;
}

.side-icon.green{
  background:#eaf8f2;
  color:#198754;
}

.side-icon.cyan{
  background:#e8f8fb;
  color:#1593a8;
}

.side-icon.indigo{
  background:#eef0ff;
  color:#4c69c8;
}

.contact-row label{
  display:block;
  color:#8a929a;
  font-size:10px;
  margin-bottom:3px;
}

.contact-row strong{
  display:block;
  color:#343a40;
  font-size:11px;
  font-weight:600;
  word-break:break-word;
}

/* ================================================================
   SOCIAL
================================================================ */

.social-list{
  padding-top:6px;
}

.social-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px 0;
  border-bottom:1px solid #f0f1f3;
}

.social-row:last-child{
  border-bottom:0;
}

.social-row.active{
  cursor:pointer;
}

.social-row.active:hover strong{
  color:#0d6efd;
}

.social-row>div:nth-child(2){
  min-width:0;
  flex:1;
}

.social-row strong,
.social-row span{
  display:block;
}

.social-row strong{
  font-size:11px;
  color:#343a40;
}

.social-row span{
  font-size:9px;
  color:#9299a1;
  margin-top:3px;
}

.social-row>i{
  font-size:10px;
  color:#adb5bd;
}

/* ================================================================
   SECURITY
================================================================ */

.security-status{
  display:flex;
  gap:10px;
  align-items:center;
  padding-top:15px;
}

.security-icon{
  width:36px;
  height:36px;
  border-radius:8px;
  background:#eaf8f2;
  color:#198754;
  display:flex;
  align-items:center;
  justify-content:center;
}

.security-status strong{
  display:block;
  color:#343a40;
  font-size:11px;
}

.security-status span{
  display:block;
  color:#9299a1;
  font-size:9px;
  margin-top:3px;
}

/* ================================================================
   SNAPSHOT
================================================================ */

.snapshot-card{
  background:#fbfdff;
}

.snapshot-number{
  font-size:30px;
  color:#0d6efd;
  font-weight:700;
  margin:16px 0 2px;
}

.snapshot-card>strong{
  font-size:12px;
  color:#343a40;
}

.snapshot-card>p{
  font-size:10px;
  color:#7d858e;
  line-height:1.5;
  margin:5px 0 0;
}

.latest-publication{
  margin-top:15px;
  padding-top:13px;
  border-top:1px dashed #dee2e6;
}

.latest-publication label{
  display:block;
  color:#9299a1;
  font-size:9px;
  text-transform:uppercase;
}

.latest-publication strong{
  display:block;
  margin-top:5px;
  color:#343a40;
  font-size:10px;
  line-height:1.5;
}

.latest-publication span{
  display:block;
  margin-top:4px;
  color:#0d6efd;
  font-size:9px;
}

/* ================================================================
   SMALL BUTTON
================================================================ */

.small-outline{
  border:1px solid #86b7fe;
  background:#fff;
  color:#0d6efd;
  border-radius:5px;
  padding:6px 9px;
  font-size:11px;
  display:flex;
  gap:5px;
  align-items:center;
  cursor:pointer;
}

.small-outline:hover{
  background:#f0f6ff;
}

/* ================================================================
   FOOTER
================================================================ */

.profile-footer{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  color:#9aa0a6;
  font-size:9px;
  margin-top:25px;
}

.footer-line{
  width:30px;
  height:1px;
  background:#dfe3e7;
}

.profile-footer code{
  background:#eef0f2;
  padding:3px 6px;
  border-radius:4px;
  color:#747b83;
  font-size:8px;
}

/* ================================================================
   LOADING / ERROR
================================================================ */

.profile-loader{
  width:min(500px,calc(100% - 30px));
  margin:120px auto;
  padding:45px 30px;
  background:#fff;
  border:1px solid #e4e7eb;
  border-radius:14px;
  text-align:center;
  box-shadow:0 8px 30px rgba(25,35,50,.06);
}

.loader-orbit{
  width:50px;
  height:50px;
  border:4px solid #e9ecef;
  border-top-color:#0d6efd;
  border-radius:50%;
  margin:0 auto 20px;
  animation:profileSpin .8s linear infinite;
}

.loader-orbit div{
  display:none;
}

@keyframes profileSpin{
  to{
    transform:rotate(360deg);
  }
}

.profile-loader h3{
  margin:0;
  font-size:18px;
  font-weight:500;
}

.profile-loader p{
  margin:6px 0 0;
  color:#7d858e;
  font-size:11px;
}

.profile-error-box{
  width:min(500px,calc(100% - 30px));
  margin:120px auto;
  padding:45px 30px;
  background:#fff;
  border:1px solid #e4e7eb;
  border-radius:14px;
  text-align:center;
  box-shadow:0 8px 30px rgba(25,35,50,.06);
}

.error-symbol{
  width:55px;
  height:55px;
  margin:0 auto 18px;
  border-radius:12px;
  background:#fff1f1;
  color:#dc3545;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:23px;
}

.profile-error-box h3{
  margin:0;
  font-size:18px;
  font-weight:500;
}

.profile-error-box p{
  margin:8px 0 20px;
  color:#7d858e;
  font-size:11px;
  line-height:1.6;
}

.error-actions{
  display:flex;
  justify-content:center;
  gap:8px;
}

/* ================================================================
   MODAL
================================================================ */

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(33,37,41,.48);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  z-index:3000;
}

.profile-modal{
  width:min(720px,100%);
  max-height:90vh;
  overflow:auto;
  background:#fff;
  border-radius:10px;
  box-shadow:0 20px 50px rgba(0,0,0,.2);
}

.modal-header{
  padding:20px 22px;
  border-bottom:1px solid #e9ecef;
  display:flex;
  justify-content:space-between;
  gap:15px;
}

.modal-header span{
  font-size:10px;
  letter-spacing:.7px;
  color:#0d6efd;
  font-weight:700;
}

.modal-header h2{
  font-size:20px;
  font-weight:500;
  margin:5px 0 3px;
}

.modal-header p{
  margin:0;
  color:#6c757d;
  font-size:11px;
}

.modal-header>button{
  width:32px;
  height:32px;
  border:1px solid #dee2e6;
  background:#fff;
  border-radius:5px;
  color:#6c757d;
  cursor:pointer;
}

.modal-body{
  padding:22px;
}

.form-section-label{
  font-size:12px;
  font-weight:700;
  color:#343a40;
  margin-bottom:13px;
}

.form-section-label i{
  color:#0d6efd;
  margin-right:6px;
}

.form-section-label.second{
  margin-top:22px;
}

.form-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}

.field{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.field.full{
  grid-column:1/-1;
}

.field label{
  font-size:10px;
  color:#495057;
  font-weight:600;
}

.field input,
.field textarea{
  width:100%;
  border:1px solid #ced4da;
  border-radius:6px;
  padding:9px 10px;
  font-size:12px;
  outline:0;
  font-family:inherit;
  box-sizing:border-box;
}

.field textarea{
  resize:vertical;
}

.field input:focus,
.field textarea:focus{
  border-color:#86b7fe;
  box-shadow:0 0 0 .18rem rgba(13,110,253,.12);
}

.read-only-account{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-top:20px;
  padding-top:20px;
  border-top:1px solid #edf0f2;
}

.read-only-account>div{
  background:#f8f9fa;
  border-radius:7px;
  padding:12px;
}

.read-only-account label{
  display:block;
  color:#8a929a;
  font-size:9px;
  margin-bottom:4px;
}

.read-only-account strong{
  display:block;
  color:#343a40;
  font-size:11px;
}

.modal-note{
  margin-top:15px;
}

.modal-footer{
  padding:14px 22px;
  border-top:1px solid #e9ecef;
  display:flex;
  justify-content:flex-end;
  gap:8px;
}

/* ================================================================
   RESPONSIVE
================================================================ */

@media(max-width:900px){

  .content-grid{
    grid-template-columns:1fr;
  }

  .stats-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .profile-header{
    align-items:flex-start;
    flex-direction:column;
  }

  .header-actions{
    width:100%;
  }

  .header-actions button{
    flex:1;
  }

}

@media(max-width:600px){

  .profile-container{
    width:calc(100% - 20px);
  }

  .profile-header{
    padding:20px;
  }

  .profile-header-main{
    align-items:flex-start;
  }

  .avatar{
    width:78px;
    height:78px;
    flex-basis:78px;
    font-size:27px;
  }

  .profile-identity h1{
    font-size:22px;
  }

  .profile-meta{
    gap:8px;
    flex-direction:column;
  }

  .stats-grid{
    grid-template-columns:1fr 1fr;
    gap:8px;
  }

  .stat-card{
    padding:12px;
  }

  .content-grid{
    gap:10px;
  }

  .section-title,
  .section-body{
    padding:15px;
  }

  .publication-list{
    padding:4px 15px;
  }

  .publication-main{
    gap:9px;
  }

  .publication-year{
    width:35px;
    flex-basis:35px;
  }

  .publication-info h3{
    font-size:13px;
  }

  .publication-meta{
    gap:7px;
  }

  .form-grid{
    grid-template-columns:1fr;
  }

  .field.full{
    grid-column:auto;
  }

  .account-information{
    grid-template-columns:1fr;
  }

  .researcher-summary{
    grid-template-columns:1fr 1fr;
  }

  .read-only-account{
    grid-template-columns:1fr;
  }

  .modal-overlay{
    padding:10px;
  }

}

@media(max-width:400px){

  .stats-grid{
    grid-template-columns:1fr;
  }

  .researcher-summary{
    grid-template-columns:1fr;
  }

  .header-actions{
    flex-direction:column;
  }

  .profile-header-main{
    flex-direction:column;
  }

  .avatar{
    width:70px;
    height:70px;
    flex-basis:70px;
  }

}
`;

export default ResearcherProfile;