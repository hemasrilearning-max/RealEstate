import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================
axiosInstance.interceptors.request.use(
  (config) => {
    // Support the token keys currently used by the application.
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("re_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // JSON request
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // For FormData, DON'T manually set Content-Type.
    // Browser/Axios will automatically set:
    // multipart/form-data; boundary=....

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
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("re_access_token");
      localStorage.removeItem("user");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
