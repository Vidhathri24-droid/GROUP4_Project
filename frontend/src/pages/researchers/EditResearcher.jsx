import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getResearcher,
    updateResearcher,
} from "../../services/researcherService";

import ResearcherForm from "../../components/researchers/ResearcherForm";

function EditResearcher() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [researcher, setResearcher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadResearcher();
    }, [id]);

    const loadResearcher = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getResearcher(id);

            setResearcher(data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load researcher."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            setSaving(true);
            setError("");

            await updateResearcher(id, formData);

            alert("Researcher updated successfully.");

            navigate(`/researchers/${id}`);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to update researcher."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="mt-3">
                    Loading researcher...
                </p>
            </div>
        );
    }

    if (!researcher) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    {error || "Researcher not found."}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>Edit Researcher</h2>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card shadow-sm p-4">

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
                        linkedin:
                            researcher.linkedin || "",
                        skills:
                            researcher.skills || "",
                        interests:
                            researcher.interests || "",

                        department_ids:
                            researcher.departments?.map(
                                (department) =>
                                    department.id
                            ) || [],
                    }}
                    onSubmit={handleSubmit}
                    loading={saving}
                />

            </div>

        </div>
    );
}

export default EditResearcher;