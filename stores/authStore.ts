import { create } from 'zustand';

import {
  AuthUser,
  getAccessToken,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
} from '@/services/auth/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true });

    try {
      const token = await getAccessToken();

      if (!token) {
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
        return;
      }

      try {
        const user = await getCurrentUser();

        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } catch {
        await refreshSession();
const user = await getCurrentUser();

        set({
          user,
          isAuthenticated: !!user,
          isInitialized: true,
          isLoading: false,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await loginRequest(email, password);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      return response.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await logoutRequest();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  refresh: async () => {
    try {
      const response = await refreshSession();
      const user = await getCurrentUser();

      set({
        user,
        isAuthenticated: true,
      });

      return user;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });

      return null;
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));