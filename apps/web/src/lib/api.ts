import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let token: string | null = null;

      // 1. Check zustand persisted storage
      const storedAuth = localStorage.getItem('reddy-auth-storage');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          token = parsed?.state?.token || null;
        } catch {}
      }

      // 2. Fallbacks
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('accessToken') || sessionStorage.getItem('token');
      }

      if (token && config.headers) {
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
