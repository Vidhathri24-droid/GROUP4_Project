import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ResearcherForm from "../../components/researchers/ResearcherForm";

import { createResearcher } from "../../services/researcherService";
import { getCurrentUser } from "../../services/authService";

export default function CreateResearcher() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const submit = async (form) => {

        try {

            setLoading(true);

            const user = await getCurrentUser();

            await createResearcher({
                user_id: user.id,
                ...form,
            });

            navigate("/researchers");

        } catch (error) {

            console.error(error);

            alert("Unable to create researcher.");

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
					<i className="bi bi-arrow-left"></i> Back to Researchers
				</Link>

				<h2>Create Researcher</h2>

			</div>

		</div>

		<ResearcherForm
			loading={loading}
			onSubmit={submit}
		/>

	</div>
    );
}
