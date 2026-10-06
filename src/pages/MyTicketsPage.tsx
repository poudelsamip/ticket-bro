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

  if (!isInitialized) return <Spinner />;

  if (!user) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="mb-4 text-[14px] text-text-secondary">
          You need to be logged in to view your tickets.
        </p>
        <Link
          to="/login"
          className="text-[13px] font-medium underline underline-offset-4"
        >
          Login
        </Link>
      </div>
    );
  }

  if (isLoadingMyEvents) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">My Tickets</h1>

      {error && (
        <p className="mb-6 text-[13px] text-red-500">{error}</p>
      )}

      {purchasedEvents.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-secondary py-16 text-center">
          <svg
            className="mx-auto mb-4 h-10 w-10 text-text-muted"
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
          <p className="text-[14px] text-text-secondary">
            You haven't purchased any tickets yet.
          </p>
          <Link
            to="/events"
            className="mt-4 inline-block text-[13px] font-medium underline underline-offset-4"
          >
            Browse events →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchasedEvents.map((ev) => (
            <Link
              key={ev.id}
              to={`/my-tickets/${ev.id}`}
              id={`event-ticket-${ev.id}`}
              className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">
                    {ev.title}
                  </p>
                  {ev.venue && (
                    <p className="mt-0.5 text-[12px] text-text-muted">
                      {ev.venue.address}, {ev.venue.district}
                    </p>
                  )}
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ev.tickets.map((t) => (
                  <span
                    key={t.name}
                    className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold"
                  >
                    {t.name} {'×'} {t.quantity}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
