import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { refreshAuth } from "@/lib/api";
import type { User, ApiResponse } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  fetchMe: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isInitialized: false,

      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<
            ApiResponse<{ user: User; accessToken: string }>
          >("/auth/login", { email, password });

          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (body) => {
        set({ isLoading: true });
        try {
          await api.post("/auth/register", body);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get<ApiResponse<{ user: User }>>("/auth/me");
          set({ user: data.data.user });
        } catch {
          set({ user: null, accessToken: null });
        }
      },

      initializeAuth: async () => {
        try {
          await refreshAuth();
        } catch {
          set({ user: null, accessToken: null });
        } finally {
          set({ isInitialized: true });
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          /* swallow */
        }
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
