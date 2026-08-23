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
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [departmentError, setDepartmentError] = useState("");

    // ---------------------------------------------------------
    // Load institutions and departments
    // ---------------------------------------------------------

    useEffect(() => {
        loadInstitutionData();
    }, []);

    // Keep form synchronized when editing an existing researcher
    useEffect(() => {
        if (initialValues) {
            setForm((previous) => ({
                ...previous,
                ...initialValues,
                department_ids:
                    initialValues.department_ids ||
                    initialValues.departments?.map(
                        (department) => String(department.id)
                    ) ||
                    [],
            }));
        }
    }, [initialValues]);

    const normalizeDepartment = (
        department,
        institutionName = ""
    ) => {
        if (!department) return null;

        return {
            ...department,
            id: String(department.id),

            name:
                department.name ||
                department.department_name ||
                department.title ||
                "Unnamed Department",

            institution_name:
                department.institution_name ||
                institutionName ||
                department.institution?.name ||
                "",
        };
    };

    const loadInstitutionData = async () => {
        try {
            setLoadingOptions(true);
            setDepartmentError("");

            // -------------------------------------------------
            // 1. Load institutions
            // -------------------------------------------------

            let institutionData = [];

            try {
                const response = await api.get(
                    "/institutions/"
                );

                const data = response.data;

                if (Array.isArray(data)) {
                    institutionData = data;
                } else if (Array.isArray(data?.items)) {
                    institutionData = data.items;
                } else if (
                    Array.isArray(data?.institutions)
                ) {
                    institutionData = data.institutions;
                }
            } catch (error) {
                console.error(
                    "Failed to load institutions:",
                    error
                );
            }

            setInstitutions(institutionData);

            // -------------------------------------------------
            // 2. Extract departments from institutions
            // -------------------------------------------------

            let allDepartments = institutionData.flatMap(
                (institution) => {
                    const nestedDepartments =
                        institution.departments ||
                        institution.department_list ||
                        [];

                    if (!Array.isArray(nestedDepartments)) {
                        return [];
                    }

                    return nestedDepartments
                        .map((department) =>
                            normalizeDepartment(
                                department,
                                institution.name
                            )
                        )
                        .filter(Boolean);
                }
            );

            // Remove duplicate departments
            allDepartments = Array.from(
                new Map(
                    allDepartments.map((department) => [
                        String(department.id),
                        department,
                    ])
                ).values()
            );

            // -------------------------------------------------
            // 3. If institutions don't contain departments,
            //    load departments directly
            // -------------------------------------------------

            if (allDepartments.length === 0) {
                try {
                    const departmentResponse =
                        await api.get("/departments/");

                    const departmentData =
                        departmentResponse.data;

                    let rawDepartments = [];

                    if (Array.isArray(departmentData)) {
                        rawDepartments = departmentData;
                    } else if (
                        Array.isArray(departmentData?.items)
                    ) {
                        rawDepartments =
                            departmentData.items;
                    } else if (
                        Array.isArray(
                            departmentData?.departments
                        )
                    ) {
                        rawDepartments =
                            departmentData.departments;
                    }

                    allDepartments = rawDepartments
                        .map((department) =>
                            normalizeDepartment(
                                department,
                                department.institution?.name
                            )
                        )
                        .filter(Boolean);
                } catch (error) {
                    console.error(
                        "Failed to load departments:",
                        error
                    );

                    setDepartmentError(
                        "Unable to load departments. Please make sure departments are available."
                    );
                }
            }

            // -------------------------------------------------
            // 4. Save departments
            // -------------------------------------------------

            setDepartments(allDepartments);

            console.log(
                "Loaded institutions:",
                institutionData
            );

            console.log(
                "Loaded departments:",
                allDepartments
            );
        } catch (error) {
            console.error(
                "Failed to load institution data:",
                error
            );

            setDepartmentError(
                "Unable to load institutional information."
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
        const selectedDepartmentId = e.target.value;

        setForm((previous) => ({
            ...previous,

            // Keep the backend format as an array.
            // Only one department is selected from the dropdown.
            department_ids: selectedDepartmentId
                ? [String(selectedDepartmentId)]
                : [],
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

            department_ids: (
                form.department_ids || []
            ).map((id) => String(id)),
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
            {/* INSTITUTIONAL AFFILIATION */}
            {/* ================================================= */}

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <h5 className="mb-2">
                        Institutional Affiliation
                    </h5>

                    <p className="text-muted mb-4">
                        Select the department where this
                        researcher is affiliated. The institution
                        is determined automatically from the
                        selected department.
                    </p>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Department
                        </label>

                        {loadingOptions ? (
                            <div className="border rounded p-4 text-center bg-light">
                                <div
                                    className="spinner-border spinner-border-sm text-primary me-2"
                                    role="status"
                                />

                                <span>
                                    Loading departments...
                                </span>
                            </div>
                        ) : departments.length > 0 ? (
                            <>
                                <select
                                    className="form-select"
                                    value={
                                        form.department_ids?.[0] ||
                                        ""
                                    }
                                    onChange={
                                        handleDepartmentChange
                                    }
                                >
                                    <option value="">
                                        Select a department
                                    </option>

                                    {departments.map(
                                        (department) => (
                                            <option
                                                key={
                                                    department.id
                                                }
                                                value={
                                                    department.id
                                                }
                                            >
                                                {department.institution_name
                                                    ? `${department.institution_name} — `
                                                    : ""}
                                                {department.name}
                                            </option>
                                        )
                                    )}
                                </select>

                                <div className="form-text mt-2">
                                    Select the department where
                                    this researcher is affiliated.
                                </div>

                                {form.department_ids?.length >
                                    0 && (
                                    <div className="mt-3">
                                        <span className="badge bg-primary-subtle text-primary">
                                            Department selected
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="border rounded p-4 bg-light">
                                <div className="d-flex align-items-start gap-3">
                                    <div
                                        className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: "42px",
                                            height: "42px",
                                        }}
                                    >
                                        🏢
                                    </div>

                                    <div>
                                        <h6 className="mb-1">
                                            No departments available
                                        </h6>

                                        <p className="text-muted mb-0">
                                            {departmentError ||
                                                "No departments are currently available. Please create a department under an institution first."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                            placeholder="https://orcid.org/..."
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
            {/* ACADEMIC PROFILES */}
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

            <div className="d-flex justify-content-end mb-5">
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