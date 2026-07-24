import { useState, useEffect } from "react";

function ConferenceForm({
    initialData = {},
    onSubmit,
    loading = false
}) {

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        conference_date: "",
        description: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                location: initialData.location || "",
                conference_date: initialData.conference_date || "",
                description: initialData.description || ""
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                            required
                        />
                    </div>

                    <button
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
