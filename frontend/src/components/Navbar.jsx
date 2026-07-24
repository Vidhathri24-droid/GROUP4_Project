import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">

        <Link className="navbar-brand fw-bold fs-3" to="/">
          SCNA
        </Link>

        <div className="ms-auto d-flex gap-3">

          <Link className="nav-link text-white" to="/">
            Home
          </Link>

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

          <Link className="btn btn-light btn-sm px-3" to="/login">
            Login
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;