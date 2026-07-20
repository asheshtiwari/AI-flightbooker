import axios from 'axios';

// local dev uses local backend, production uses render
const isLocalDev = import.meta.env.MODE === 'development';

axios.defaults.baseURL = isLocalDev
    ? 'http://localhost:5000'
    : 'https://ai-flightbooker-backend.onrender.com';

export const setupAxiosInterceptors = () => {

    // attach token to every request automatically
    axios.interceptors.request.use(
        (config) => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                console.error("Interceptor request error:", err);
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // 401 means token expired or invalid — clear session and redirect
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                localStorage.clear();
                // avoid infinite redirect if already on root
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
            return Promise.reject(error);
        }
    );
};