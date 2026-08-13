import api from "../api/api";

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await api.post("/auth/google", {
    credential,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Old Registration Endpoint
|--------------------------------------------------------------------------
| Kept so existing code does not break.
*/

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| New Multi-Step Registration
|--------------------------------------------------------------------------
*/

/*
 * Step 1
 * Check username availability
 */
export const checkUsername = async (username) => {
  const response = await api.post("/auth/check-username", {
    username,
  });

  return response.data;
};

/*
 * Step 2
 * Start registration and send email OTP
 */
export const startRegistration = async ({
  username,
  first_name,
  last_name,
  email,
}) => {
  const response = await api.post("/auth/register/start", {
    username,
    first_name,
    last_name,
    email,
  });

  return response.data;
};

/*
 * Step 2
 * Verify email OTP
 */
export const verifyRegistrationEmail = async (
  email,
  otp
) => {
  const response = await api.post(
    "/auth/register/verify-email",
    {
      email,
      otp,
    }
  );

  return response.data;
};

/*
 * Step 3
 * Set password
 */
export const setRegistrationPassword = async (
  email,
  password,
  confirm_password
) => {
  const response = await api.post(
    "/auth/register/set-password",
    {
      email,
      password,
      confirm_password,
    }
  );

  return response.data;
};

/*
 * Step 4
 * Send phone OTP
 */
export const sendRegistrationPhoneOTP = async (
  email,
  phone_number
) => {
  const response = await api.post(
    "/auth/register/phone/send-otp",
    {
      email,
      phone_number,
    }
  );

  return response.data;
};

/*
 * Step 4
 * Verify phone OTP
 */
export const verifyRegistrationPhoneOTP = async (
  email,
  phone_number,
  code
) => {
  const response = await api.post(
    "/auth/register/phone/verify-otp",
    {
      email,
      phone_number,
      code,
    }
  );

  return response.data;
};

/*
 * Step 4
 * Skip phone verification
 */
export const skipRegistrationPhone = async (email) => {
  const response = await api.post(
    "/auth/register/phone/skip",
    {
      email,
    }
  );

  return response.data;
};

/*
 * Complete registration
 *
 * Used after successful phone verification.
 */
export const completeRegistration = async (email) => {
  const response = await api.post(
    "/auth/register/complete",
    {
      email,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Existing Email Verification
|--------------------------------------------------------------------------
*/

export const verifyEmail = async (token) => {
  const response = await api.get("/auth/verify-email", {
    params: {
      token,
    },
  });

  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post(
    "/auth/resend-verification",
    {
      email,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Password Reset
|--------------------------------------------------------------------------
*/

export const forgotPassword = async (email) => {
  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};

export const resetPassword = async (
  token,
  password
) => {
  const response = await api.post(
    "/auth/reset-password",
    {
      token,
      password,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logout = () => {
  localStorage.removeItem("access_token");
};