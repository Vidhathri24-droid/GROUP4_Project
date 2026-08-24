import api from "../api/api";

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export const login = async(email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    const data = response.data;
    const token = data && (data.access_token || data.token || data.accessToken);

    if (token) {
        localStorage.setItem("access_token", token);
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }
    }

    return data;
};

export const googleLogin = async(credential) => {
    const response = await api.post("/auth/google", {
        credential,
    });

    const data = response.data;
    const token = data && (data.access_token || data.token || data.accessToken);

    if (token) {
        localStorage.setItem("access_token", token);
    }

    return data;
};

/*
|--------------------------------------------------------------------------
| Old Registration Endpoint
|--------------------------------------------------------------------------
*/

export const register = async(userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

/*
|--------------------------------------------------------------------------
| New Multi-Step Registration
|--------------------------------------------------------------------------
*/

export const checkUsername = async(username) => {
    const response = await api.post("/auth/check-username", { username });
    return response.data;
};

export const startRegistration = async({ username, first_name, last_name, email }) => {
    const response = await api.post("/auth/register/start", {
        username,
        first_name,
        last_name,
        email,
    });
    return response.data;
};

export const verifyRegistrationEmail = async(email, otp) => {
    const response = await api.post("/auth/register/verify-email", { email, otp });
    return response.data;
};

export const setRegistrationPassword = async(email, password, confirm_password) => {
    const response = await api.post("/auth/register/set-password", {
        email,
        password,
        confirm_password,
    });
    return response.data;
};

export const sendRegistrationPhoneOTP = async(email, phone_number) => {
    const response = await api.post("/auth/register/phone/send-otp", {
        email,
        phone_number,
    });
    return response.data;
};

export const verifyRegistrationPhoneOTP = async(email, phone_number, code) => {
    const response = await api.post("/auth/register/phone/verify-otp", {
        email,
        phone_number,
        code,
    });
    return response.data;
};

export const skipRegistrationPhone = async(email) => {
    const response = await api.post("/auth/register/phone/skip", { email });
    return response.data;
};

export const completeRegistration = async(email) => {
    const response = await api.post("/auth/register/complete", { email });
    return response.data;
};

/*
|--------------------------------------------------------------------------
| Verification & Reset
|--------------------------------------------------------------------------
*/

export const verifyEmail = async(token) => {
    const response = await api.get("/auth/verify-email", { params: { token } });
    return response.data;
};

export const resendVerification = async(email) => {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
};

export const forgotPassword = async(email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async(token, password) => {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
};

/*
|--------------------------------------------------------------------------
| Current User & Logout
|--------------------------------------------------------------------------
*/

export const getCurrentUser = async() => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
};