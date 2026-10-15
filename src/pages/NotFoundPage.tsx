import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
        Error 404
      </div>

      <div className="relative mb-6 flex select-none items-center justify-center">
        <span className="text-8xl sm:text-9xl font-black tracking-tighter text-border-light select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
            <svg
              className="h-8 w-8 text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
              />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-sm text-text-muted leading-relaxed">
        The link you followed might be broken, or the event page may have expired.
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/events"
          id="not-found-explore-events"
          className="navbar__btn px-6 py-2.5 text-xs uppercase tracking-wider"
        >
          Explore Events Catalog
        </Link>
        <Link
          to="/"
          id="not-found-go-home"
          className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
