import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";

import { useAuthStore } from "@/stores/auth.store";

interface PaymentInfo {
    id: string;
    amount: number;
    provider: "ESEWA" | "KHALTI";
    transactionId: string | null;
    status: "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED";
    order: {
        id: string;
        status: string;
    };
}

export default function PaymentSuccessPage() {
    const isInitialized = useAuthStore((s) => s.isInitialized);
    const paymentId = new URLSearchParams(window.location.search).get(
        "paymentid",
    );
    const [payment, setPayment] = useState<PaymentInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCurrent = true;

        if (!isInitialized) return;

        if (!paymentId) {
            setError("Payment ID is missing.");
            setIsLoading(false);
            return () => {
                isCurrent = false;
            };
        }

        setIsLoading(true);
        setError(null);
        void api
            .get<ApiResponse<PaymentInfo>>(
                `/payment/${encodeURIComponent(paymentId)}`,
            )
            .then(({ data }) => {
                if (isCurrent) setPayment(data.data);
            })
            .catch((err: unknown) => {
                if (!isCurrent) return;

                const message = axios.isAxiosError(err)
                    ? (err.response?.data as { message?: string } | undefined)
                          ?.message
                    : undefined;
                setError(message ?? "Failed to load payment details.");
            })
            .finally(() => {
                if (isCurrent) setIsLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [paymentId, isInitialized]);

    if (!isInitialized || isLoading) return <Spinner />;

    if (error || !payment) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-24 text-center">
                <h1 className="mb-2 text-2xl font-bold tracking-tight">
                    Unable to load payment
                </h1>
                <p className="mb-8 text-[14px] text-text-secondary">
                    {error ?? "Payment details are unavailable."}
                </p>
                <Link
                    to="/my-tickets"
                    className="text-[13px] font-medium underline underline-offset-4"
                >
                    View my tickets
                </Link>
            </div>
        );
    }

    const isSuccessful = payment.status === "SUCCESS";

    return (
        <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-24 text-center">
            {/* Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                    />
                </svg>
            </div>

            <h1 className="mb-2 text-2xl font-bold tracking-tight">
                {isSuccessful ? "Payment successful!" : "Payment details"}
            </h1>
            <p className="mb-1 text-[14px] text-text-secondary max-w-sm">
                {isSuccessful
                    ? `Your payment of amount: ${new Intl.NumberFormat(
                          "en-NP",
                          {
                              style: "currency",
                              currency: "NPR",
                          },
                      ).format(
                          payment.amount,
                      )} is confirmed. Your tickets have been confirmed. We've sent a confirmation email with your QR codes.`
                    : `Payment status: ${payment.status.toLowerCase()}.`}
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link
                    to="/my-tickets"
                    id="view-my-tickets-link"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-light"
                >
                    View my tickets
                </Link>
                <Link
                    to="/events"
                    id="browse-more-events-link"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-surface-hover"
                >
                    Browse more events
                </Link>
            </div>
        </div>
    );
}
