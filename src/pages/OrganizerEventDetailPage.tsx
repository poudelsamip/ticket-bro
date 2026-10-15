import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useOrganizerStore } from "@/stores/organizer.store";
import { useAuthStore } from "@/stores/auth.store";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";

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

  if (!isInitialized || isLoading) return <Spinner label="Loading event analytics..." />;

  if (!user || user.role !== "ORGANIZER") {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <h2 className="empty-state__title">Organizer Access Only</h2>
          <p className="empty-state__body">Please sign in with your organizer account.</p>
          <Link to="/login" className="navbar__btn text-xs">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <p className="text-danger text-sm font-semibold mb-3">{error}</p>
          <Link to="/organizer/events" className="navbar__btn text-xs">
            ← Return to My Events
          </Link>
        </div>
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
    <div className="page-container">
      {/* Back button */}
      <Link to="/organizer/events" className="back-link">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to my events
      </Link>

      {/* Header bar */}
      <div className="card card--padded bg-surface border-border shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`status-pill status-pill--${ev.status} text-[10px]`}>
                {ev.status}
              </span>
              <span className="text-xs text-text-faint">•</span>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                {ev.category.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              {ev.title}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Seating configuration: <span className="font-semibold text-text-secondary">{ev.seatingType === "GENERAL" ? "General Admission" : "Reserved Blocks"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={`/events/${ev.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors"
            >
              Public Page ↗
            </Link>
            <Link
              to={`/organizer/events/${ev.slug}/edit`}
              id="edit-event-btn"
              className="navbar__btn navbar__btn--accent text-xs font-bold uppercase tracking-wider py-2.5 px-4"
            >
              Edit Details
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-block shadow-xs">
          <div className="stat-block__label">Total Capacity</div>
          <div className="stat-block__value">{totalTickets}</div>
        </div>

        <div className="stat-block shadow-xs">
          <div className="stat-block__label">Passes Sold</div>
          <div className="stat-block__value">{totalSold}</div>
          <span className="text-[11px] text-text-muted font-medium mt-1 inline-block">
            {totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0}% booked
          </span>
        </div>

        <div className="stat-block stat-block--success shadow-xs">
          <div className="stat-block__label">Gate Check-Ins</div>
          <div className="stat-block__value">{totalScanned}</div>
          <span className="text-[11px] text-success font-medium mt-1 inline-block">
            {totalSold > 0 ? Math.round((totalScanned / totalSold) * 100) : 0}% attendance
          </span>
        </div>

        <div className="stat-block shadow-xs">
          <div className="stat-block__label">Gross Revenue</div>
          <div className="stat-block__value text-xl font-extrabold text-accent">
            NPR {totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Event Details + Venue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="card card--padded bg-surface">
          <div className="text-xs font-bold uppercase tracking-wider text-text-faint mb-3">
            Schedule Info
          </div>
          <p className="text-sm font-semibold text-text-primary">
            {new Date(ev.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {formattedStartTime && (
            <p className="text-xs text-text-muted mt-1">
              Starts at {formattedStartTime} {formattedEndTime ? `(until ${formattedEndTime})` : ""}
            </p>
          )}
        </div>

        {ev.venue && (
          <div className="card card--padded bg-surface">
            <div className="text-xs font-bold uppercase tracking-wider text-text-faint mb-3">
              Venue & Coordinates
            </div>
            <p className="text-sm font-semibold text-text-primary">{ev.venue.name}</p>
            <p className="text-xs text-text-muted mt-1">
              {ev.venue.address}, {ev.venue.district}
            </p>
            {ev.venue.googleMaps && (
              <a
                href={ev.venue.googleMaps}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline mt-2"
              >
                View on Google Maps ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Ticket Tiers Breakdown Table */}
      <div className="card overflow-hidden border-border bg-surface shadow-xs mb-8">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">Ticket Tiers & Gate Scans</h2>
          <span className="text-xs text-text-muted">{ev.ticketTypes.length} configured tiers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tier Name</th>
                <th>Unit Price</th>
                <th>Allocated</th>
                <th>Sold</th>
                <th>Gate Scanned</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {ev.ticketTypes.map((tt) => (
                <tr key={tt.id}>
                  <td className="font-bold text-text-primary">{tt.name}</td>
                  <td className="font-semibold text-text-secondary tabular-nums">
                    NPR {tt.price.toLocaleString()}
                  </td>
                  <td className="tabular-nums">{tt.total}</td>
                  <td className="tabular-nums font-semibold text-text-primary">{tt.sold}</td>
                  <td className="tabular-nums font-bold text-success">
                    {scanStats[tt.id] ?? 0}
                  </td>
                  <td className="tabular-nums font-semibold text-text-muted">
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
        <div className="card card--padded bg-surface">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-faint mb-3">
            Description
          </h3>
          <p className="text-xs leading-relaxed text-text-secondary whitespace-pre-line">
            {ev.description}
          </p>
        </div>
      )}
    </div>
  );
}
