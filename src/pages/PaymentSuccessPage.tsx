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
  const paymentId = new URLSearchParams(window.location.search).get("paymentid");
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    if (!isInitialized) return;

    if (!paymentId) {
      setError("Payment transaction ID was not provided in the return URL.");
      setIsLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setIsLoading(true);
    setError(null);
    void api
      .get<ApiResponse<PaymentInfo>>(`/payment/${encodeURIComponent(paymentId)}`)
      .then(({ data }) => {
        if (isCurrent) setPayment(data.data);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        setError(message ?? "Failed to load payment confirmation details.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [paymentId, isInitialized]);

  if (!isInitialized || isLoading) return <Spinner label="Verifying payment confirmation..." />;

  if (error || !payment) {
    return (
      <div className="page-container--form">
        <div className="card card--padded max-w-md w-full text-center border-border shadow-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-danger-bg text-danger flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Unable to Verify Payment
          </h1>
          <p className="text-xs text-text-muted mb-6 leading-relaxed">
            {error ?? "Payment details are currently unavailable or still processing."}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/my-tickets" className="navbar__btn text-xs py-2.5">
              Check My Tickets
            </Link>
            <Link to="/events" className="text-xs font-semibold text-text-muted hover:text-text-primary py-1">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuccessful = payment.status === "SUCCESS";

  return (
    <div className="page-container--form">
      <div className="card card--padded max-w-md w-full text-center border-2 border-border shadow-xl bg-surface">
        {/* Animated Checkmark Circle */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-success-bg text-success flex items-center justify-center border-2 border-success-border shadow-xs">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-success bg-success-bg px-2.5 py-0.5 rounded-full inline-block mb-2">
          {isSuccessful ? "Order Confirmed" : `Status: ${payment.status}`}
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary mb-2">
          {isSuccessful ? "Payment Confirmed!" : "Payment Details"}
        </h1>

        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          {isSuccessful
            ? `Your booking is finalized and your entry QR codes are ready in your account.`
            : `Payment status reported: ${payment.status.toLowerCase()}.`}
        </p>

        {/* Receipt Box */}
        <div className="bg-surface-secondary border border-border rounded-xl p-4 mb-6 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-faint font-semibold uppercase tracking-wider text-[10px]">Total Paid</span>
            <span className="font-extrabold text-sm text-text-primary tabular-nums">
              {new Intl.NumberFormat("en-NP", {
                style: "currency",
                currency: "NPR",
              }).format(payment.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-faint font-semibold uppercase tracking-wider text-[10px]">Payment Provider</span>
            <span className="font-semibold text-text-secondary">{payment.provider}</span>
          </div>
          {payment.transactionId && (
            <div className="flex items-center justify-between">
              <span className="text-text-faint font-semibold uppercase tracking-wider text-[10px]">Transaction ID</span>
              <span className="font-mono text-text-muted text-[11px]">{payment.transactionId}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-faint font-semibold uppercase tracking-wider text-[10px]">Order Ref</span>
            <span className="font-mono text-text-muted text-[11px]">{payment.order.id.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Buttons preserving tests ids */}
        <div className="flex flex-col gap-2.5">
          <Link
            to="/my-tickets"
            id="view-my-tickets-link"
            className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>View My QR Passes</span>
            <span>→</span>
          </Link>
          <Link
            to="/events"
            id="browse-more-events-link"
            className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}
