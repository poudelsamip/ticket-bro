import { useEffect } from "react";
import { Link } from "react-router";
import { useOrganizerStore } from "@/stores/organizer.store";
import { useAuthStore } from "@/stores/auth.store";
import Spinner from "@/components/Spinner";

export default function OrganizerEventsPage() {
  const { user, isInitialized } = useAuthStore();
  const { events, isLoading, error, fetchOrgEvents } = useOrganizerStore();

  useEffect(() => {
    if (isInitialized && user?.role === "ORGANIZER") {
      void fetchOrgEvents();
    }
  }, [isInitialized, user, fetchOrgEvents]);

  if (!isInitialized) return <Spinner label="Authenticating organizer portal..." />;

  if (!user || user.role !== "ORGANIZER") {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <svg className="empty-state__icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
          <h2 className="empty-state__title">Organizer Access Only</h2>
          <p className="empty-state__body">
            You must be signed in with an organizer account to access event management.
          </p>
          <Link to="/login" className="navbar__btn text-xs">
            Sign In with Organizer Account
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <Spinner label="Loading your organized events..." />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="navbar__role-tag !bg-accent-light !text-accent font-bold">
              Organizer Space
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            My Organized Events
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Manage your schedule, ticket allocations, revenue payouts, and gate staff
          </p>
        </div>

        <Link
          to="/events/new"
          id="create-event-btn"
          className="navbar__btn navbar__btn--accent text-xs font-bold uppercase tracking-wider py-3 px-5 shadow-sm inline-flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Event
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger-bg border border-danger-border text-xs font-semibold text-danger">
          {error}
        </div>
      )}

      {events.length === 0 ? (
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <h3 className="empty-state__title">No events published yet</h3>
          <p className="empty-state__body">
            You haven't created any event listings. Start selling passes by publishing your first event.
          </p>
          <Link
            to="/events/new"
            className="navbar__btn navbar__btn--accent text-xs"
          >
            + Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {events.map((ev) => (
            <Link
              key={ev.id}
              to={`/organizer/events/${ev.slug}`}
              id={`org-event-${ev.slug}`}
              className="card card--padded card--interactive group !p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`status-pill status-pill--${ev.status} text-[10px]`}>
                      {ev.status}
                    </span>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      {ev.category.name}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                    {ev.title}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {new Date(ev.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {ev.venue && (
                      <span className="flex items-center gap-1 truncate">
                        <span>📍</span>
                        {ev.venue.name} — {ev.venue.district}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-bold text-text-secondary group-hover:text-accent transition-colors">
                    Manage Event
                  </span>
                  <div className="w-8 h-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-muted group-hover:border-accent group-hover:text-accent transition-all">
                    <svg
                      className="h-4 w-4"
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
