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
  const { holdOrder, initiatePayment, isHolding, isInitiatingPayment, error: ticketError, clearError } = useTicketStore();
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
      currentEvent.ticketTypes.forEach((t) => { initial[t.id] = 0; });
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

  const selectedItems = currentEvent?.ticketTypes
    .filter((t) => (quantities[t.id] ?? 0) > 0)
    .map((t) => ({ ticketType: t, quantity: quantities[t.id] })) ?? [];

  const grandTotal = selectedItems.reduce(
    (sum, { ticketType, quantity }) => sum + ticketType.price * quantity,
    0
  );

  const handleProceedToConfirm = () => {
    if (!user) {
      closeModal();
      navigate("/login");
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

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center py-24">
        <p className="mb-4 text-sm">{error}</p>
        <Link
          to="/events"
          className="text-[13px] font-medium underline underline-offset-4 transition-colors"
        >
          ← Back to events
        </Link>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <p className="py-24 text-center text-sm">
        Event not found
      </p>
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      {/* Back link */}
      <Link
        to="/events"
        className="mb-8 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-text-primary"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to events
      </Link>

      {/* Two-column layout: main content + sidebar */}
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Main content */}
        <div>
          {/* Banner */}
          {event.bannerUrl ? (
            <div className="mb-8 overflow-hidden rounded-lg border border-border">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="h-56 w-full object-cover sm:h-72"
              />
            </div>
          ) : (
            <div className="mb-8 flex h-44 items-center justify-center rounded-lg border border-border bg-surface-secondary">
              <svg
                className="h-12 w-12/20"
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

          {/* Header */}
          <div className="mb-8">
            <span className="mb-3 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
              {event.category.name}
            </span>
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
            <p className="text-[13px] text-text-secondary">
              Organized by{" "}
              <span className="font-medium text-text-primary">
                {event.organizer.orgName}
              </span>
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 border-t border-border pt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              About this event
            </h2>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">
              {event.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Date & Time card */}
          <div className="rounded-lg border border-border p-5">
            <div className="mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider">
                Date & Time
              </h3>
            </div>
            <p className="text-[14px] font-medium">
              {eventDate}
            </p>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              {startTime}
              {endTime ? ` – ${endTime}` : ""}
            </p>
          </div>

          {/* Venue card */}
          {event.venue && (
            <div className="rounded-lg border border-border p-5">
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.5 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider">
                  Venue
                </h3>
              </div>
              <p className="text-[14px] font-medium">
                {event.venue.name}
              </p>
              <p className="mt-0.5 text-[13px] text-text-secondary">
                {event.venue.address}, {event.venue.district}
              </p>
              {event.venue.googleMaps && (
                <a
                  href={event.venue.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[12px] font-medium underline underline-offset-2 transition-colors"
                >
                  View on Maps →
                </a>
              )}
            </div>
          )}

          {/* ── TICKETS PANEL (Wireframe 1) ── */}
          <div className="rounded-lg border border-border p-5">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-primary">
              Tickets
            </h3>

            {(isCancelled || isCompleted || isPast) && (
              <p className="mb-4 rounded-md bg-primary-50 px-3 py-2 text-[12px] font-medium text-text-secondary">
                {isCancelled ? "This event has been cancelled." : "This event has ended."}
              </p>
            )}

            <div className="space-y-3">
              {event.ticketTypes.map((ticket) => {
                const available = ticket.total - ticket.sold - ticket.held;
                const soldOut = available <= 0;

                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-md border border-border bg-surface-secondary px-4 py-3.5 transition-colors"
                  >
                    <div className="flex items-baseline gap-2.5 min-w-0">
                      <span className="truncate text-[14px] font-semibold text-text-primary">
                        {ticket.name}
                      </span>
                      <span
                        className={`shrink-0 text-[12px] font-medium ${
                          soldOut ? "text-red-500 font-semibold" : "text-text-muted"
                        }`}
                      >
                        {soldOut ? "Sold out" : `${available} left`}
                      </span>
                    </div>
                    <span className="shrink-0 text-[15px] font-bold tabular-nums text-text-primary">
                      Rs.{ticket.price}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <button
                id="buy-tickets-btn"
                onClick={handleOpenBuyModal}
                disabled={!canPurchase}
                className="w-full rounded-md bg-primary py-2.5 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSoldOut
                  ? "Sold Out"
                  : isCancelled
                  ? "Event Cancelled"
                  : isCompleted || isPast
                  ? "Event Ended"
                  : "Buy Tickets"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {modalStep === "summary" && (
                  <button
                    onClick={() => {
                      setModalStep("select");
                      clearError();
                    }}
                    disabled={isHolding || isInitiatingPayment}
                    aria-label="Back to ticket selection"
                    className="mr-1 rounded-md p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-40"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                )}
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-primary">
                  {modalStep === "select"
                    ? "Purchase Tickets"
                    : modalStep === "summary"
                    ? "Order Summary"
                    : "Processing Payment"}
                </h3>
              </div>

              {modalStep !== "paying" && (
                <button
                  onClick={closeModal}
                  disabled={isHolding || isInitiatingPayment}
                  aria-label="Close modal"
                  className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Modal Body: STEP 1 - Select Tickets (Wireframe 2) */}
            {modalStep === "select" && (
              <div>
                <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-0.5">
                  {event.ticketTypes.map((ticket) => {
                    const available = ticket.total - ticket.sold - ticket.held;
                    const soldOut = available <= 0;
                    const qty = quantities[ticket.id] ?? 0;
                    const maxQty = Math.min(available, 10);

                    return (
                      <div
                        key={ticket.id}
                        className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3.5"
                      >
                        {/* Left: Name and Remaining */}
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-text-primary">
                            {ticket.name}
                          </p>
                          <p
                            className={`mt-0.5 text-[12px] font-medium ${
                              soldOut ? "text-red-500 font-semibold" : "text-text-muted"
                            }`}
                          >
                            {soldOut ? "Sold out" : `${available} left`}
                          </p>
                        </div>

                        {/* Center: Stepper [ − ] 0 [ + ] */}
                        <div className="flex items-center justify-center gap-2.5">
                          {!soldOut ? (
                            <>
                              <button
                                type="button"
                                id={`qty-dec-${ticket.id}`}
                                onClick={() => setQty(ticket.id, Math.max(0, qty - 1))}
                                disabled={qty === 0}
                                aria-label={`Decrease ${ticket.name} quantity`}
                                className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-[15px] font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-[13px] font-semibold tabular-nums text-text-primary">
                                {qty}
                              </span>
                              <button
                                type="button"
                                id={`qty-inc-${ticket.id}`}
                                onClick={() => setQty(ticket.id, Math.min(maxQty, qty + 1))}
                                disabled={qty >= maxQty}
                                aria-label={`Increase ${ticket.name} quantity`}
                                className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-[15px] font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </>
                          ) : (
                            <span className="text-[12px] font-medium text-text-muted">—</span>
                          )}
                        </div>

                        {/* Right: Price */}
                        <div className="text-right">
                          <span className="text-[15px] font-bold tabular-nums text-text-primary">
                            Rs.{ticket.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {localError && (
                  <p className="mt-3 text-[12px] font-medium text-red-500">{localError}</p>
                )}

                {selectedItems.length > 0 && (
                  <div className="mt-4 flex items-center justify-between pt-1">
                    <span className="text-[13px] text-text-secondary">
                      {selectedItems.reduce((s, i) => s + i.quantity, 0)} ticket
                      {selectedItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""} selected
                    </span>
                    <span className="text-[14px] font-bold tabular-nums text-text-primary">
                      Rs. {grandTotal}
                    </span>
                  </div>
                )}

                {/* Divider Line */}
                <div className="my-4 border-t border-border" />

                <div>
                  <button
                    id="proceed-checkout-btn"
                    onClick={handleProceedToConfirm}
                    className="w-full rounded-md bg-primary py-2.5 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-light"
                  >
                    Proceed To Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: STEP 2 - Order Summary (Wireframe 3) */}
            {modalStep === "summary" && (
              <div>
                <div className="space-y-3 py-1">
                  {selectedItems.map(({ ticketType, quantity }) => (
                    <div key={ticketType.id} className="flex items-center justify-between text-[14px]">
                      <span className="text-text-primary">
                        {ticketType.name}{" "}
                        <span className="text-text-muted">x  {quantity}</span>
                      </span>
                      <span className="font-medium tabular-nums text-text-primary">
                        Rs.{ticketType.price * quantity}
                      </span>
                    </div>
                  ))}

                  <div className="my-3 border-t border-border" />

                  <div className="flex items-center justify-between text-[15px] font-bold">
                    <span className="text-text-primary">Total</span>
                    <span className="tabular-nums text-text-primary">Rs. {grandTotal}</span>
                  </div>
                </div>

                {ticketError && (
                  <p className="mt-3 text-[12px] font-medium text-red-500">{ticketError}</p>
                )}

                <div className="mt-6 space-y-2">
                  <button
                    id="confirm-pay-esewa-btn"
                    onClick={handleConfirmPurchase}
                    disabled={isHolding || isInitiatingPayment}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isHolding || isInitiatingPayment ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {isHolding ? "Reserving tickets…" : "Opening eSewa…"}
                      </>
                    ) : (
                      "Pay with eSewa"
                    )}
                  </button>
                  <button
                    id="back-to-tickets-btn"
                    onClick={() => {
                      setModalStep("select");
                      clearError();
                    }}
                    disabled={isHolding || isInitiatingPayment}
                    className="w-full rounded-md border border-border py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: STEP 3 - Paying / Redirecting */}
            {modalStep === "paying" && (
              <div className="py-8 text-center">
                <Spinner />
                <p className="mt-4 text-[14px] font-medium text-text-primary">
                  Redirecting to eSewa…
                </p>
                <p className="mt-1 text-[12px] text-text-muted">
                  Please do not close or refresh this page.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}