import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">

        <Link className="navbar-brand fw-bold fs-3" to="/">
          SCNA
        </Link>

        <div className="ms-auto d-flex gap-3 align-items-center">

          <Link className="nav-link text-white" to="/">
            Home
          </Link>

          {isLoggedIn && (
            <>
              <Link className="nav-link text-white" to="/researchers">
                Researchers
              </Link>

              <Link className="nav-link text-white" to="/institutions">
                Institutions
              </Link>

              <Link className="nav-link text-white" to="/publications">
                Publications
              </Link>

              <Link className="nav-link text-white" to="/dashboard">
                Dashboard
              </Link>

              <button
                className="btn btn-light btn-sm px-3"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

          {!isLoggedIn && (
            <Link
              className="btn btn-light btn-sm px-3"
              to="/login"
            >
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
