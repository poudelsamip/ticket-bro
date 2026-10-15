import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { useTicketStore } from "@/stores/ticket.store";
import Spinner from "@/components/Spinner";

export default function EventTicketDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { currentEventTickets, isLoadingEventTickets, error, fetchEventTickets } =
    useTicketStore();

  useEffect(() => {
    if (eventId) void fetchEventTickets(eventId);
  }, [eventId, fetchEventTickets]);

  if (isLoadingEventTickets) return <Spinner label="Loading ticket passes..." />;

  if (error) {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <p className="text-danger text-sm font-semibold mb-3">{error}</p>
          <Link to="/my-tickets" className="navbar__btn text-xs">
            ← Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!currentEventTickets) {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <h2 className="empty-state__title">No Passes Found</h2>
          <p className="empty-state__body">
            No active tickets were retrieved for this event booking.
          </p>
          <Link to="/my-tickets" className="navbar__btn text-xs">
            ← Back to My Tickets
          </Link>
        </div>
      </div>
    );
  }

  const { event, tickets } = currentEventTickets;

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="page-container--narrow">
      {/* Back button */}
      <Link to="/my-tickets" className="back-link">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to my passes
      </Link>

      {/* Event Header Banner */}
      <div className="card card--padded bg-gradient-to-br from-surface to-surface-secondary border-border shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="event-card__category bg-accent-light text-accent px-2.5 py-0.5 rounded-full mb-2">
              {event.category.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mt-1">
              {event.title}
            </h1>
            <p className="text-sm font-medium text-text-secondary mt-1">
              {eventDate}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Organized by <span className="font-semibold text-text-primary">{event.organizer.orgName}</span>
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-success-bg text-success border border-success-border text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              {tickets.length} Verified Pass{tickets.length !== 1 ? "es" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Ticket Passes list */}
      <div className="space-y-6">
        {tickets.map((ticket, idx) => (
          <div
            key={ticket.id}
            id={`ticket-card-${ticket.id}`}
            className="card overflow-hidden border-2 border-border shadow-md bg-surface"
          >
            {/* Top Pass Header */}
            <div className="p-5 sm:p-6 bg-surface flex items-center justify-between border-b border-border">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-faint">
                  Ticket #{idx + 1} of {tickets.length}
                </span>
                <h3 className="text-lg font-bold text-text-primary mt-0.5">
                  {ticket.ticketType}
                </h3>
              </div>
              <span className="status-pill status-pill--PUBLISHED flex items-center gap-1">
                <span>✓</span> VALID PASS
              </span>
            </div>

            {/* Perforation detail */}
            <div className="relative flex items-center justify-between px-2 bg-surface-secondary">
              <div className="w-4 h-4 rounded-full bg-surface-secondary -ml-4 border-r border-border" />
              <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
              <div className="w-4 h-4 rounded-full bg-surface-secondary -mr-4 border-l border-border" />
            </div>

            {/* QR Code Presentation Body */}
            <div className="p-6 sm:p-8 bg-surface-secondary flex flex-col items-center text-center">
              <div className="p-4 rounded-2xl bg-white border border-border shadow-sm">
                <QrCodeDisplay value={ticket.qrCode} size={180} />
              </div>
              <p className="mt-4 font-mono text-xs font-bold tracking-widest text-text-primary bg-surface px-4 py-1.5 rounded-lg border border-border">
                {ticket.qrCode}
              </p>
              <p className="mt-2 text-xs text-text-muted max-w-xs">
                Scan this QR code at the event gate for quick entry verification.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Inline QR code renderer using SVG */
function QrCodeDisplay({ value, size }: { value: string; size: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg&qzone=1`;

  return (
    <img
      src={src}
      alt={`QR code: ${value}`}
      width={size}
      height={size}
      className="rounded-lg"
    />
  );
}
