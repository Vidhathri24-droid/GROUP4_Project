import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createPublication,
  uploadPublication,
} from "../services/publicationService";

function CreatePublication() {
  const navigate = useNavigate();

  const [pdf, setPdf] = useState(null);

  const [form, setForm] = useState({
    title: "",
    abstract: "",
    doi: "",
    journal: "",
    conference: "",
    publication_year: "",
    publication_type: "",
    status: "",
    url: "",
    citation_count: 0,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "citation_count" ||
        e.target.name === "publication_year"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("CREATE PUBLICATION BUTTON CLICKED");
    console.log("FORM DATA:", form);

    try {
      const data = {
        title: form.title,
        abstract: form.abstract,
        doi: form.doi,
        journal: form.journal,
        conference: form.conference,
        publication_year: Number(form.publication_year),
        publication_type: form.publication_type,
        status: form.status
          ? form.status.charAt(0).toUpperCase() + form.status.slice(1).toLowerCase()
          : "Submitted",
        url: form.url,
        citation_count: Number(form.citation_count || 0),
      };

      console.log("SENDING PUBLICATION:", data);

      // Create publication as JSON
      const createdPublication = await createPublication(data);

      console.log("PUBLICATION CREATED:", createdPublication);

      // Upload PDF separately if selected
      if (pdf && createdPublication?.id) {
        console.log("Uploading PDF...");

        await uploadPublication(
          createdPublication.id,
          pdf
        );

        console.log("PDF UPLOADED SUCCESSFULLY");
      }

      alert("Publication created successfully!");

      navigate("/publications");

    } catch (error) {
      console.error("CREATE PUBLICATION ERROR:", error);
      console.error(
        "BACKEND RESPONSE:",
        error?.response?.data
      );

      alert(
        error?.response?.data?.detail
          ? JSON.stringify(error.response.data.detail)
          : "Failed to create publication."
      );
    }
  };

  return (
    <div className="container mt-4">

      <h2 className="mb-4 text-primary">
        Create Publication
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label>Title</label>

          <input
            className="form-control"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Abstract</label>

          <textarea
            className="form-control"
            rows="4"
            name="abstract"
            value={form.abstract}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>DOI</label>

          <input
            className="form-control"
            name="doi"
            value={form.doi}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Journal</label>

          <input
            className="form-control"
            name="journal"
            value={form.journal}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Conference</label>

          <input
            className="form-control"
            name="conference"
            value={form.conference}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Publication Year</label>

          <input
            type="number"
            className="form-control"
            name="publication_year"
            value={form.publication_year}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Publication Type</label>

          <input
            className="form-control"
            name="publication_type"
            value={form.publication_type}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Status</label>

          <input
            className="form-control"
            name="status"
            value={form.status}
            onChange={handleChange}
            placeholder="SUBMITTED"
          />
        </div>

        <div className="mb-3">
          <label>URL</label>

          <input
            className="form-control"
            name="url"
            value={form.url}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Citation Count</label>

          <input
            type="number"
            className="form-control"
            name="citation_count"
            value={form.citation_count}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label>Upload PDF</label>

          <input
            type="file"
            accept=".pdf"
            className="form-control"
            onChange={(e) =>
              setPdf(e.target.files[0])
            }
          />
        </div>

        <button
          className="btn btn-success"
          type="submit"
        >
          Create Publication
        </button>

      </form>
    </div>
  );
}

export default CreatePublication;