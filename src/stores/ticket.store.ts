import { create } from "zustand";
import axios from "axios";
import api from "@/lib/api";
import type { Order, PurchasedEvent, MyTicket, ApiResponse } from "@/types";

interface TicketItem {
    ticketTypeId: string;
    quantity: number;
}

interface TicketState {
    order: Order | null;
    purchasedEvents: PurchasedEvent[];
    currentEventTickets: {
        event: {
            id: string;
            title: string;
            slug: string;
            date: string;
            organizer: { orgName: string };
            category: { name: string; slug: string };
            venue: object | null;
        };
        tickets: MyTicket[];
    } | null;
    isHolding: boolean;
    isInitiatingPayment: boolean;
    isLoadingMyEvents: boolean;
    isLoadingEventTickets: boolean;
    error: string | null;

    holdOrder: (eventId: string, items: TicketItem[]) => Promise<Order | null>;
    initiatePayment: (orderId: string) => Promise<void>;
    fetchMyEvents: () => Promise<void>;
    fetchEventTickets: (eventId: string) => Promise<void>;
    clearOrder: () => void;
    clearError: () => void;
}

function extractError(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string })?.message;
        if (msg) return msg;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

export const useTicketStore = create<TicketState>((set) => ({
    order: null,
    purchasedEvents: [],
    currentEventTickets: null,
    isHolding: false,
    isInitiatingPayment: false,
    isLoadingMyEvents: false,
    isLoadingEventTickets: false,
    error: null,

    holdOrder: async (eventId, items) => {
        set({ isHolding: true, error: null });
        try {
            const { data } = await api.post<ApiResponse<Order>>(
                `/event/${eventId}/order`,
                { items },
            );
            const order = data.data;
            set({ order });
            return order;
        } catch (err: unknown) {
            set({ error: extractError(err, "Failed to create order") });
            return null;
        } finally {
            set({ isHolding: false });
        }
    },

    initiatePayment: async (orderId) => {
        set({ isInitiatingPayment: true, error: null });
        try {
            const { data } = await api.post<{ paymentUrl: string }>(
                `/payment/${orderId}`,
                {},
            );
            // Redirect user to eSewa payment page
            window.location.href = data.paymentUrl;
        } catch (err: unknown) {
            set({ error: extractError(err, "Failed to initiate payment") });
        } finally {
            set({ isInitiatingPayment: false });
        }
    },

    fetchMyEvents: async () => {
        set({ isLoadingMyEvents: true, error: null });
        try {
            const { data } =
                await api.get<ApiResponse<PurchasedEvent[]>>(
                    "/ticket/my-events",
                );
            set({ purchasedEvents: data.data });
        } catch (err: unknown) {
            set({ error: extractError(err, "Failed to load your events") });
        } finally {
            set({ isLoadingMyEvents: false });
        }
    },

    fetchEventTickets: async (eventId) => {
        set({ isLoadingEventTickets: true, error: null });
        try {
            const { data } = await api.get<
                ApiResponse<{
                    event: {
                        id: string;
                        title: string;
                        slug: string;
                        date: string;
                        organizer: { orgName: string };
                        category: { name: string; slug: string };
                        venue: object | null;
                    };
                    tickets: MyTicket[];
                }>
            >(`/ticket/my-events/${eventId}`);
            set({ currentEventTickets: data.data });
        } catch (err: unknown) {
            set({ error: extractError(err, "Failed to load tickets") });
        } finally {
            set({ isLoadingEventTickets: false });
        }
    },

    clearOrder: () => set({ order: null }),
    clearError: () => set({ error: null }),
}));
