import axios from "axios";

// Create an Axios instance
const api = axios.create({
    baseURL: "http://localhost:8080",
});
// Add a request interceptor to include JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// Optionally handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = "/signin";
        }
        return Promise.reject(error);
    }
);
export default api;
