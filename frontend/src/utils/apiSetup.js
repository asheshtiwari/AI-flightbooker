import axios from 'axios';

// YAHAN APNA RENDER KA LIVE LINK ADD KARO:
axios.defaults.baseURL = 'https://ai-flightbooker.onrender.com';

/**
 * Global API Interceptor Setup
 * Handles JWT injection and automated session cleanup on unauthorized access.
 */
export const setupAxiosInterceptors = () => {
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

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // Handle token expiration or invalid session
            if (error.response?.status === 401) {
                localStorage.clear();
                // Avoid infinite redirect if already at root
                if (window.location.pathname !== '/') {
                    window.location.href = '/'; 
                }
            }
            return Promise.reject(error);
        }
    );
};