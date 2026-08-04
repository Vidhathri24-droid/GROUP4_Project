import { Link, useNavigate } from "react-router-dom";

export default function ResearcherTable({ researchers }) {
    const navigate = useNavigate();

    const currentUser = JSON.parse(
        localStorage.getItem("user")
    );

    const canManage = (researcher) => {
        if (!currentUser) return false;

        if (
            currentUser.role === "SYSTEM_ADMIN" ||
            currentUser.role === "INSTITUTION_ADMIN"
        ) {
            return true;
        }

        return currentUser.id === researcher.user_id;
    };

    const handleEdit = (researcher) => {
        if (!canManage(researcher)) {
            alert(
                "You cannot edit another researcher's profile."
            );
            return;
        }

        navigate(`/researchers/edit/${researcher.id}`);
    };

    const handleDelete = (researcher) => {
        if (!canManage(researcher)) {
            alert(
                "You cannot delete another researcher's profile."
            );
            return;
        }

        // Replace this later with your delete API
        alert("Delete functionality will be added.");
    };

    if (!researchers || researchers.length === 0) {
        return (
            <div className="alert alert-info">
                No researchers found.
            </div>
        );
    }

    return (
        <div className="table-responsive">

            <table className="table table-hover align-middle">

                <thead className="table-primary">
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Experience</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {researchers.map((researcher) => (

                        <tr key={researcher.id}>

                            <td>{researcher.first_name}</td>

                            <td>{researcher.last_name}</td>
                            <td>{researcher.first_name} {researcher.last_name}</td>

                            <td>
                                {researcher.experience} Years
                            </td>

                            <td>{researcher.phone}</td>

                            <td>

                                <Link
                                    className="btn btn-sm btn-primary me-2"
                                    to={`/researchers/${researcher.id}`}
                                >
                                    View
                                </Link>

                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() =>
                                        handleEdit(researcher)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() =>
                                        handleDelete(researcher)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}
