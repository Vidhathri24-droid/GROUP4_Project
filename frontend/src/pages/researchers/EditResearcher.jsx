import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ResearcherForm from "../../components/researchers/ResearcherForm";

import {
  getResearcher,
  updateResearcher,
} from "../../services/researcherService";

export default function EditResearcher() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [researcher, setResearcher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResearcher();
  }, [id]);

  const fetchResearcher = async () => {
    try {
      setLoading(true);

      const data = await getResearcher(id);

      setResearcher(data);
    } catch (error) {
      console.error("Error loading researcher:", error);

      alert("Unable to load researcher.");

      navigate("/researchers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (form) => {
    try {
      setSaving(true);

      await updateResearcher(id, form);

      alert("Researcher updated successfully.");

      navigate(`/researchers/${id}`);
    } catch (error) {
      console.error("Error updating researcher:", error);

      alert(
        error?.response?.data?.detail ||
          "Unable to update researcher."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!researcher) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          Researcher not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        Edit Researcher
      </h2>

      <ResearcherForm
        initialValues={{
          first_name: researcher.first_name || "",
          last_name: researcher.last_name || "",
          bio: researcher.bio || "",
          phone: researcher.phone || "",
          experience: researcher.experience || 0,
          orcid: researcher.orcid || "",
          google_scholar:
            researcher.google_scholar || "",
          research_gate:
            researcher.research_gate || "",
          linkedin: researcher.linkedin || "",
        }}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}