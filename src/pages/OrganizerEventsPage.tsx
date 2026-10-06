import { useEffect } from "react";
import { Link } from "react-router";
import { useOrganizerStore } from "@/stores/organizer.store";
import { useAuthStore } from "@/stores/auth.store";
import Spinner from "@/components/Spinner";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  PUBLISHED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-700",
};

export default function OrganizerEventsPage() {
  const { user, isInitialized } = useAuthStore();
  const { events, isLoading, error, fetchOrgEvents } = useOrganizerStore();

  useEffect(() => {
    if (isInitialized && user?.role === "ORGANIZER") {
      void fetchOrgEvents();
    }
  }, [isInitialized, user, fetchOrgEvents]);

  if (!isInitialized) return <Spinner />;

  if (!user || user.role !== "ORGANIZER") {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="mb-4 text-[14px] text-text-secondary">
          This page is only accessible to organizers.
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

  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
        <Link
          to="/events/new"
          id="create-event-btn"
          className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-80"
        >
          + New Event
        </Link>
      </div>

      {error && (
        <p className="mb-6 text-[13px] text-red-500">{error}</p>
      )}

      {events.length === 0 ? (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <p className="text-[14px] text-text-secondary">
            You haven't created any events yet.
          </p>
          <Link
            to="/events/new"
            className="mt-4 inline-block text-[13px] font-medium underline underline-offset-4"
          >
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/organizer/events/${ev.slug}`}
              id={`org-event-${ev.slug}`}
              className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-semibold">
                      {ev.title}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[ev.status] ?? ""}`}
                    >
                      {ev.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-text-muted">
                    {new Date(ev.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {' · '}
                    {ev.category.name}
                  </p>
                  {ev.venue && (
                    <p className="mt-0.5 text-[12px] text-text-muted">
                      {ev.venue.name} — {ev.venue.district}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
