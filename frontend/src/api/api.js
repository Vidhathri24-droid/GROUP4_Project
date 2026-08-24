import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://group4-projects.onrender.com";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config && error.config.url ? error.config.url : "";
        const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");

        if (error.response && error.response.status === 401 && !isAuthRequest) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;