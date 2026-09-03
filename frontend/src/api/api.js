import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

/*
|--------------------------------------------------------------------------
| Attach JWT token to every request
|--------------------------------------------------------------------------
|
| Check both localStorage and sessionStorage because:
|
| Remember Me = true  -> localStorage
| Remember Me = false -> sessionStorage
|
*/

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
|--------------------------------------------------------------------------
| Handle authentication errors
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;