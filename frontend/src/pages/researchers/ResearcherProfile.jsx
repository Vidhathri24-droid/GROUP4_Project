import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getResearcher,
  getResearchers,
  updateResearcher,
} from "../../services/researcherService";

function ResearcherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [researcher, setResearcher] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);

  const [profileForm, setProfileForm] = useState({
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

  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  /* ============================================================
     LOAD USER
  ============================================================ */

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to read logged-in user:", err);
      }
    }
  }, []);

  /* ============================================================
     LOAD RESEARCHER
  ============================================================ */

  useEffect(() => {
    loadResearcher();
  }, [id]);

  const loadResearcher = async () => {
    try {
      setLoading(true);
      setError("");

      let researcherData;

      if (id) {
        researcherData = await getResearcher(id);
      } else {
        const researchers = await getResearchers();

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          throw new Error("Logged-in user information not found.");
        }

        const user = JSON.parse(storedUser);

        researcherData = researchers.find(
          (item) => String(item.user_id) === String(user.id)
        );

        if (!researcherData) {
          throw new Error(
            "Researcher profile was not found for the logged-in user."
          );
        }
      }

      setResearcher(researcherData);

      setProfileForm({
        first_name: researcherData.first_name || "",
        last_name: researcherData.last_name || "",
        phone: researcherData.phone || "",
        experience: researcherData.experience || 0,
        bio: researcherData.bio || "",
        orcid: researcherData.orcid || "",
        google_scholar: researcherData.google_scholar || "",
        research_gate: researcherData.research_gate || "",
        linkedin: researcherData.linkedin || "",
      });

      setSkills(
        researcherData.skills
          ? researcherData.skills
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : []
      );

      setInterests(
        researcherData.interests
          ? researcherData.interests
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load researcher profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     HELPERS
  ============================================================ */

  const isOwnProfile =
    currentUser &&
    researcher &&
    String(currentUser.id) === String(researcher.user_id);

  const fullName =
    `${researcher?.first_name || ""} ${
      researcher?.last_name || ""
    }`.trim() || "Researcher";

  const initials =
    `${researcher?.first_name?.charAt(0) || ""}${
      researcher?.last_name?.charAt(0) || ""
    }`.toUpperCase() || "R";

  const publications = researcher?.publications || [];

  const latestPublication = publications[0];

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
    try {
      setSaving(true);

      const updated = await updateResearcher(researcher.id, {
        ...profileForm,
        experience: Number(profileForm.experience) || 0,
      });

      setResearcher(updated);
      setEditingProfile(false);

      alert("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
          "Failed to update researcher profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     SKILLS
  ============================================================ */

  const addSkill = () => {
    const value = newSkill.trim();

    if (!value) return;

    if (
      !skills.some(
        (skill) => skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSkills((previous) => [...previous, value]);
    }

    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const saveSkills = async () => {
    try {
      setSaving(true);

      const updated = await updateResearcher(researcher.id, {
        skills: skills.join(", "),
      });

      setResearcher(updated);
      setEditingSkills(false);

      alert("Skills updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills.");
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     INTERESTS
  ============================================================ */

  const addInterest = () => {
    const value = newInterest.trim();

    if (!value) return;

    if (
      !interests.some(
        (interest) =>
          interest.toLowerCase() === value.toLowerCase()
      )
    ) {
      setInterests((previous) => [...previous, value]);
    }

    setNewInterest("");
  };

  const removeInterest = (interestToRemove) => {
    setInterests((previous) =>
      previous.filter(
        (interest) => interest !== interestToRemove
      )
    );
  };

  const saveInterests = async () => {
    try {
      setSaving(true);

      const updated = await updateResearcher(researcher.id, {
        interests: interests.join(", "),
      });

      setResearcher(updated);
      setEditingInterests(false);

      alert("Research interests updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update research interests.");
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     SOCIAL LINKS
  ============================================================ */

  const socialLinks = [
    {
      name: "ORCID",
      value: researcher?.orcid,
      icon: "bi-person-badge",
      accent: "green",
    },
    {
      name: "Google Scholar",
      value: researcher?.google_scholar,
      icon: "bi-mortarboard",
      accent: "blue",
    },
    {
      name: "ResearchGate",
      value: researcher?.research_gate,
      icon: "bi-journal-richtext",
      accent: "cyan",
    },
    {
      name: "LinkedIn",
      value: researcher?.linkedin,
      icon: "bi-linkedin",
      accent: "indigo",
    },
  ];

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="scna-profile-page">
          <div className="profile-loader">
            <div className="loader-orbit">
              <div></div>
            </div>

            <h3>Loading researcher</h3>
            <p>Preparing the research profile...</p>
          </div>
        </div>
      </>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !researcher) {
    return (
      <>
        <style>{styles}</style>

        <div className="scna-profile-page">
          <div className="profile-error-box">
            <div className="error-symbol">
              <i className="bi bi-person-x"></i>
            </div>

            <h3>
              {error
                ? "Unable to load researcher"
                : "Researcher not found"}
            </h3>

            <p>
              {error ||
                "The requested researcher profile could not be found."}
            </p>

            <div className="error-actions">
              <button
                className="btn-outline-scna"
                onClick={() => navigate("/researchers")}
              >
                <i className="bi bi-arrow-left"></i>
                Researchers
              </button>

              {error && (
                <button
                  className="btn-primary-scna"
                  onClick={loadResearcher}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="profile-page">
        <div className="profile-container">

          {/* PROFILE HEADER */}
          <section className="profile-header card-ui">
            <div className="profile-header-main">
              <div className="avatar">{initials}</div>
              <div className="profile-identity">
                <div className="eyebrow"><i className="bi bi-person-badge"></i> Researcher Profile</div>
                <h1>{fullName}</h1>
                <div className="role-line">
                  <span><i className="bi bi-mortarboard"></i> Researcher</span>
                  <span className="dot-separator">•</span>
                  <span>{researcher.experience || 0} {researcher.experience === 1 ? "year" : "years"} experience</span>
                </div>
                <div className="profile-meta">
                  {researcher.phone && <span><i className="bi bi-telephone"></i>{researcher.phone}</span>}
                  <span><i className="bi bi-fingerprint"></i>ID: {String(researcher.id).slice(0, 12)}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              {isOwnProfile ? (
                <button className="btn-primary-ui" onClick={() => setEditingProfile(true)}>
                  <i className="bi bi-pencil-square"></i> Edit Profile
                </button>
              ) : (
                <button className="btn-primary-ui" onClick={() => navigate(`/collaborations?researcher=${researcher.id}`)}>
                  <i className="bi bi-people"></i> Collaborate
                </button>
              )}
              <button className="btn-outline-ui" onClick={() => navigate("/researchers")}>
                <i className="bi bi-arrow-left"></i> Researchers
              </button>
            </div>
          </section>

          {/* QUICK STATS */}
          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon blue"><i className="bi bi-journal-text"></i></div><div><strong>{publications.length}</strong><span>Publications</span></div></div>
            <div className="stat-card"><div className="stat-icon purple"><i className="bi bi-lightbulb"></i></div><div><strong>{interests.length}</strong><span>Research Interests</span></div></div>
            <div className="stat-card"><div className="stat-icon green"><i className="bi bi-code-slash"></i></div><div><strong>{skills.length}</strong><span>Technical Skills</span></div></div>
            <div className="stat-card"><div className="stat-icon orange"><i className="bi bi-award"></i></div><div><strong>{researcher.experience || 0}</strong><span>Years Experience</span></div></div>
          </section>

          <div className="content-grid">
            <main>
              {/* ABOUT */}
              <section className="card-ui section-card">
                <div className="section-title">
                  <div><h2>About</h2><p>Professional background and biography</p></div>
                </div>
                <div className="section-body">
                  {researcher.bio ? <p className="bio-text">{researcher.bio}</p> : <div className="empty-inline"><i className="bi bi-chat-square-text"></i><div><strong>No biography available</strong><span>{isOwnProfile ? "Add a short biography to introduce yourself." : "This researcher has not added a biography yet."}</span></div></div>}
                </div>
              </section>

              {/* SKILLS */}
              <section className="card-ui section-card">
                <div className="section-title with-action">
                  <div><h2>Technical Skills</h2><p>Tools and technologies</p></div>
                  {isOwnProfile && <button className="small-outline" onClick={() => setEditingSkills(!editingSkills)}><i className="bi bi-pencil"></i>{editingSkills ? "Cancel" : "Edit"}</button>}
                </div>
                <div className="section-body">
                  {skills.length ? <div className="tag-list">{skills.map((skill) => <span className="skill-tag" key={skill}>{skill}{editingSkills && <button onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}><i className="bi bi-x"></i></button>}</span>)}</div> : <div className="empty-inline"><i className="bi bi-code-slash"></i><div><strong>No skills added</strong><span>Add technical skills to your profile.</span></div></div>}
                  {editingSkills && <div className="tag-editor"><input value={newSkill} placeholder="Add a skill..." onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} /><button className="btn-primary-ui" onClick={saveSkills} disabled={saving}>{saving ? "Saving..." : "Save Skills"}</button></div>}
                </div>
              </section>

              {/* INTERESTS */}
              <section className="card-ui section-card">
                <div className="section-title with-action">
                  <div><h2>Research Interests</h2><p>Current areas of academic focus</p></div>
                  {isOwnProfile && <button className="small-outline" onClick={() => setEditingInterests(!editingInterests)}><i className="bi bi-pencil"></i>{editingInterests ? "Cancel" : "Edit"}</button>}
                </div>
                <div className="section-body">
                  {interests.length ? <div className="tag-list">{interests.map((interest) => <span className="interest-tag" key={interest}><i className="bi bi-stars"></i>{interest}{editingInterests && <button onClick={() => removeInterest(interest)} aria-label={`Remove ${interest}`}><i className="bi bi-x"></i></button>}</span>)}</div> : <div className="empty-inline"><i className="bi bi-lightbulb"></i><div><strong>No research interests</strong><span>Add research areas to help others discover your work.</span></div></div>}
                  {editingInterests && <div className="tag-editor"><input value={newInterest} placeholder="Add a research interest..." onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }} /><button className="btn-primary-ui" onClick={saveInterests} disabled={saving}>{saving ? "Saving..." : "Save Interests"}</button></div>}
                </div>
              </section>

              {/* PUBLICATIONS */}
              <section className="card-ui section-card">
                <div className="section-title with-count">
                  <div><h2>Publications</h2><p>Research work associated with this researcher</p></div>
                  <span className="count-badge">{publications.length}</span>
                </div>
                <div className="publication-list">
                  {publications.length ? publications.map((publication) => (
                    <article className="publication-item" key={publication.id} onClick={() => publication.id && navigate(`/publications/${publication.id}`)}>
                      <div className="publication-main">
                        <div className="publication-year">{publication.publication_year || "—"}</div>
                        <div className="publication-info">
                          <h3>{publication.title || "Untitled Publication"}</h3>
                          {publication.abstract && <p>{publication.abstract}</p>}
                          <div className="publication-meta">
                            {publication.journal && <span><i className="bi bi-journal"></i>{publication.journal}</span>}
                            {publication.conference && <span><i className="bi bi-mic"></i>{publication.conference}</span>}
                            {publication.publication_type && <span className="type-badge">{publication.publication_type}</span>}
                          </div>
                        </div>
                      </div>
                      <i className="bi bi-chevron-right publication-arrow"></i>
                    </article>
                  )) : <div className="empty-publications"><i className="bi bi-journal-x"></i><strong>No publications yet</strong><span>Research publications will appear here once associated with this researcher.</span></div>}
                </div>
              </section>
            </main>

            <aside>
              {/* CONTACT */}
              <section className="card-ui side-card">
                <div className="side-title">Contact</div>
                <div className="contact-row"><div className="side-icon blue"><i className="bi bi-telephone"></i></div><div><label>Phone</label><strong>{researcher.phone || "Not provided"}</strong></div></div>
                <div className="contact-row"><div className="side-icon purple"><i className="bi bi-fingerprint"></i></div><div><label>Researcher ID</label><strong>{String(researcher.id).slice(0, 12)}</strong></div></div>
              </section>

              {/* ONLINE PROFILES */}
              <section className="card-ui side-card">
                <div className="side-title">Research Profiles</div>
                <div className="social-list">
                  {socialLinks.map((social) => <div key={social.name} className={`social-row ${social.value ? "active" : ""}`} onClick={() => social.value && window.open(social.value, "_blank", "noopener,noreferrer")}>
                    <div className={`side-icon ${social.accent}`}><i className={`bi ${social.icon}`}></i></div>
                    <div><strong>{social.name}</strong><span>{social.value ? "View profile" : "Not provided"}</span></div>
                    {social.value && <i className="bi bi-box-arrow-up-right"></i>}
                  </div>)}
                </div>
              </section>

              {/* SNAPSHOT */}
              <section className="card-ui side-card snapshot-card">
                <div className="side-title">Research Snapshot</div>
                <div className="snapshot-number">{publications.length}</div>
                <strong>Published works</strong>
                <p>Research output currently associated with this profile.</p>
                {latestPublication && <div className="latest-publication"><label>Latest publication</label><strong>{latestPublication.title}</strong>{latestPublication.publication_year && <span>{latestPublication.publication_year}</span>}</div>}
              </section>
            </aside>
          </div>

          <div className="profile-footer"><span>SCNA Research Network</span><span className="footer-line"></span><code>{researcher.id}</code></div>

          {/* EDIT PROFILE MODAL */}
          {editingProfile && <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setEditingProfile(false)}>
            <div className="profile-modal">
              <div className="modal-header"><div><span>PROFILE SETTINGS</span><h2>Edit Researcher Profile</h2><p>Update your professional information and research profiles.</p></div><button onClick={() => setEditingProfile(false)}><i className="bi bi-x-lg"></i></button></div>
              <div className="modal-body">
                <div className="form-section-label"><i className="bi bi-person"></i> Basic Information</div>
                <div className="form-grid">
                  <div className="field"><label>First Name</label><input name="first_name" value={profileForm.first_name} onChange={handleProfileChange} /></div>
                  <div className="field"><label>Last Name</label><input name="last_name" value={profileForm.last_name} onChange={handleProfileChange} /></div>
                  <div className="field"><label>Phone</label><input name="phone" value={profileForm.phone} onChange={handleProfileChange} /></div>
                  <div className="field"><label>Experience</label><input type="number" min="0" name="experience" value={profileForm.experience} onChange={handleProfileChange} /></div>
                  <div className="field full"><label>Biography</label><textarea rows="4" name="bio" value={profileForm.bio} onChange={handleProfileChange} placeholder="Tell the research community about yourself..." /></div>
                </div>
                <div className="form-section-label second"><i className="bi bi-globe2"></i> Research Profiles</div>
                <div className="form-grid">
                  <div className="field"><label>ORCID</label><input name="orcid" value={profileForm.orcid} onChange={handleProfileChange} placeholder="https://orcid.org/..." /></div>
                  <div className="field"><label>Google Scholar</label><input name="google_scholar" value={profileForm.google_scholar} onChange={handleProfileChange} placeholder="Google Scholar URL" /></div>
                  <div className="field"><label>ResearchGate</label><input name="research_gate" value={profileForm.research_gate} onChange={handleProfileChange} placeholder="ResearchGate URL" /></div>
                  <div className="field"><label>LinkedIn</label><input name="linkedin" value={profileForm.linkedin} onChange={handleProfileChange} placeholder="LinkedIn URL" /></div>
                </div>
              </div>
              <div className="modal-footer"><button className="btn-outline-ui" onClick={() => setEditingProfile(false)}>Cancel</button><button className="btn-primary-ui" onClick={saveProfile} disabled={saving}><i className="bi bi-check2"></i>{saving ? "Saving..." : "Save Profile"}</button></div>
            </div>
          </div>}
        </div>
      </div>
    </>
  );
}

const styles = `
.profile-page{min-height:calc(100vh - 70px);background:#f8f9fb;padding:30px 0 50px;color:#212529;font-family:inherit}
.profile-container{width:min(1060px,calc(100% - 32px));margin:0 auto}
.card-ui{background:#fff;border:1px solid #e4e7eb;border-radius:12px;box-shadow:0 2px 8px rgba(25,35,50,.05)}
.profile-header{padding:25px 28px;display:flex;align-items:center;justify-content:space-between;gap:25px;margin-bottom:18px}
.profile-header-main{display:flex;align-items:center;gap:20px;min-width:0}.avatar{width:100px;height:100px;flex:0 0 100px;border-radius:50%;background:#0d6efd;color:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700}.profile-identity{min-width:0}.eyebrow{text-transform:uppercase;letter-spacing:.7px;color:#6c757d;font-size:11px;font-weight:600;margin-bottom:6px}.eyebrow i{color:#0d6efd;margin-right:5px}.profile-identity h1{margin:0;font-size:27px;font-weight:500;color:#212529}.role-line{display:flex;align-items:center;gap:8px;margin-top:7px;color:#6c757d;font-size:13px}.role-line span:first-child{color:#495057}.role-line i{color:#0d6efd;margin-right:5px}.dot-separator{color:#adb5bd}.profile-meta{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;color:#7a828a;font-size:11px}.profile-meta i{color:#6c757d;margin-right:6px}.header-actions{display:flex;gap:8px;flex-shrink:0}.btn-primary-ui,.btn-outline-ui{height:36px;padding:0 13px;border-radius:6px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:.15s;border:1px solid transparent}.btn-primary-ui{background:#0d6efd;color:#fff;border-color:#0d6efd}.btn-primary-ui:hover{background:#0b5ed7;border-color:#0a58ca}.btn-primary-ui:disabled{opacity:.65;cursor:not-allowed}.btn-outline-ui{background:#fff;color:#0d6efd;border-color:#86b7fe}.btn-outline-ui:hover{background:#f0f6ff}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.stat-card{background:#fff;border:1px solid #e4e7eb;border-radius:10px;min-height:76px;padding:14px 16px;display:flex;align-items:center;gap:12px}.stat-icon{width:38px;height:38px;border-radius:8px;display:flex;align-items:center;justify-content:center}.stat-icon.blue,.side-icon.blue{background:#eaf2ff;color:#0d6efd}.stat-icon.purple,.side-icon.purple{background:#f1edff;color:#7657d7}.stat-icon.green,.side-icon.green{background:#eaf8f2;color:#198754}.stat-icon.orange{background:#fff3e5;color:#e58b22}.stat-card strong{display:block;font-size:18px;line-height:1.1}.stat-card span{display:block;color:#6c757d;font-size:11px;margin-top:4px}.content-grid{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:18px;align-items:start}.section-card{margin-bottom:18px;overflow:hidden}.section-title{padding:16px 20px;border-bottom:1px solid #e9ecef;display:flex;align-items:center}.section-title.with-action,.section-title.with-count{justify-content:space-between}.section-title h2{margin:0;font-size:18px;font-weight:500;color:#212529}.section-title p{margin:3px 0 0;color:#6c757d;font-size:11px}.section-body{padding:20px}.bio-text{margin:0;color:#495057;font-size:13px;line-height:1.8}.small-outline{border:1px solid #86b7fe;background:#fff;color:#0d6efd;border-radius:5px;padding:6px 9px;font-size:11px;display:flex;gap:5px;align-items:center}.small-outline:hover{background:#f0f6ff}.tag-list{display:flex;flex-wrap:wrap;gap:8px}.skill-tag,.interest-tag{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:5px;font-size:11px;font-weight:600}.skill-tag{background:#eef5ff;color:#1769d1;border:1px solid #d7e6ff}.interest-tag{background:#f4f1ff;color:#694bc0;border:1px solid #e7dfff}.skill-tag button,.interest-tag button{border:0;background:transparent;color:inherit;padding:0;cursor:pointer}.tag-editor{display:flex;gap:8px;margin-top:15px;padding-top:15px;border-top:1px solid #edf0f2}.tag-editor input{height:36px;flex:1;min-width:0;border:1px solid #ced4da;border-radius:6px;padding:0 10px;font-size:12px;outline:0}.tag-editor input:focus,.field input:focus,.field textarea:focus{border-color:#86b7fe;box-shadow:0 0 0 .18rem rgba(13,110,253,.12)}.count-badge{min-width:28px;height:28px;border-radius:6px;background:#eaf2ff;color:#0d6efd;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}.publication-list{padding:4px 20px 10px}.publication-item{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:17px 3px;border-bottom:1px solid #edf0f2;cursor:pointer}.publication-item:last-child{border-bottom:0}.publication-item:hover .publication-info h3{color:#0d6efd}.publication-main{display:flex;gap:14px;min-width:0}.publication-year{width:42px;flex:0 0 42px;color:#0d6efd;font-size:12px;font-weight:700;padding-top:2px}.publication-info{min-width:0}.publication-info h3{margin:0 0 6px;font-size:15px;line-height:1.35;font-weight:600;color:#212529;transition:.15s}.publication-info p{margin:0 0 9px;color:#6c757d;font-size:11px;line-height:1.55;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.publication-meta{display:flex;flex-wrap:wrap;gap:12px;color:#6c757d;font-size:10px}.publication-meta span{display:inline-flex;align-items:center;gap:5px}.publication-meta i{color:#0d6efd}.type-badge{padding:3px 6px;background:#f1f3f5;border-radius:4px;color:#495057;font-weight:600}.publication-arrow{color:#adb5bd;font-size:12px;padding-top:4px}.side-card{padding:18px;margin-bottom:18px}.side-title{text-transform:uppercase;letter-spacing:.6px;font-size:11px;font-weight:700;color:#495057;padding-bottom:12px;border-bottom:1px solid #edf0f2}.contact-row{display:flex;gap:10px;align-items:center;padding-top:15px}.side-icon{width:34px;height:34px;flex:0 0 34px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px}.contact-row label{display:block;color:#8a929a;font-size:10px;margin-bottom:3px}.contact-row strong{display:block;color:#343a40;font-size:11px;font-weight:600;word-break:break-word}.social-list{padding-top:6px}.social-row{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #f0f1f3}.social-row:last-child{border-bottom:0}.social-row.active{cursor:pointer}.social-row.active:hover strong{color:#0d6efd}.social-row>div:nth-child(2){min-width:0;flex:1}.social-row strong,.social-row span{display:block}.social-row strong{font-size:11px;color:#343a40}.social-row span{font-size:9px;color:#9299a1;margin-top:3px}.social-row>i{font-size:10px;color:#adb5bd}.side-icon.cyan{background:#e8f8fb;color:#1593a8}.side-icon.indigo{background:#eef0ff;color:#4c69c8}.snapshot-card{background:#fbfdff}.snapshot-number{font-size:30px;color:#0d6efd;font-weight:700;margin:16px 0 2px}.snapshot-card>strong{font-size:12px;color:#343a40}.snapshot-card>p{font-size:10px;color:#7d858e;line-height:1.5;margin:5px 0 0}.latest-publication{margin-top:15px;padding-top:13px;border-top:1px dashed #dee2e6}.latest-publication label{display:block;color:#9299a1;font-size:9px;text-transform:uppercase}.latest-publication strong{display:block;margin-top:5px;color:#343a40;font-size:10px;line-height:1.5}.latest-publication span{display:block;margin-top:4px;color:#0d6efd;font-size:9px}.empty-inline{display:flex;align-items:center;gap:12px;color:#7c858e}.empty-inline>i{width:38px;height:38px;border-radius:7px;background:#f1f3f5;display:flex;align-items:center;justify-content:center}.empty-inline strong{display:block;font-size:12px;color:#495057}.empty-inline span{display:block;font-size:10px;color:#9299a1;margin-top:3px}.empty-publications{padding:40px 20px;text-align:center;color:#8a929a}.empty-publications i{display:block;font-size:25px;color:#adb5bd;margin-bottom:9px}.empty-publications strong{display:block;color:#495057;font-size:13px}.empty-publications span{display:block;margin-top:4px;font-size:10px}.profile-footer{display:flex;align-items:center;justify-content:center;gap:8px;color:#9aa0a6;font-size:9px;margin-top:25px}.footer-line{width:30px;height:1px;background:#dfe3e7}.profile-footer code{background:#eef0f2;padding:3px 6px;border-radius:4px;color:#747b83;font-size:8px}.modal-overlay{position:fixed;inset:0;background:rgba(33,37,41,.48);display:flex;align-items:center;justify-content:center;padding:20px;z-index:3000}.profile-modal{width:min(720px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:10px;box-shadow:0 20px 50px rgba(0,0,0,.2)}.modal-header{padding:20px 22px;border-bottom:1px solid #e9ecef;display:flex;justify-content:space-between;gap:15px}.modal-header span{font-size:10px;letter-spacing:.7px;color:#0d6efd;font-weight:700}.modal-header h2{font-size:20px;font-weight:500;margin:5px 0 3px}.modal-header p{margin:0;color:#6c757d;font-size:11px}.modal-header>button{width:32px;height:32px;border:1px solid #dee2e6;background:#fff;border-radius:5px;color:#6c757d}.modal-body{padding:22px}.form-section-label{font-size:12px;font-weight:700;color:#343a40;margin-bottom:13px}.form-section-label i{color:#0d6efd;margin-right:6px}.form-section-label.second{margin-top:22px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{display:flex;flex-direction:column;gap:6px}.field.full{grid-column:1/-1}.field label{font-size:10px;color:#495057;font-weight:600}.field input,.field textarea{width:100%;border:1px solid #ced4da;border-radius:6px;padding:9px 10px;font-size:12px;outline:0;font-family:inherit}.field textarea{resize:vertical}.modal-footer{padding:14px 22px;border-top:1px solid #e9ecef;display:flex;justify-content:flex-end;gap:8px}
@media(max-width:900px){.content-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}.profile-header{align-items:flex-start;flex-direction:column}.header-actions{width:100%}.header-actions button{flex:1}}
@media(max-width:600px){.profile-container{width:calc(100% - 20px)}.profile-header{padding:20px}.profile-header-main{align-items:flex-start}.avatar{width:78px;height:78px;flex-basis:78px;font-size:27px}.profile-identity h1{font-size:22px}.profile-meta{gap:8px;flex-direction:column}.stats-grid{grid-template-columns:1fr 1fr;gap:8px}.stat-card{padding:12px}.content-grid{gap:10px}.section-title,.section-body{padding:15px}.publication-list{padding:4px 15px}.publication-main{gap:9px}.publication-year{width:35px;flex-basis:35px}.publication-info h3{font-size:13px}.publication-meta{gap:7px}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.tag-editor{flex-direction:column}.modal-overlay{padding:10px}}
@media(max-width:400px){.stats-grid{grid-template-columns:1fr}.header-actions{flex-direction:column}.profile-header-main{flex-direction:column}.avatar{width:70px;height:70px;flex-basis:70px}}
`;

export default ResearcherProfile;