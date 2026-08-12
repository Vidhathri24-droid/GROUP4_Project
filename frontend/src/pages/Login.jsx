import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
  login,
  getCurrentUser,
} from "../services/authService";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // Remembered email
  // ---------------------------------------------------------

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem("remembered_email");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // ---------------------------------------------------------
  // Normal Email / Password Login
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await login(email, password);

      // Save JWT
      if (response.access_token) {
        if (rememberMe) {
          localStorage.setItem(
            "access_token",
            response.access_token
          );
        } else {
          sessionStorage.setItem(
            "access_token",
            response.access_token
          );
        }
      }

      // Fetch logged-in user
      const user = await getCurrentUser();

      // Save user information
      if (rememberMe) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        localStorage.setItem(
          "remembered_email",
          email
        );
      } else {
        sessionStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        localStorage.removeItem(
          "remembered_email"
        );
      }

      navigate("/dashboard");

    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        setError(
          "Please verify your email before logging in."
        );
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Login failed.");
      }

    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Google Login
  // ---------------------------------------------------------

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");

    try {
      if (!credentialResponse?.credential) {
        throw new Error(
          "Google did not return an authentication credential."
        );
      }

      // Send Google's ID token to FastAPI
      const response = await api.post(
        "/auth/google",
        {
          credential: credentialResponse.credential,
        }
      );

      // Save SCNA JWT
      if (response.data?.access_token) {
        if (rememberMe) {
          localStorage.setItem(
            "access_token",
            response.data.access_token
          );
        } else {
          sessionStorage.setItem(
            "access_token",
            response.data.access_token
          );
        }
      }

      // Fetch logged-in SCNA user
      const user = await getCurrentUser();

      // Save user
      if (rememberMe) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      } else {
        sessionStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      navigate("/dashboard");

    } catch (err) {
      console.error("Google login error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Google login failed. Please try again."
        );
      }

    } finally {
      setGoogleLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Google Login Error
  // ---------------------------------------------------------

  const handleGoogleError = () => {
    console.error("Google Login Failed");

    setError(
      "Google login was cancelled or failed. Please try again."
    );
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#e3f2fd,#ffffff)",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "420px",
          borderRadius: "15px",
        }}
      >
        <h2 className="text-center text-primary mb-4">
          Login to SCNA
        </h2>

        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <div>{error}</div>

            {error
              .toLowerCase()
              .includes("verify") && (
              <div className="mt-2">
                <Link
                  to="/resend-verification"
                  className="btn btn-warning btn-sm"
                >
                  Resend Verification Email
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Email / Password Login */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {/* Remember Me / Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-3">

            <div className="form-check">

              <input
                className="form-check-input"
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />

              <label
                className="form-check-label"
                htmlFor="remember"
              >
                Remember Me
              </label>

            </div>

            <Link
              to="/forgot-password"
              className="text-decoration-none"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Normal Login */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || googleLoading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Divider */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />

          <span className="mx-3 text-muted">
            OR
          </span>

          <hr className="flex-grow-1" />
        </div>

        {/* Google Login */}
        <div className="d-flex justify-content-center">
          {googleLoading ? (
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              disabled
            >
              Signing in with Google...
            </button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
            />
          )}
        </div>

        {/* Register */}
        <p className="text-center mt-3 mb-0">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-decoration-none fw-bold"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;