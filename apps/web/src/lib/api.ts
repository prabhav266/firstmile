import axios from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token renewal or redirects
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If auth token expired and request hasn't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/login') {
      originalRequest._retry = true;
      try {
        await axios.post(`${NEXT_PUBLIC_API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed -> redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
