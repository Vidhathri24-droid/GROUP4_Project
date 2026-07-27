import { useState, useEffect } from "react";

function ConferenceForm({
  initialData = null,
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    conference_date: "",
    description: "",
  });

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      title: initialData.title || "",
      location: initialData.location || "",
      conference_date: initialData.conference_date
        ? initialData.conference_date.slice(0, 10)
        : "",
      description: initialData.description || "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">Conference Information</h4>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Conference Title
            </label>

            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter conference title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Location
            </label>

            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter conference location"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Conference Date
            </label>

            <input
              type="date"
              name="conference_date"
              className="form-control"
              value={formData.conference_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Description
            </label>

            <textarea
              rows="5"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter conference description"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Conference"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConferenceForm;
