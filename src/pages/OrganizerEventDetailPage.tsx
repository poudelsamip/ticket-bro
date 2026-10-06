import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useOrganizerStore } from "@/stores/organizer.store";
import { useAuthStore } from "@/stores/auth.store";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  PUBLISHED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  COMPLETED: "bg-blue-50 text-blue-700",
};

interface ScanStat {
  id: string;
  scanned: number;
}

export default function OrganizerEventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isInitialized } = useAuthStore();
  const { currentEvent, isLoading, error, fetchOrgEventBySlug } =
    useOrganizerStore();

  const [scanStats, setScanStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isInitialized && user?.role === "ORGANIZER" && slug) {
      void fetchOrgEventBySlug(slug);
    }
  }, [isInitialized, user, slug, fetchOrgEventBySlug]);

  // Fetch scan stats once we have the event id
  useEffect(() => {
    if (!currentEvent?.id) return;
    api
      .get<ApiResponse<{ ticketTypes: ScanStat[] }>>(
        `/organizer/events/${currentEvent.id}/scan-stats`,
      )
      .then(({ data }) => {
        const map: Record<string, number> = {};
        data.data.ticketTypes.forEach((tt) => {
          map[tt.id] = tt.scanned;
        });
        setScanStats(map);
      })
      .catch(() => {
        /* non-critical */
      });
  }, [currentEvent?.id]);

  if (!isInitialized || isLoading) return <Spinner />;

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

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="mb-4 text-[14px] text-red-500">{error}</p>
        <Link
          to="/organizer/events"
          className="text-[13px] font-medium underline underline-offset-4"
        >
          ← Back to my events
        </Link>
      </div>
    );
  }

  if (!currentEvent) return null;

  const ev = currentEvent;
  const totalTickets = ev.ticketTypes.reduce((s, t) => s + t.total, 0);
  const totalSold = ev.ticketTypes.reduce((s, t) => s + t.sold, 0);
  const totalScanned = ev.ticketTypes.reduce(
    (s, t) => s + (scanStats[t.id] ?? 0),
    0,
  );
  const totalRevenue = ev.ticketTypes.reduce(
    (s, t) => s + t.price * t.sold,
    0,
  );

  const formattedStartTime = ev.startTime
    ? new Date(ev.startTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const formattedEndTime = ev.endTime
    ? new Date(ev.endTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      {/* Back link */}
      <Link
        to="/organizer/events"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary"
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
        My Events
      </Link>

      {/* Banner */}
      {ev.bannerUrl && (
        <img
          src={ev.bannerUrl}
          alt={ev.title}
          className="mb-6 h-48 w-full rounded-xl object-cover"
        />
      )}

      {/* Title + Status */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ev.title}</h1>
          <p className="mt-1 text-[13px] text-text-muted">
            {ev.category.name} {'·'}{" "}
            {ev.seatingType === "GENERAL"
              ? "General Admission"
              : "Block Seating"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-semibold ${STATUS_STYLES[ev.status] ?? ""}`}
          >
            {ev.status}
          </span>
          <Link
            to={`/organizer/events/${ev.slug}/edit`}
            id="edit-event-btn"
            className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-text-primary hover:text-text-primary"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Key Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-secondary p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Date
          </p>
          <p className="mt-1 text-[14px] font-medium">
            {new Date(ev.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {formattedStartTime && (
            <p className="mt-1 text-[13px] text-text-muted">
              {formattedStartTime}
              {formattedEndTime ? ` – ${formattedEndTime}` : ""}
            </p>
          )}
        </div>

        {ev.venue && (
          <div className="rounded-lg border border-border bg-surface-secondary p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Venue
            </p>
            <p className="mt-1 text-[14px] font-medium">{ev.venue.name}</p>
            <p className="text-[12px] text-text-muted">
              {ev.venue.address}, {ev.venue.district}
            </p>
            {ev.venue.googleMaps && (
              <a
                href={ev.venue.googleMaps}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[12px] underline underline-offset-4"
              >
                View on Maps →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Sales + Check-in Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-surface-secondary p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Capacity
          </p>
          <p className="mt-1 text-xl font-bold">{totalTickets}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-secondary p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Sold
          </p>
          <p className="mt-1 text-xl font-bold">{totalSold}</p>
        </div>
        <div className="rounded-lg border border-border bg-green-50 p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-green-600">
            Scanned
          </p>
          <p className="mt-1 text-xl font-bold text-green-700">
            {totalScanned}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-secondary p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Revenue
          </p>
          <p className="mt-1 text-xl font-bold">
            NPR {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Ticket Types */}
      <div className="mb-6">
        <h2 className="mb-3 text-[15px] font-semibold">Ticket Types</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-left">
                <th className="px-4 py-3 font-semibold text-text-secondary">
                  Name
                </th>
                <th className="px-4 py-3 font-semibold text-text-secondary">
                  Price
                </th>
                <th className="px-4 py-3 font-semibold text-text-secondary">
                  Total
                </th>
                <th className="px-4 py-3 font-semibold text-text-secondary">
                  Sold
                </th>
                <th className="px-4 py-3 font-semibold text-green-700">
                  Scanned
                </th>
                <th className="px-4 py-3 font-semibold text-text-secondary">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody>
              {ev.ticketTypes.map((tt) => (
                <tr
                  key={tt.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{tt.name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    NPR {tt.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{tt.total}</td>
                  <td className="px-4 py-3 text-text-secondary">{tt.sold}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    {scanStats[tt.id] ?? 0}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {tt.total - tt.sold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Description */}
      {ev.description && (
        <div>
          <h2 className="mb-2 text-[15px] font-semibold">Description</h2>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">
            {ev.description}
          </p>
        </div>
      )}
    </div>
  );
}
