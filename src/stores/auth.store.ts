import { create } from "zustand";
import api from "@/lib/api";
import type { User, ApiResponse } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;

  setAccessToken: (token: string) => void;

  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,

  setAccessToken: (token) => set({ accessToken: token }),

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
    if (!get().accessToken) return;
    try {
      const { data } = await api.get<ApiResponse<{ user: User }>>("/auth/me");
      set({ user: data.data.user });
    } catch {
      set({ user: null, accessToken: null });
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
}));
