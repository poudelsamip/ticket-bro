import { create } from "zustand";
import api from "@/lib/api";
import type { OrgEventListItem, OrgEventDetail, ApiResponse } from "@/types";

interface OrganizerState {
  events: OrgEventListItem[];
  currentEvent: OrgEventDetail | null;
  isLoading: boolean;
  error: string | null;

  fetchOrgEvents: () => Promise<void>;
  fetchOrgEventBySlug: (slug: string) => Promise<void>;
}

export const useOrganizerStore = create<OrganizerState>((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  fetchOrgEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<ApiResponse<OrgEventListItem[]>>(
        "/organizer/events"
      );
      set({ events: data.data });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load organizer events";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrgEventBySlug: async (slug) => {
    set({ isLoading: true, error: null, currentEvent: null });
    try {
      const { data } = await api.get<ApiResponse<OrgEventDetail>>(
        `/organizer/events/${slug}`
      );
      set({ currentEvent: data.data });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load event";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
