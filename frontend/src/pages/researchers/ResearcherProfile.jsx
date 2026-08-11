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

  const isOwnProfile =
    currentUser &&
    researcher &&
    String(currentUser.id) === String(researcher.user_id);

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

  const addSkill = () => {
    const value = newSkill.trim();

    if (!value) {
      return;
    }

    if (!skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkills((previous) => [...previous, value]);
    }

    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  const addInterest = () => {
    const value = newInterest.trim();

    if (!value) {
      return;
    }

    if (
      !interests.some(
        (interest) => interest.toLowerCase() === value.toLowerCase()
      )
    ) {
      setInterests((previous) => [...previous, value]);
    }

    setNewInterest("");
  };

  const removeInterest = (interestToRemove) => {
    setInterests((previous) =>
      previous.filter((interest) => interest !== interestToRemove)
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3">Loading researcher profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!researcher) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Researcher profile not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">

      {/* PROFILE HEADER */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">

          <div className="row align-items-center">

            <div className="col-md-3 text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: "150px",
                  height: "150px",
                  fontSize: "48px",
                  fontWeight: "bold",
                }}
              >
                {researcher.first_name?.charAt(0)}
                {researcher.last_name?.charAt(0)}
              </div>
            </div>

            <div className="col-md-6 mt-3 mt-md-0">

              <h2 className="mb-1">
                {researcher.first_name} {researcher.last_name}
              </h2>

              <p className="text-muted mb-2">
                Researcher
              </p>

              <p className="mb-1">
                <strong>Experience:</strong>{" "}
                {researcher.experience || 0} years
              </p>

              {researcher.phone && (
                <p className="mb-1">
                  <strong>Phone:</strong> {researcher.phone}
                </p>
              )}

              {researcher.user_id && (
                <p className="text-muted small mb-0">
                  Researcher ID: {researcher.id}
                </p>
              )}

            </div>

            {isOwnProfile && (
              <div className="col-md-3 text-md-end mt-3 mt-md-0">
                <button
                  className="btn btn-primary"
                  onClick={() => setEditingProfile(true)}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </button>
              </div>
            )}

            {!isOwnProfile && (
              <div className="col-md-3 text-md-end mt-3 mt-md-0">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(
                      `/collaborations?researcher=${researcher.id}`
                    )
                  }
                >
                  <i className="bi bi-people-fill me-2"></i>
                  Request Collaboration
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* BIO */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h4 className="mb-0">About</h4>
        </div>

        <div className="card-body">
          {researcher.bio ? (
            <p className="mb-0">{researcher.bio}</p>
          ) : (
            <p className="text-muted mb-0">
              No biography has been added yet.
            </p>
          )}
        </div>
      </div>

      {/* SOCIALS */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h4 className="mb-0">Social & Research Profiles</h4>
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-6 mb-3">
              <strong>
                <i className="bi bi-person-badge me-2"></i>
                ORCID
              </strong>

              <div className="mt-1">
                {researcher.orcid ? (
                  <a
                    href={researcher.orcid}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {researcher.orcid}
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>
                <i className="bi bi-google me-2"></i>
                Google Scholar
              </strong>

              <div className="mt-1">
                {researcher.google_scholar ? (
                  <a
                    href={researcher.google_scholar}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Google Scholar
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>
                <i className="bi bi-journal-bookmark me-2"></i>
                ResearchGate
              </strong>

              <div className="mt-1">
                {researcher.research_gate ? (
                  <a
                    href={researcher.research_gate}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View ResearchGate
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <strong>
                <i className="bi bi-linkedin me-2"></i>
                LinkedIn
              </strong>

              <div className="mt-1">
                {researcher.linkedin ? (
                  <a
                    href={researcher.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View LinkedIn
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SKILLS */}
      <div className="card shadow-sm mb-4">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Skills</h4>

          {isOwnProfile && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setEditingSkills(!editingSkills)}
            >
              <i className="bi bi-pencil me-1"></i>
              {editingSkills ? "Cancel" : "Edit Skills"}
            </button>
          )}
        </div>

        <div className="card-body">

          {skills.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="badge bg-primary fs-6 p-2"
                >
                  {skill}

                  {editingSkills && (
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "8px" }}
                      onClick={() => removeSkill(skill)}
                    ></button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">
              No skills added yet.
            </p>
          )}

          {editingSkills && (
            <div className="input-group mt-4">

              <input
                type="text"
                className="form-control"
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />

              <button
                className="btn btn-primary"
                onClick={addSkill}
              >
                Add
              </button>

              <button
                className="btn btn-success"
                onClick={saveSkills}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Skills"}
              </button>

            </div>
          )}

        </div>
      </div>

      {/* RESEARCH INTERESTS */}
      <div className="card shadow-sm mb-4">

        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Research Interests</h4>

          {isOwnProfile && (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                setEditingInterests(!editingInterests)
              }
            >
              <i className="bi bi-pencil me-1"></i>
              {editingInterests ? "Cancel" : "Edit Interests"}
            </button>
          )}
        </div>

        <div className="card-body">

          {interests.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">

              {interests.map((interest) => (
                <span
                  key={interest}
                  className="badge bg-secondary fs-6 p-2"
                >
                  {interest}

                  {editingInterests && (
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "8px" }}
                      onClick={() =>
                        removeInterest(interest)
                      }
                    ></button>
                  )}
                </span>
              ))}

            </div>
          ) : (
            <p className="text-muted mb-0">
              No research interests added yet.
            </p>
          )}

          {editingInterests && (
            <div className="input-group mt-4">

              <input
                type="text"
                className="form-control"
                placeholder="Add research interest"
                value={newInterest}
                onChange={(e) =>
                  setNewInterest(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
              />

              <button
                className="btn btn-primary"
                onClick={addInterest}
              >
                Add
              </button>

              <button
                className="btn btn-success"
                onClick={saveInterests}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Interests"}
              </button>

            </div>
          )}

        </div>
      </div>

      {/* PUBLICATIONS */}
      <div className="card shadow-sm mb-4">

        <div className="card-header">
          <h4 className="mb-0">Publications</h4>
        </div>

        <div className="card-body">

          {researcher.publications &&
          researcher.publications.length > 0 ? (
            <div className="list-group">

              {researcher.publications.map((publication) => (
                <div
                  className="list-group-item"
                  key={publication.id}
                >

                  <h5 className="mb-1">
                    {publication.title}
                  </h5>

                  {publication.abstract && (
                    <p className="mb-1 text-muted">
                      {publication.abstract}
                    </p>
                  )}

                  <small>
                    {publication.journal && (
                      <>
                        <strong>Journal:</strong>{" "}
                        {publication.journal}
                      </>
                    )}

                    {publication.publication_year && (
                      <>
                        {" | "}
                        <strong>Year:</strong>{" "}
                        {publication.publication_year}
                      </>
                    )}
                  </small>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-muted mb-0">
              No publications available.
            </p>
          )}

        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Researcher Profile
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setEditingProfile(false)}
                ></button>
              </div>

              <div className="modal-body">

                <div className="row">

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      First Name
                    </label>

                    <input
                      className="form-control"
                      name="first_name"
                      value={profileForm.first_name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Last Name
                    </label>

                    <input
                      className="form-control"
                      name="last_name"
                      value={profileForm.last_name}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Phone
                    </label>

                    <input
                      className="form-control"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Experience
                    </label>

                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      name="experience"
                      value={profileForm.experience}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Bio
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                    ></textarea>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      ORCID
                    </label>

                    <input
                      className="form-control"
                      name="orcid"
                      value={profileForm.orcid}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Google Scholar
                    </label>

                    <input
                      className="form-control"
                      name="google_scholar"
                      value={profileForm.google_scholar}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      ResearchGate
                    </label>

                    <input
                      className="form-control"
                      name="research_gate"
                      value={profileForm.research_gate}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      LinkedIn
                    </label>

                    <input
                      className="form-control"
                      name="linkedin"
                      value={profileForm.linkedin}
                      onChange={handleProfileChange}
                    />
                  </div>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ResearcherProfile;