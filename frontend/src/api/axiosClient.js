import axios from "axios";

// Vite exposes env variables under import.meta.env. If VITE_API_BASE_URL is missing
// fall back to a sensible default so the frontend still reaches the backend
// when env wasn't loaded in the dev environment.
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

if (!import.meta.env.VITE_API_BASE_URL) {
    // Helpful during development to indicate why requests might go to the fallback
    // (the browser console will show this). Keep as a warning, not an exception.
    // eslint-disable-next-line no-console
    console.warn("VITE_API_BASE_URL is not set — falling back to http://localhost:5000/api");
}

const instance = axios.create({
    baseURL: API_URL,
    headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional)
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor (global error logging)
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Global Axios Error:", error);

        // Optionally show a toast notification
        // toast.error(error.response?.data?.message || "Something went wrong");

        // You can also log it to a server here
        // logErrorToServer(error);

        return Promise.reject(error); // still propagate error
    }
);

export default instance;