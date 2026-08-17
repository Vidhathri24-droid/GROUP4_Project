import { useEffect, useState } from "react";
import api from "../../api/api";

export default function ResearcherForm({
    initialValues,
    onSubmit,
    loading,
}) {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        bio: "",
        phone: "",
        experience: 0,
        orcid: "",
        google_scholar: "",
        research_gate: "",
        linkedin: "",
        skills: "",
        interests: "",
        department_ids: [],
        ...(initialValues || {}),
    });

    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loadingOptions, setLoadingOptions] =
        useState(true);

    // ---------------------------------------------------------
    // Load institutions and departments
    // ---------------------------------------------------------

    useEffect(() => {
        loadInstitutionData();
    }, []);

    const loadInstitutionData = async () => {
        try {
            setLoadingOptions(true);

            const response = await api.get(
                "/institutions/"
            );

            const data = response.data || [];

            setInstitutions(data);

            const allDepartments = data.flatMap(
                (institution) =>
                    (institution.departments || []).map(
                        (department) => ({
                            ...department,
                            institution_name:
                                institution.name,
                        })
                    )
            );

            setDepartments(allDepartments);
        } catch (error) {
            console.error(
                "Failed to load institution data:",
                error
            );
        } finally {
            setLoadingOptions(false);
        }
    };

    // ---------------------------------------------------------
    // Normal form fields
    // ---------------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ---------------------------------------------------------
    // Department selection
    // ---------------------------------------------------------

    const handleDepartmentChange = (e) => {
        const selected = Array.from(
            e.target.selectedOptions
        ).map((option) => option.value);

        setForm((previous) => ({
            ...previous,
            department_ids: selected,
        }));
    };

    // ---------------------------------------------------------
    // Submit
    // ---------------------------------------------------------

    const submit = (e) => {
        e.preventDefault();

        onSubmit({
            ...form,
            experience: Number(form.experience || 0),
            department_ids: form.department_ids || [],
        });
    };

    return (
        <form onSubmit={submit}>

            {/* ================================================= */}
            {/* BASIC INFORMATION */}
            {/* ================================================= */}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <h5 className="mb-4">
                        Personal Information
                    </h5>

                    <div className="row">

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                First Name
                            </label>

                            <input
                                className="form-control"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Last Name
                            </label>

                            <input
                                className="form-control"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Bio
                        </label>

                        <textarea
                            className="form-control"
                            rows="4"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="row">

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Phone
                            </label>

                            <input
                                className="form-control"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
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
                                value={form.experience}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                </div>
            </div>

            {/* ================================================= */}
            {/* INSTITUTION */}
            {/* ================================================= */}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <h5 className="mb-2">
                        Institutional Affiliation
                    </h5>

                    <p className="text-muted mb-4">
                        Select the department where this
                        researcher is affiliated. The
                        institution is determined automatically
                        from the department.
                    </p>

                    <div className="mb-3">

                        <label className="form-label">
                            Departments
                        </label>

                        <select
                            className="form-select"
                            multiple
                            value={
                                form.department_ids || []
                            }
                            onChange={
                                handleDepartmentChange
                            }
                            disabled={loadingOptions}
                            size="6"
                        >

                            {loadingOptions ? (
                                <option>
                                    Loading departments...
                                </option>
                            ) : departments.length === 0 ? (
                                <option>
                                    No departments found
                                </option>
                            ) : (
                                departments.map(
                                    (department) => (
                                        <option
                                            key={
                                                department.id
                                            }
                                            value={
                                                department.id
                                            }
                                        >
                                            {
                                                department.institution_name
                                            }
                                            {" — "}
                                            {
                                                department.name
                                            }
                                        </option>
                                    )
                                )
                            )}

                        </select>

                        <div className="form-text">
                            Hold Ctrl/Cmd to select multiple
                            departments.
                        </div>

                    </div>

                </div>
            </div>

            {/* ================================================= */}
            {/* ACADEMIC INFORMATION */}
            {/* ================================================= */}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <h5 className="mb-4">
                        Academic Information
                    </h5>

                    <div className="mb-3">

                        <label className="form-label">
                            ORCID
                        </label>

                        <input
                            className="form-control"
                            name="orcid"
                            value={form.orcid}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Skills
                        </label>

                        <input
                            className="form-control"
                            name="skills"
                            value={form.skills}
                            onChange={handleChange}
                            placeholder="Machine Learning, NLP, Computer Vision"
                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label">
                            Research Interests
                        </label>

                        <input
                            className="form-control"
                            name="interests"
                            value={form.interests}
                            onChange={handleChange}
                            placeholder="AI, Healthcare, Deep Learning"
                        />

                    </div>

                </div>
            </div>

            {/* ================================================= */}
            {/* LINKS */}
            {/* ================================================= */}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <h5 className="mb-4">
                        Academic Profiles
                    </h5>

                    <input
                        className="form-control mb-3"
                        name="google_scholar"
                        value={form.google_scholar}
                        onChange={handleChange}
                        placeholder="Google Scholar URL"
                    />

                    <input
                        className="form-control mb-3"
                        name="research_gate"
                        value={form.research_gate}
                        onChange={handleChange}
                        placeholder="ResearchGate URL"
                    />

                    <input
                        className="form-control"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="LinkedIn URL"
                    />

                </div>
            </div>

            {/* ================================================= */}
            {/* SUBMIT */}
            {/* ================================================= */}

            <div className="d-flex justify-content-end">

                <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={
                        loading ||
                        loadingOptions
                    }
                >
                    {loading
                        ? "Saving..."
                        : "Save Researcher"}
                </button>

            </div>

        </form>
    );
}