import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  sendRegisterOtp: (email: string) => Promise<string>;
  verifyAndRegister: (data: { name: string; email: string; password: string; otp: string }) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', credentials);
          const { user, accessToken } = res.data;
          set({
            user: user || null,
            token: accessToken,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      sendRegisterOtp: async (email: string) => {
        const res = await api.post('/auth/send-otp', { email });
        return res.data.message || 'OTP sent successfully';
      },

      verifyAndRegister: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/verify-register', data);
          const { user, accessToken } = res.data;
          set({
            user: user || null,
            token: accessToken,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        try {
          const res = await api.get('/auth/profile');
          set({ user: res.data, isAuthenticated: true });
        } catch {
          // Keep current state if offline or profile route is missing
        }
      },

      logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    }
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('reddy-auth-storage');
        }
      },
    }),
    {
      name: 'reddy-auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);