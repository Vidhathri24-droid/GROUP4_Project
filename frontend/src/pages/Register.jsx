import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "Researcher",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] =useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register(formData);

      setSuccess(
        "Registration successful! Please verify your email before logging in."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Registration failed.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#edf5ff,#ffffff)",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          width: "520px",
          borderRadius: "18px",
        }}
      >
        <div className="card-body p-5">

          <h2 className="text-center text-primary mb-4">
            Create SCNA Account
          </h2>

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

<<<<<<< HEAD
          <form onSubmit={handleSubmit}>
=======
            <input
              type="text"
              name="first_name"
              className="form-control"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">
              Last Name
            </label>

            <input
              type="text"
              name="last_name"
              className="form-control"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  First Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Last Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">

              <label className="form-label fw-semibold">
                Password
              </label>

              <div className="input-group">

                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Register"}
            </button>

            <div className="text-center mt-4">

              Already have an account?{" "}

              <Link
                to="/login"
                className="fw-bold text-decoration-none"
              >
                Login
              </Link>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default Register;
