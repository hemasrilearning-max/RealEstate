
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================
axiosInstance.interceptors.request.use(
    (config) => {

        // Get the CURRENT logged-in user's token.
        // Every login can have a different JWT.
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        // JSON request
        if (!(config.data instanceof FormData)) {
            config.headers = config.headers || {};
            config.headers["Content-Type"] = "application/json";
        }

        // Do NOT manually set Content-Type for FormData.
        // Axios/browser will add the multipart boundary automatically.

        return config;
    },
    (error) => Promise.reject(error)
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================
axiosInstance.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            // Token is invalid/expired.
            localStorage.removeItem("accessToken");
            localStorage.removeItem("authUser");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

