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

  if (isLoadingEventTickets) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="mb-4 text-[13px] text-red-500">{error}</p>
        <Link
          to="/my-tickets"
          className="text-[13px] font-medium underline underline-offset-4"
        >
          ← Back to my tickets
        </Link>
      </div>
    );
  }

  if (!currentEventTickets) {
    return (
      <p className="py-24 text-center text-[13px] text-text-muted">
        No tickets found.
      </p>
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
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <Link
        to="/my-tickets"
        className="mb-8 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to my tickets
      </Link>

      {/* Event header */}
      <div className="mb-8">
        <span className="mb-2 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
          {event.category.name}
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
        <p className="mt-1 text-[13px] text-text-secondary">{eventDate}</p>
        <p className="text-[13px] text-text-muted">
          Organized by {event.organizer.orgName}
        </p>
      </div>

      {/* Ticket cards */}
      <div className="space-y-4">
        {tickets.map((ticket, idx) => (
          <div
            key={ticket.id}
            id={`ticket-card-${ticket.id}`}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold">{ticket.ticketType}</p>
                <p className="text-[11px] text-text-muted">
                  Ticket #{idx + 1}
                </p>
              </div>
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                VALID
              </span>
            </div>

            {/* QR Code display */}
            <div className="flex flex-col items-center rounded-md border border-border bg-surface-secondary p-6">
              <QrCodeDisplay value={ticket.qrCode} size={160} />
              <p className="mt-3 font-mono text-[11px] tracking-widest text-text-muted">
                {ticket.qrCode}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Inline QR code renderer using SVG – no external library needed for display */
function QrCodeDisplay({ value, size }: { value: string; size: number }) {
  // We use an img tag pointing to a free QR generation API
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg&qzone=1`;

  return (
    <img
      src={src}
      alt={`QR code: ${value}`}
      width={size}
      height={size}
      className="rounded"
    />
  );
}
