import { useState } from "react";

export default function ResearcherForm({
  initialValues,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(
    initialValues || {
      first_name: "",
      last_name: "",
      bio: "",
      phone: "",
      experience: 0,
      orcid: "",
      google_scholar: "",
      research_gate: "",
      linkedin: "",
    }
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit}>
      {/* First Name and Last Name */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Bio */}
      <div className="mb-3">
        <label className="form-label">Bio</label>
        <textarea
          className="form-control"
          rows="4"
          name="bio"
          value={form.bio}
          onChange={handleChange}
        />
      </div>

      {/* Phone and Experience */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Experience</label>
          <input
            type="number"
            className="form-control"
            name="experience"
            value={form.experience}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      {/* ORCID */}
      <div className="mb-3">
        <label className="form-label">ORCID</label>
        <input
          type="text"
          className="form-control"
          name="orcid"
          value={form.orcid}
          onChange={handleChange}
        />
      </div>

      {/* Google Scholar */}
      <div className="mb-3">
        <label className="form-label">Google Scholar</label>
        <input
          type="text"
          className="form-control"
          name="google_scholar"
          value={form.google_scholar}
          onChange={handleChange}
        />
      </div>

      {/* ResearchGate */}
      <div className="mb-3">
        <label className="form-label">ResearchGate</label>
        <input
          type="text"
          className="form-control"
          name="research_gate"
          value={form.research_gate}
          onChange={handleChange}
        />
      </div>

      {/* LinkedIn */}
      <div className="mb-4">
        <label className="form-label">LinkedIn</label>
        <input
          type="text"
          className="form-control"
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Researcher"}
      </button>
    </form>
  );
}