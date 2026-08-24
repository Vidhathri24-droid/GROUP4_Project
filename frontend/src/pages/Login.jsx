import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  login,
  getCurrentUser,
} from "../services/authService";

/* ============================================================
   CAPTCHA GENERATOR
   ============================================================ */

function generateCaptcha() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let captcha = "";

  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return captcha;
}

/* ============================================================
   LOGIN COMPONENT
   ============================================================ */

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================================
     INITIALIZE
     ========================================================== */

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem("remembered_email");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    setCaptcha(generateCaptcha());
  }, []);

  /* ==========================================================
     REFRESH CAPTCHA
     ========================================================== */

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  /* ==========================================================
     NORMAL LOGIN (FIXED)
     ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /* --------------------------------------------------------
       CAPTCHA VALIDATION
       -------------------------------------------------------- */

    if (
      captchaInput.trim().toLowerCase() !==
      captcha.trim().toLowerCase()
    ) {
      setError("Incorrect CAPTCHA. Please try again.");
      refreshCaptcha();
      return;
    }

    setLoading(true);

    try {
      /* 1. LOGIN CALL */
      const response = await login(email, password);

      // SAFE TOKEN EXTRACTION (Key name fallback)
      const token =
        response &&
        (response.access_token || response.token || response.accessToken);

      if (token) {
        /* 2. SAVE TOKEN IN BOTH STORAGE LOCATIONS FOR SAFETY */
        localStorage.setItem("access_token", token);
        sessionStorage.setItem("access_token", token);

        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        /* 3. FETCH CURRENT USER WITH FALLBACK */
        try {
          const user = await getCurrentUser();
          const userStr = JSON.stringify(user);
          localStorage.setItem("user", userStr);
          sessionStorage.setItem("user", userStr);
        } catch (userErr) {
          console.warn("getCurrentUser failed, saving fallback details:", userErr);
          const fallbackUser = { email: email, name: email.split("@")[0] };
          const fallbackStr = JSON.stringify(fallbackUser);
          localStorage.setItem("user", fallbackStr);
          sessionStorage.setItem("user", fallbackStr);
        }

        /* 4. REDIRECT TO DASHBOARD */
        navigate("/dashboard");
      } else {
        setError("Invalid response from server (No access token found).");
        refreshCaptcha();
      }
    } catch (err) {
      console.error("Login Submission Error:", err);

      if (err.response?.status === 403) {
        setError("Please verify your email before logging in.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Check server/network connection.");
      }

      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
        padding: "30px 15px",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "420px",
          maxWidth: "100%",
          borderRadius: "18px",
          border: "none",
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-4">
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 12px",
              borderRadius: "14px",
              background:
                "linear-gradient(135deg, #0d6efd, #0062cc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h2
            className="mb-1"
            style={{
              color: "#0d6efd",
              fontWeight: 700,
            }}
          >
            Login to SCNA
          </h2>

          <p
            className="text-muted mb-0"
            style={{
              fontSize: "14px",
            }}
          >
            Access your research collaboration workspace
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            className="alert alert-danger"
            style={{
              borderRadius: "10px",
              fontSize: "14px",
            }}
          >
            <div>{error}</div>

            {error.toLowerCase().includes("verify") && (
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

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={{
                height: "46px",
                borderRadius: "9px",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="password">
              Password
            </label>

            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{
                  height: "46px",
                  borderRadius: "9px",
                  paddingRight: "48px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#6c757d",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* CAPTCHA */}
          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="captcha">
              Security Check
            </label>

            <div className="d-flex gap-2 align-items-center mb-2">
              <div
                style={{
                  flex: 1,
                  height: "48px",
                  borderRadius: "9px",
                  border: "1px solid #dee2e6",
                  background:
                    "linear-gradient(135deg, #f1f6ff, #e8f0ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  userSelect: "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "1px",
                    background: "#9bbcff",
                    transform: "rotate(-7deg)",
                    opacity: 0.7,
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "1px",
                    background: "#75a8ff",
                    transform: "rotate(8deg)",
                    opacity: 0.6,
                  }}
                />

                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "6px",
                    fontStyle: "italic",
                    color: "#1557a6",
                    transform: "rotate(-2deg)",
                    textShadow: "1px 1px 0 #ffffff",
                  }}
                >
                  {captcha}
                </span>
              </div>

              <button
                type="button"
                onClick={refreshCaptcha}
                title="Refresh CAPTCHA"
                aria-label="Refresh CAPTCHA"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "9px",
                  border: "1px solid #dee2e6",
                  background: "#ffffff",
                  color: "#0d6efd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={19} />
              </button>
            </div>

            <input
              id="captcha"
              type="text"
              className="form-control"
              placeholder="Enter the characters shown above"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              autoComplete="off"
              required
              style={{
                height: "46px",
                borderRadius: "9px",
              }}
            />

            <small
              className="text-muted"
              style={{
                fontSize: "12px",
              }}
            >
              Enter the 6 characters shown above.
            </small>
          </div>

          {/* REMEMBER ME + FORGOT PASSWORD */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <label className="form-check-label" htmlFor="remember">
                Remember Me
              </label>
            </div>

            <Link to="/forgot-password" className="text-decoration-none">
              Forgot Password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{
              height: "46px",
              borderRadius: "9px",
              fontWeight: 600,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* REGISTER LINK */}
          <p className="text-center mt-3 mb-0">
            Don't have an account?{" "}
            <Link to="/register" className="text-decoration-none fw-bold">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;