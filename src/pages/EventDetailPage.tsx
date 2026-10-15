import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useEventStore } from "@/stores/event.store";
import { useTicketStore } from "@/stores/ticket.store";
import { useAuthStore } from "@/stores/auth.store";
import Spinner from "@/components/Spinner";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentEvent, isLoading, error, fetchEventBySlug } = useEventStore();
  const {
    holdOrder,
    initiatePayment,
    isHolding,
    isInitiatingPayment,
    error: ticketError,
    clearError,
  } = useTicketStore();
  const { user } = useAuthStore();

  // quantities keyed by ticketTypeId
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"select" | "summary" | "paying">("select");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) void fetchEventBySlug(slug);
  }, [slug, fetchEventBySlug]);

  // Reset quantities when event changes
  useEffect(() => {
    if (currentEvent) {
      const initial: Record<string, number> = {};
      currentEvent.ticketTypes.forEach((t) => {
        initial[t.id] = 0;
      });
      setQuantities(initial);
    }
  }, [currentEvent?.id]);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isHolding && !isInitiatingPayment) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen, isHolding, isInitiatingPayment]);

  const closeModal = () => {
    if (isHolding || isInitiatingPayment) return;
    setIsModalOpen(false);
    setModalStep("select");
    setLocalError(null);
    clearError();
  };

  const handleOpenBuyModal = () => {
    setIsModalOpen(true);
    setModalStep("select");
    setLocalError(null);
    clearError();
  };

  const setQty = (ticketId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [ticketId]: value }));
    setLocalError(null);
    clearError();
  };

  const selectedItems =
    currentEvent?.ticketTypes
      .filter((t) => (quantities[t.id] ?? 0) > 0)
      .map((t) => ({ ticketType: t, quantity: quantities[t.id] })) ?? [];

  const grandTotal = selectedItems.reduce(
    (sum, { ticketType, quantity }) => sum + ticketType.price * quantity,
    0
  );

  const handleProceedToConfirm = () => {
    if (!user) {
      closeModal();
      void navigate("/login");
      return;
    }
    if (selectedItems.length === 0) {
      setLocalError("Please select at least one ticket.");
      return;
    }
    setModalStep("summary");
  };

  const handleConfirmPurchase = async () => {
    if (!currentEvent) return;
    const items = selectedItems.map(({ ticketType, quantity }) => ({
      ticketTypeId: ticketType.id,
      quantity,
    }));
    const order = await holdOrder(currentEvent.id, items);
    if (order) {
      setModalStep("paying");
      await initiatePayment(order.id);
    }
  };

  if (isLoading) return <Spinner label="Loading event details..." />;

  if (error) {
    return (
      <div className="page-container--form text-center flex-col">
        <div className="empty-state max-w-md">
          <p className="text-danger font-medium mb-3">{error}</p>
          <Link to="/events" className="navbar__btn text-xs">
            ← Return to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="page-container--form text-center flex-col">
        <div className="empty-state max-w-md">
          <h2 className="empty-state__title">Event Not Found</h2>
          <p className="empty-state__body">
            This event does not exist or may have been unlisted by the organizer.
          </p>
          <Link to="/events" className="navbar__btn text-xs">
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  const event = currentEvent;
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const startTime = new Date(event.startTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = event.endTime
    ? new Date(event.endTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const isSoldOut = event.ticketTypes.every(
    (t) => t.total - t.sold - t.held <= 0
  );
  const isCancelled = event.status === "CANCELLED";
  const isCompleted = event.status === "COMPLETED";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = new Date(event.date) < today;
  const canPurchase = !isSoldOut && !isCancelled && !isCompleted && !isPast;

  const minPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const maxPrice = Math.max(...event.ticketTypes.map((t) => t.price));
  const priceDisplay =
    minPrice === maxPrice
      ? `Rs. ${minPrice}`
      : `Rs. ${minPrice} – Rs. ${maxPrice}`;

  return (
    <div className="page-container">
      {/* Navigation breadcrumb & back button */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/events" className="back-link !mb-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to all events
        </Link>
        <span className="text-xs text-text-muted">
          Event ID: <span className="font-mono">{event.id.slice(0, 8)}</span>
        </span>
      </div>

      {/* Main Grid: Content + Ticket Sticky Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Event Media & Details */}
        <div className="space-y-8">
          {/* Banner Media */}
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm bg-surface-secondary aspect-[16/9] sm:aspect-[2/1]">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100">
                <svg
                  className="h-16 w-16 text-text-muted/30"
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
              </div>
            )}
            {/* Status chip overlay if not regular */}
            {(isCancelled || isCompleted || isPast) && (
              <div className="absolute top-4 left-4">
                <span className={`status-pill ${isCancelled ? "status-pill--CANCELLED" : "status-pill--DRAFT"}`}>
                  {isCancelled ? "Cancelled" : isPast ? "Past Event" : "Completed"}
                </span>
              </div>
            )}
          </div>

          {/* Title & Metadata Header */}
          <div className="border-b border-border pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="event-card__category bg-accent-light text-accent px-2.5 py-0.5 rounded-full">
                {event.category.name}
              </span>
              <span className="text-xs text-text-faint">•</span>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {event.seatingType === "BLOCK" ? "Assigned Seating" : "General Admission"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight mb-4">
              {event.title}
            </h1>

            {/* Organizer row */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
                {event.organizer.orgName.slice(0, 2)}
              </div>
              <div>
                <p className="text-xs text-text-muted">Organized by</p>
                <p className="text-sm font-bold text-text-primary">
                  {event.organizer.orgName}
                </p>
              </div>
            </div>
          </div>

          {/* Key Details Cards (Date & Time, Venue) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date card */}
            <div className="card card--padded flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-faint mb-1">Date & Time</h4>
                <p className="text-sm font-semibold text-text-primary">{eventDate}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {startTime} {endTime ? `– ${endTime}` : ""}
                </p>
              </div>
            </div>

            {/* Venue card */}
            {event.venue && (
              <div className="card card--padded flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-faint mb-1">Location</h4>
                  <p className="text-sm font-semibold text-text-primary truncate">{event.venue.name}</p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">
                    {event.venue.address}, {event.venue.district}
                  </p>
                  {event.venue.googleMaps && (
                    <a
                      href={event.venue.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline mt-1.5"
                    >
                      Open in Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Event Description Card */}
          <div className="card card--padded">
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <span>About this Event</span>
            </h3>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line font-normal space-y-3">
              {event.description}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Ticket Box */}
        <div className="lg:sticky lg:top-20 h-fit space-y-4">
          <div className="card card--padded border-2 border-border shadow-md bg-surface">
            <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-border">
              <div>
                <span className="text-xs text-text-muted font-medium">Tickets starting from</span>
                <div className="text-2xl font-extrabold text-text-primary tracking-tight tabular-nums">
                  {priceDisplay}
                </div>
              </div>
              <span className={`status-pill ${canPurchase ? "status-pill--PUBLISHED" : "status-pill--CANCELLED"}`}>
                {canPurchase ? "Available" : isSoldOut ? "Sold Out" : "Unavailable"}
              </span>
            </div>

            {/* Status alerts if any */}
            {(isCancelled || isCompleted || isPast) && (
              <div className="mb-4 rounded-lg bg-warning-bg border border-warning-border p-3 text-xs font-medium text-warning">
                {isCancelled
                  ? "This event has been cancelled by the organizer."
                  : "This event has concluded."}
              </div>
            )}

            {/* Available Ticket Types list */}
            <div className="space-y-2.5 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-text-faint mb-2">
                Available Tiers
              </div>
              {event.ticketTypes.map((ticket) => {
                const available = ticket.total - ticket.sold - ticket.held;
                const soldOut = available <= 0;

                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary border border-border"
                  >
                    <div>
                      <div className="text-xs font-bold text-text-primary">{ticket.name}</div>
                      <div className={`text-[11px] font-medium ${soldOut ? "text-danger" : "text-text-muted"}`}>
                        {soldOut ? "Sold out" : `${available} tickets remaining`}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-text-primary tabular-nums">
                      Rs. {ticket.price}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Action Button */}
            <button
              id="buy-tickets-btn"
              onClick={handleOpenBuyModal}
              disabled={!canPurchase}
              className="w-full py-3.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
              {isSoldOut
                ? "Sold Out"
                : isCancelled
                ? "Event Cancelled"
                : isCompleted || isPast
                ? "Event Concluded"
                : "Select Tickets"}
            </button>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-4 text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <span>🔒</span> Safe & Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>📱</span> Digital Entry Pass
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Purchase / Booking Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                {modalStep === "summary" && (
                  <button
                    onClick={() => {
                      setModalStep("select");
                      clearError();
                    }}
                    disabled={isHolding || isInitiatingPayment}
                    aria-label="Back to ticket selection"
                    className="p-1 rounded-lg text-text-muted hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                )}
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {modalStep === "select"
                      ? "Select Your Tickets"
                      : modalStep === "summary"
                      ? "Review & Confirm Order"
                      : "Connecting to Payment Gateway"}
                  </h3>
                  <p className="text-xs text-text-muted truncate max-w-[280px]">
                    {event.title}
                  </p>
                </div>
              </div>

              {modalStep !== "paying" && (
                <button
                  onClick={closeModal}
                  disabled={isHolding || isInitiatingPayment}
                  aria-label="Close modal"
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-secondary hover:text-text-primary disabled:opacity-40 cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Step 1: Select Quantities */}
            {modalStep === "select" && (
              <div>
                <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                  {event.ticketTypes.map((ticket) => {
                    const available = ticket.total - ticket.sold - ticket.held;
                    const soldOut = available <= 0;
                    const qty = quantities[ticket.id] ?? 0;
                    const maxQty = Math.min(available, 10);

                    return (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-secondary"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-text-primary truncate">
                            {ticket.name}
                          </p>
                          <p className="text-xs font-bold text-accent tabular-nums mt-0.5">
                            Rs. {ticket.price}
                          </p>
                          <p className={`text-[11px] font-medium mt-0.5 ${soldOut ? "text-danger" : "text-text-muted"}`}>
                            {soldOut ? "Sold out" : `${available} remaining`}
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        {!soldOut ? (
                          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
                            <button
                              type="button"
                              id={`qty-dec-${ticket.id}`}
                              onClick={() => setQty(ticket.id, Math.max(0, qty - 1))}
                              disabled={qty === 0}
                              aria-label={`Decrease ${ticket.name} quantity`}
                              className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-text-primary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-xs font-bold tabular-nums text-text-primary">
                              {qty}
                            </span>
                            <button
                              type="button"
                              id={`qty-inc-${ticket.id}`}
                              onClick={() => setQty(ticket.id, Math.min(maxQty, qty + 1))}
                              disabled={qty >= maxQty}
                              aria-label={`Increase ${ticket.name} quantity`}
                              className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-text-primary hover:bg-surface-secondary disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-danger bg-danger-bg px-2.5 py-1 rounded">
                            Sold Out
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {localError && (
                  <div className="mt-3 p-2.5 rounded-lg bg-danger-bg border border-danger-border text-xs font-medium text-danger">
                    {localError}
                  </div>
                )}

                {/* Subtotal bar */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-muted">Total Selection</span>
                    <p className="text-xs font-semibold text-text-secondary">
                      {selectedItems.reduce((s, i) => s + i.quantity, 0)} ticket
                      {selectedItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-muted">Grand Total</span>
                    <p className="text-xl font-extrabold text-text-primary tabular-nums">
                      Rs. {grandTotal}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    id="proceed-checkout-btn"
                    onClick={handleProceedToConfirm}
                    disabled={selectedItems.length === 0}
                    className="w-full py-3.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Proceed to Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Order Summary */}
            {modalStep === "summary" && (
              <div>
                <div className="space-y-3 p-4 rounded-xl bg-surface-secondary border border-border">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-faint mb-2">
                    Order Items
                  </div>
                  {selectedItems.map(({ ticketType, quantity }) => (
                    <div key={ticketType.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{ticketType.name}</span>
                        <span className="text-xs font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">
                          × {quantity}
                        </span>
                      </div>
                      <span className="font-bold tabular-nums text-text-primary">
                        Rs. {ticketType.price * quantity}
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-border pt-3 mt-3 flex items-center justify-between">
                    <span className="font-bold text-text-primary">Total Amount Due</span>
                    <span className="text-lg font-extrabold tabular-nums text-accent">
                      Rs. {grandTotal}
                    </span>
                  </div>
                </div>

                {ticketError && (
                  <div className="mt-3 p-3 rounded-lg bg-danger-bg border border-danger-border text-xs font-medium text-danger">
                    {ticketError}
                  </div>
                )}

                <div className="mt-6 space-y-2.5">
                  <button
                    id="confirm-pay-esewa-btn"
                    onClick={handleConfirmPurchase}
                    disabled={isHolding || isInitiatingPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#60bb46] hover:bg-[#52a13b] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isHolding || isInitiatingPayment ? (
                      <>
                        <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                        <span>{isHolding ? "Holding reservation..." : "Redirecting to eSewa..."}</span>
                      </>
                    ) : (
                      <>
                        <span>Pay with eSewa</span>
                        <span className="text-xs font-normal opacity-90">(Rs. {grandTotal})</span>
                      </>
                    )}
                  </button>

                  <button
                    id="back-to-tickets-btn"
                    onClick={() => {
                      setModalStep("select");
                      clearError();
                    }}
                    disabled={isHolding || isInitiatingPayment}
                    className="w-full py-2.5 px-4 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors cursor-pointer"
                  >
                    ← Edit Selection
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Paying / Redirecting */}
            {modalStep === "paying" && (
              <div className="py-12 text-center">
                <Spinner label="Transferring to eSewa secure payment gateway..." />
                <p className="mt-3 text-xs text-text-muted">
                  Please hold on. Do not close or refresh this tab while your order is registered.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}