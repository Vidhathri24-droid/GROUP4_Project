import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ResearcherForm from "../../components/researchers/ResearcherForm";

import {
    createResearcher,
    getResearchers,
} from "../../services/researcherService";

import { getUsers } from "../../services/userService";

export default function CreateResearcher() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");

    // Load existing users
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const usersData = await getUsers();
                const researchersData = await getResearchers();

                const existingUserIds = new Set(
                    researchersData.map((researcher) =>
                        String(researcher.user_id)
                    )
                );

                const availableUsers = usersData.filter(
                    (user) => !existingUserIds.has(String(user.id))
                );

                console.log("ALL USERS:", usersData);
                console.log("EXISTING RESEARCHER USER IDS:", existingUserIds);
                console.log("AVAILABLE USERS:", availableUsers);

                // ADD THIS HERE
                console.log(
                    "AVAILABLE USER DETAILS:",
                    availableUsers.map((user) => ({
                        id: user.id,
                        email: user.email,
                        username: user.username,
                    }))
                );

                setUsers(availableUsers);
            } catch (error) {
                console.error("FAILED TO LOAD USERS:", error);
                console.error("ERROR RESPONSE:", error?.response?.data);

                alert(
                    error?.response?.data?.detail ||
                    error?.message ||
                    "Unable to load users."
                );
            }
        };

        loadUsers();
    }, []);

    const submit = async (form) => {
        if (!selectedUserId) {
            alert("Please select a user account.");
            return;
        }

        try {
            setLoading(true);

            console.log("SELECTED USER ID:", selectedUserId);
            console.log("FORM DATA:", form);

            const payload = {
                ...form,
                user_id: selectedUserId,
            };

            console.log("FINAL RESEARCHER PAYLOAD:", payload);

            await createResearcher(payload);

            navigate("/researchers");

        } catch (error) {
            console.error("CREATE RESEARCHER ERROR:", error);

            alert(
                error?.response?.data?.detail ||
                "Unable to create researcher."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <Link
                        to="/researchers"
                        className="btn btn-outline-secondary mb-3"
                    >
                        <i className="bi bi-arrow-left"></i>{" "}
                        Back to Researchers
                    </Link>

                    <h2>Create Researcher</h2>

                </div>

            </div>

            {/* Select Existing User */}
            <div className="card mb-4">
                <div className="card-body">

                    <label className="form-label fw-bold">
                        User Account{" "}
                        <span className="text-danger">*</span>
                    </label>

                    <select
                        className="form-select"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                    >
                        <option value="">Select existing user</option>

                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.email || user.username || `User ${user.id}`}
                            </option>
                        ))}
                    </select>

                    <small className="text-muted">
                        Select the existing user account for this researcher.
                    </small>

                </div>
            </div>

            {/* Researcher Details */}
            <ResearcherForm
                loading={loading}
                onSubmit={submit}
            />

        </div>
    );
}