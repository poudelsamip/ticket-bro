import { useEffect } from "react";
import { Link } from "react-router";
import { useTicketStore } from "@/stores/ticket.store";
import { useAuthStore } from "@/stores/auth.store";
import Spinner from "@/components/Spinner";

export default function MyTicketsPage() {
  const { user, isInitialized } = useAuthStore();
  const {
    purchasedEvents,
    isLoadingMyEvents,
    error,
    fetchMyEvents,
  } = useTicketStore();

  useEffect(() => {
    if (isInitialized && user) {
      void fetchMyEvents();
    }
  }, [isInitialized, user, fetchMyEvents]);

  if (!isInitialized) return <Spinner label="Authenticating user..." />;

  if (!user) {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <svg className="empty-state__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <h2 className="empty-state__title">Account Required</h2>
          <p className="empty-state__body">
            You need to be signed in to access and manage your purchased event tickets.
          </p>
          <Link to="/login" className="navbar__btn text-xs">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingMyEvents) return <Spinner label="Fetching your tickets..." />;

  return (
    <div className="page-container--narrow">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            My Passes & Tickets
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Present your QR code pass at the venue entrance for gate admission
          </p>
        </div>
        {purchasedEvents.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-bold border border-accent-subtle">
            {purchasedEvents.length} Event{purchasedEvents.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger-bg border border-danger-border text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      {purchasedEvents.length === 0 ? (
        <div className="empty-state">
          <svg
            className="empty-state__icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
            />
          </svg>
          <h3 className="empty-state__title">No passes purchased yet</h3>
          <p className="empty-state__body">
            You don't have any upcoming event passes. Explore our live catalog to discover concerts, festivals, and games!
          </p>
          <Link to="/events" className="navbar__btn text-xs">
            Browse All Events →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchasedEvents.map((ev) => (
            <Link
              key={ev.id}
              to={`/my-tickets/${ev.id}`}
              id={`event-ticket-${ev.id}`}
              className="ticket-item group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="status-pill status-pill--PUBLISHED text-[10px]">
                      Confirmed Pass
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                    {ev.title}
                  </h3>
                  {ev.venue && (
                    <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="truncate">{ev.venue.address}, {ev.venue.district}</span>
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  <div className="flex flex-wrap gap-1.5">
                    {ev.tickets.map((t) => (
                      <span
                        key={t.name}
                        className="px-2.5 py-1 rounded-md bg-accent-light text-accent text-xs font-bold border border-accent-subtle tabular-nums"
                      >
                        {t.name} × {t.quantity}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform">
                    View QR Passes →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
