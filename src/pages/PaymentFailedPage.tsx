import { Link } from "react-router";

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-24 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <svg
          className="h-8 w-8 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Payment failed
      </h1>
      <p className="mb-8 text-[14px] text-text-secondary max-w-sm">
        Your payment could not be completed. Any held tickets have been
        released. Please try again.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/events"
          id="try-again-link"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-light"
        >
          ← Back to events
        </Link>
      </div>
    </div>
  );
}
