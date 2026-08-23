import { useNavigate } from "react-router-dom";

export default function QuickActions({
  permissions,
  userRole,
}) {
  const navigate = useNavigate();

  /*
   * Add Researcher
   *
   * Allowed:
   * SYSTEM_ADMIN
   * INSTITUTION_ADMIN
   */
  const handleAddResearcher = () => {
    if (
      userRole !== "SYSTEM_ADMIN" &&
      userRole !== "INSTITUTION_ADMIN"
    ) {
      alert(
        "Not allowed: Only System Admin and Institution Admin are allowed to add researchers."
      );
      return;
    }

    navigate("/researchers/create");
  };

  /*
   * Add Publication
   *
   * Allowed:
   * SYSTEM_ADMIN
   * RESEARCHER
   */
  const handleAddPublication = () => {
    if (
      userRole !== "SYSTEM_ADMIN" &&
      userRole !== "RESEARCHER"
    ) {
      alert(
        "Not allowed: Only System Admin and Researcher are allowed to add publications."
      );
      return;
    }

    navigate("/publications/create");
  };

  /*
   * Add Institution
   *
   * Allowed:
   * SYSTEM_ADMIN only
   */
  const handleAddInstitution = () => {
    if (userRole !== "SYSTEM_ADMIN") {
      alert(
        "Not allowed: Only System Admin is allowed to add institutions."
      );
      return;
    }

    navigate("/institutions/create");
  };

  /*
   * Add Conference
   *
   * Allowed:
   * SYSTEM_ADMIN only
   */
  const handleAddConference = () => {
    if (userRole !== "SYSTEM_ADMIN") {
      alert(
        "Not allowed: Only System Admin is allowed to add conferences."
      );
      return;
    }

    navigate("/conferences/create");
  };

  return (
    <div className="card shadow border-0 mb-5">

      <div className="card-body">

        <h4 className="mb-4">
          🚀 Quick Actions
        </h4>

        <div className="row g-3">

          {/* Add Researcher */}
          <div className="col-lg-3 col-md-6">
            <button
              type="button"
              onClick={handleAddResearcher}
              className="btn btn-primary w-100 py-3"
            >
              Add Researcher
            </button>
          </div>

          {/* Add Publication */}
          <div className="col-lg-3 col-md-6">
            <button
              type="button"
              onClick={handleAddPublication}
              className="btn btn-success w-100 py-3"
            >
              Add Publication
            </button>
          </div>

          {/* Add Institution */}
          <div className="col-lg-3 col-md-6">
            <button
              type="button"
              onClick={handleAddInstitution}
              className="btn btn-warning w-100 py-3"
            >
              Add Institution
            </button>
          </div>

          {/* Add Conference */}
          <div className="col-lg-3 col-md-6">
            <button
              type="button"
              onClick={handleAddConference}
              className="btn btn-info w-100 py-3"
            >
              Add Conference
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}