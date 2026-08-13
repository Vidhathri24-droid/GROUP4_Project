import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  checkUsername,
  startRegistration,
  verifyRegistrationEmail,
  setRegistrationPassword,
  sendRegistrationPhoneOTP,
  verifyRegistrationPhoneOTP,
  skipRegistrationPhone,
  completeRegistration,
} from "../services/authService";


function Register() {

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Current Step
  |--------------------------------------------------------------------------
  */

  const [step, setStep] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | Form Data
  |--------------------------------------------------------------------------
  */

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    email_otp: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    phone_otp: "",
  });

  /*
  |--------------------------------------------------------------------------
  | UI State
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [usernameAvailable, setUsernameAvailable] =
    useState(null);

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [passwordVisible, setPasswordVisible] =
    useState(false);

  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState(false);

  const [phoneOtpSent, setPhoneOtpSent] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | Handle Input
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      setUsernameAvailable(null);
    }

    setError("");
    setSuccess("");
  };


  /*
  |--------------------------------------------------------------------------
  | Error Helper
  |--------------------------------------------------------------------------
  */

  const getErrorMessage = (err) => {

    if (err?.response?.data?.detail) {

      return err.response.data.detail;

    }

    if (err?.message) {

      return err.message;

    }

    return "Something went wrong. Please try again.";
  };


  /*
  |--------------------------------------------------------------------------
  | Step 1 - Username
  |--------------------------------------------------------------------------
  */

  const handleCheckUsername = async () => {

    const username =
      formData.username.trim();

    if (!username) {

      setError("Please enter a username.");

      return;
    }

    if (username.length < 3) {

      setError(
        "Username must contain at least 3 characters."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      const result =
        await checkUsername(username);

      setUsernameAvailable(
        result.available
      );

      if (result.available) {

        setSuccess(
          result.message ||
          "Username is available."
        );

      } else {

        setError(
          result.message ||
          "This username already exists. Please try another one."
        );
      }

    } catch (err) {

      setUsernameAvailable(false);

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Step 1 -> Step 2
  |--------------------------------------------------------------------------
  */

  const handleUsernameContinue = () => {

    if (usernameAvailable !== true) {

      setError(
        "Please check and choose an available username."
      );

      return;
    }

    setError("");
    setSuccess("");
    setStep(2);
  };


  /*
  |--------------------------------------------------------------------------
  | Step 2 - Start Registration
  |--------------------------------------------------------------------------
  */

  const handleSendEmailOTP = async () => {

    if (!formData.first_name.trim()) {

      setError("Please enter your first name.");

      return;
    }

    if (!formData.last_name.trim()) {

      setError("Please enter your last name.");

      return;
    }

    if (!formData.email.trim()) {

      setError("Please enter your email address.");

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await startRegistration({
        username:
          formData.username.trim(),

        first_name:
          formData.first_name.trim(),

        last_name:
          formData.last_name.trim(),

        email:
          formData.email.trim(),
      });

      setSuccess(
        "A verification OTP has been sent to your email."
      );

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Verify Email OTP
  |--------------------------------------------------------------------------
  */

  const handleVerifyEmail = async () => {

    const otp =
      formData.email_otp.trim();

    if (otp.length !== 6) {

      setError(
        "Please enter the 6-digit email OTP."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await verifyRegistrationEmail(
        formData.email.trim(),
        otp
      );

      setEmailVerified(true);

      setSuccess(
        "Email verified successfully."
      );

      setTimeout(() => {

        setStep(3);

        setSuccess("");

      }, 800);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Password Strength
  |--------------------------------------------------------------------------
  */

  const getPasswordStrength = () => {

    const password =
      formData.password;

    if (!password) {

      return {
        label: "",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score++;
    }

    if (/[a-z]/.test(password)) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score <= 2) {

      return {
        label: "Weak",
        width: "33%",
      };
    }

    if (score <= 4) {

      return {
        label: "Medium",
        width: "66%",
      };
    }

    return {
      label: "Strong",
      width: "100%",
    };
  };


  const passwordStrength =
    getPasswordStrength();


  /*
  |--------------------------------------------------------------------------
  | Step 3 - Set Password
  |--------------------------------------------------------------------------
  */

  const handleSetPassword = async () => {

    const password =
      formData.password;

    const confirmPassword =
      formData.confirm_password;

    if (password.length < 8) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {

      setError(
        "Password must contain uppercase, lowercase and a number."
      );

      return;
    }

    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await setRegistrationPassword(
        formData.email.trim(),
        password,
        confirmPassword
      );

      setSuccess(
        "Password created successfully."
      );

      setTimeout(() => {

        setStep(4);

        setSuccess("");

      }, 800);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Step 4 - Send Phone OTP
  |--------------------------------------------------------------------------
  */

  const handleSendPhoneOTP = async () => {

    if (!formData.phone_number.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await sendRegistrationPhoneOTP(
        formData.email.trim(),
        formData.phone_number.trim()
      );

      setPhoneOtpSent(true);

      setSuccess(
        "Phone verification OTP sent."
      );

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Verify Phone OTP
  |--------------------------------------------------------------------------
  */

  const handleVerifyPhone = async () => {

    if (!formData.phone_otp.trim()) {

      setError(
        "Please enter the phone OTP."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await verifyRegistrationPhoneOTP(
        formData.email.trim(),
        formData.phone_number.trim(),
        formData.phone_otp.trim()
      );

      /*
       * Phone verified.
       * Now activate the account.
       */

      await completeRegistration(
        formData.email.trim()
      );

      setSuccess(
        "Registration completed successfully!"
      );

      setTimeout(() => {

        navigate("/login");

      }, 1500);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Skip Phone
  |--------------------------------------------------------------------------
  */

  const handleSkipPhone = async () => {

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      await skipRegistrationPhone(
        formData.email.trim()
      );

      setSuccess(
        "Registration completed successfully!"
      );

      setTimeout(() => {

        navigate("/login");

      }, 1500);

    } catch (err) {

      setError(
        getErrorMessage(err)
      );

    } finally {

      setLoading(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Go Back
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {

    setError("");
    setSuccess("");

    if (step > 1) {

      setStep(step - 1);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#edf5ff,#ffffff)",
        padding: "40px 20px",
      }}
    >

      <div
        className="card shadow-lg border-0"
        style={{
          width: "520px",
          maxWidth: "100%",
          borderRadius: "18px",
        }}
      >

        <div className="card-body p-5">

          {/* ---------------------------------------------------- */}
          {/* Header */}
          {/* ---------------------------------------------------- */}

          <h2 className="text-center text-primary mb-2">
            Create SCNA Account
          </h2>

          <p className="text-center text-muted mb-4">
            Step {step} of 4
          </p>


          {/* ---------------------------------------------------- */}
          {/* Progress Bar */}
          {/* ---------------------------------------------------- */}

          <div
            className="progress mb-4"
            style={{
              height: "7px",
              borderRadius: "10px",
            }}
          >

            <div
              className="progress-bar"
              style={{
                width:
                  `${(step / 4) * 100}%`,
              }}
            />

          </div>


          {/* ---------------------------------------------------- */}
          {/* Messages */}
          {/* ---------------------------------------------------- */}

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


          {/* ==================================================== */}
          {/* STEP 1 - USERNAME */}
          {/* ==================================================== */}

          {step === 1 && (

            <div>

              <h4 className="mb-3">
                Choose your username
              </h4>

              <p className="text-muted">
                Your username will be used to identify
                you on the SCNA platform.
              </p>

              <label className="form-label fw-semibold">
                Username
              </label>

              <div className="input-group mb-2">

                <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={50}
                />

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleCheckUsername}
                  disabled={loading}
                >
                  {loading
                    ? "Checking..."
                    : "Check"}
                </button>

              </div>


              {usernameAvailable === true && (

                <div className="text-success mb-3">
                  ✓ Username is available
                </div>

              )}

              {usernameAvailable === false && (

                <div className="text-danger mb-3">
                  ✗ Username is already taken
                </div>

              )}


              <button
                type="button"
                className="btn btn-primary w-100 py-2 mt-3"
                onClick={handleUsernameContinue}
                disabled={
                  usernameAvailable !== true
                }
              >
                Continue
              </button>

            </div>

          )}


          {/* ==================================================== */}
          {/* STEP 2 - EMAIL */}
          {/* ==================================================== */}

          {step === 2 && (

            <div>

              <h4 className="mb-3">
                Verify your email
              </h4>

              <p className="text-muted">
                Enter your details. We'll send a
                verification code to your email.
              </p>


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
                  />

                </div>

              </div>


              <label className="form-label fw-semibold">
                Email
              </label>

              <input
                type="email"
                className="form-control mb-3"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />


              {!emailVerified && (

                <button
                  type="button"
                  className="btn btn-primary w-100 mb-3"
                  onClick={handleSendEmailOTP}
                  disabled={loading}
                >
                  {loading
                    ? "Sending OTP..."
                    : "Send Email OTP"}
                </button>

              )}


              {!emailVerified && (

                <>

                  <label className="form-label fw-semibold">
                    Email OTP
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter 6-digit OTP"
                    value={formData.email_otp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_otp:
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                      })
                    }
                    maxLength={6}
                  />

                  <button
                    type="button"
                    className="btn btn-success w-100"
                    onClick={handleVerifyEmail}
                    disabled={
                      loading ||
                      formData.email_otp.length !== 6
                    }
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify Email"}
                  </button>

                </>

              )}


              {emailVerified && (

                <div className="alert alert-success">
                  ✓ Email verified successfully.
                </div>

              )}


              <button
                type="button"
                className="btn btn-link mt-3"
                onClick={handleBack}
              >
                ← Back
              </button>

            </div>

          )}


          {/* ==================================================== */}
          {/* STEP 3 - PASSWORD */}
          {/* ==================================================== */}

          {step === 3 && (

            <div>

              <h4 className="mb-3">
                Create your password
              </h4>

              <p className="text-muted">
                Use a strong password to protect
                your account.
              </p>


              {/* Password */}

              <label className="form-label fw-semibold">
                Password
              </label>

              <div className="input-group">

                <input
                  type={
                    passwordVisible
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setPasswordVisible(
                      !passwordVisible
                    )
                  }
                >
                  {passwordVisible
                    ? "Hide"
                    : "Show"}
                </button>

              </div>


              {/* Strength */}

              {formData.password && (

                <div className="mt-2 mb-3">

                  <div
                    className="progress"
                    style={{
                      height: "6px",
                    }}
                  >

                    <div
                      className="progress-bar"
                      style={{
                        width:
                          passwordStrength.width,
                      }}
                    />

                  </div>

                  <small className="text-muted">
                    Password strength:{" "}
                    <strong>
                      {passwordStrength.label}
                    </strong>
                  </small>

                </div>

              )}


              {/* Confirm Password */}

              <label className="form-label fw-semibold mt-2">
                Confirm Password
              </label>

              <div className="input-group mb-3">

                <input
                  type={
                    confirmPasswordVisible
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  name="confirm_password"
                  placeholder="Confirm password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setConfirmPasswordVisible(
                      !confirmPasswordVisible
                    )
                  }
                >
                  {confirmPasswordVisible
                    ? "Hide"
                    : "Show"}
                </button>

              </div>


              {formData.confirm_password && (

                <div className="mb-3">

                  {formData.password ===
                  formData.confirm_password ? (

                    <small className="text-success">
                      ✓ Passwords match
                    </small>

                  ) : (

                    <small className="text-danger">
                      ✗ Passwords do not match
                    </small>

                  )}

                </div>

              )}


              <button
                type="button"
                className="btn btn-primary w-100 py-2"
                onClick={handleSetPassword}
                disabled={loading}
              >
                {loading
                  ? "Creating Password..."
                  : "Continue"}
              </button>


              <button
                type="button"
                className="btn btn-link mt-2"
                onClick={handleBack}
              >
                ← Back
              </button>

            </div>

          )}


          {/* ==================================================== */}
          {/* STEP 4 - PHONE */}
          {/* ==================================================== */}

          {step === 4 && (

            <div>

              <h4 className="mb-3">
                Verify your phone
              </h4>

              <p className="text-muted">
                Phone verification is optional.
                You can verify now or skip it.
              </p>


              <label className="form-label fw-semibold">
                Mobile Number
              </label>

              <input
                type="tel"
                className="form-control mb-2"
                name="phone_number"
                placeholder="+91 9876543210"
                value={formData.phone_number}
                onChange={handleChange}
              />

              <small className="text-muted d-block mb-3">
                Include your country code.
              </small>


              {!phoneOtpSent && (

                <button
                  type="button"
                  className="btn btn-primary w-100 mb-3"
                  onClick={handleSendPhoneOTP}
                  disabled={loading}
                >
                  {loading
                    ? "Sending OTP..."
                    : "Verify Phone with OTP"}
                </button>

              )}


              {phoneOtpSent && (

                <>

                  <label className="form-label fw-semibold">
                    Phone OTP
                  </label>

                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Enter verification code"
                    value={formData.phone_otp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone_otp:
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 8),
                      })
                    }
                  />

                  <button
                    type="button"
                    className="btn btn-success w-100 mb-3"
                    onClick={handleVerifyPhone}
                    disabled={loading}
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify Phone"}
                  </button>

                </>

              )}


              <div className="text-center my-3">
                <span className="text-muted">
                  OR
                </span>
              </div>


              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleSkipPhone}
                disabled={loading}
              >
                Skip Phone Verification
              </button>


              <button
                type="button"
                className="btn btn-link mt-3"
                onClick={handleBack}
              >
                ← Back
              </button>

            </div>

          )}


          {/* ---------------------------------------------------- */}
          {/* Login */}
          {/* ---------------------------------------------------- */}

          <div className="text-center mt-4">

            Already have an account?{" "}

            <Link
              to="/login"
              className="fw-bold text-decoration-none"
            >
              Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;