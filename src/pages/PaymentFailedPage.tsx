import { Link } from "react-router";

export default function PaymentFailedPage() {
  return (
    <div className="page-container--form">
      <div className="card card--padded max-w-md w-full text-center border-border shadow-lg bg-surface">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-danger-bg text-danger flex items-center justify-center border border-danger-border">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-danger bg-danger-bg px-2.5 py-0.5 rounded-full inline-block mb-2">
          Transaction Incomplete
        </span>

        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary mb-2">
          Payment Was Not Completed
        </h1>

        <p className="text-xs text-text-muted mb-6 leading-relaxed max-w-sm mx-auto">
          Your payment could not be processed or was cancelled. Any tickets held during checkout have been released back to general inventory.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            to="/events"
            id="try-again-link"
            className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
          >
            ← Return to Events Catalog
          </Link>
          <Link
            to="/my-tickets"
            className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors"
          >
            View Existing Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
