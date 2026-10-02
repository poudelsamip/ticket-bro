import { create } from "zustand";
import api from "@/lib/api";
import type { EventListItem, EventDetail, Pagination, ApiResponse } from "@/types";

interface EventFilters {
  search?: string;
  categoryId?: string;
  date?: string;
  district?: string;
  page: number;
  limit: number;
}

interface EventState {
  events: EventListItem[];
  pagination: Pagination | null;
  currentEvent: EventDetail | null;
  filters: EventFilters;
  isLoading: boolean;
  error: string | null;

  setFilters: (filters: Partial<EventFilters>) => void;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  fetchEventBySlug: (slug: string) => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  pagination: null,
  currentEvent: null,
  filters: { page: 1, limit: 20 },
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.date) params.set("date", filters.date);
      if (filters.district) params.set("district", filters.district);
      params.set("page", String(filters.page));
      params.set("limit", String(filters.limit));

      const { data } = await api.get<
        ApiResponse<{ events: EventListItem[]; pagination: Pagination }>
      >(`/event?${params.toString()}`);

      set({
        events: data.data.events,
        pagination: data.data.pagination,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load events";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEventById: async (id) => {
    set({ isLoading: true, error: null, currentEvent: null });
    try {
      const { data } = await api.get<ApiResponse<{ event: EventDetail }>>(
        `/event/${id}`
      );
      set({ currentEvent: data.data.event });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load event";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEventBySlug: async (slug) => {
    set({ isLoading: true, error: null, currentEvent: null });
    try {
      const { data } = await api.get<ApiResponse<{ event: EventDetail }>>(
        `/event/${slug}`
      );
      set({ currentEvent: data.data.event });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load event";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  searchEvents: async (query) => {
    set((state) => ({
      filters: { ...state.filters, search: query, page: 1 },
    }));
    await get().fetchEvents();
  },
}));
