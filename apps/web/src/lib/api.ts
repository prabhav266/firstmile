import axios from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token across domains
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token renewal or redirects
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If auth token expired and request hasn't retried yet
    if (
      (error.response?.status === 401 || (error.response?.status === 404 && originalRequest?.url?.includes('/api/auth/me'))) &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/api/auth/login') &&
      !originalRequest?.url?.includes('/api/auth/send-otp') &&
      !originalRequest?.url?.includes('/api/auth/verify-otp')
    ) {
      try {
        const refreshRes = await axios.post(`${NEXT_PUBLIC_API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        const newToken = refreshRes.data?.data?.accessToken;
        if (newToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth-token', newToken);
            document.cookie = `auth-token=${newToken}; path=/; max-age=86400; SameSite=Lax; secure`;
            try {
              await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: newToken }),
              });
            } catch (e) {}
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        // Stale cookie / user no longer exists in DB
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pathforge-career-os-gamification');
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
