import { Link } from "react-router";

export default function PaymentSuccessPage() {
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
        Payment successful!
      </h1>
      <p className="mb-1 text-[14px] text-text-secondary max-w-sm">
        Your tickets have been confirmed. We've sent a confirmation email with
        your QR codes.
      </p>
      <p className="mb-8 text-[13px] text-text-muted">
        Check your inbox (and spam folder) for the ticket details.
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
