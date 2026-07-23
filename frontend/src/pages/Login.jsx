import React from "react";

function Login() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#e3f2fd,#ffffff)",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "420px", borderRadius: "15px" }}
      >
        <h2 className="text-center text-primary mb-4">
          Login to SCNA
        </h2>

        <form>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
            />
          </div>

          {/* Remember Me */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember Me
              </label>
            </div>

            <a href="#" className="text-decoration-none">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
          >
            Login
          </button>

          {/* Register */}
          <p className="text-center mt-3">
            Don't have an account?{" "}
            <a href="/register" className="text-decoration-none fw-bold">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;