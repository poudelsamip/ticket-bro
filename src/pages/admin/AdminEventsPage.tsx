import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ApiResponse, Pagination } from "@/types";
import AdminLayout from "./AdminLayout";

type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  date: string;
  seatingType: string;
  organizer: { id: string; orgName: string; user: { email: string } };
  category: { name: string };
  venue: { name: string; district: string } | null;
  ticketsSold: number;
  totalOrders: number;
  totalCapacity: number;
  revenue: number;
}

const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: "admin-badge--gray",
  PUBLISHED: "admin-badge--green",
  CANCELLED: "admin-badge--red",
  COMPLETED: "admin-badge--blue",
};

const STATUS_OPTIONS: EventStatus[] = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtMoney(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStatuses, setNewStatuses] = useState<Record<string, EventStatus>>({});

  const fetchEvents = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    api
      .get<ApiResponse<{ events: AdminEvent[]; pagination: Pagination }>>(
        `/admin/events?${params}`
      )
      .then((r) => {
        setEvents(r.data.data.events);
        setPagination(r.data.data.pagination);
      })
      .catch(() => setError("Failed to load events."))
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleStatusUpdate = async (eventId: string) => {
    const newStatus = newStatuses[eventId];
    if (!newStatus) return;
    setUpdatingId(eventId);
    try {
      await api.patch(`/admin/events/${eventId}/status`, { status: newStatus });
      fetchEvents();
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
      setNewStatuses((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Events</h1>
        <p className="admin-page-sub">Manage all platform events</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-filters__search">
          <input
            type="text"
            placeholder="Search by title or organizer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input"
            id="events-search"
          />
          <button type="submit" className="admin-btn admin-btn--primary">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </form>

        <select
          id="events-status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="admin-select"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Tickets</th>
                  <th>Revenue</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr>
                    <td colSpan={7} className="admin-table__empty">
                      No events found.
                    </td>
                  </tr>
                )}
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div className="admin-table__main-cell">
                        <p className="admin-table__title">{ev.title}</p>
                        <p className="admin-table__sub">
                          {ev.category.name}
                          {ev.venue ? ` · ${ev.venue.district}` : ""}
                        </p>
                      </div>
                    </td>
                    <td>
                      <p>{ev.organizer.orgName}</p>
                      <p className="admin-table__sub">{ev.organizer.user.email}</p>
                    </td>
                    <td>{fmtDate(ev.date)}</td>
                    <td>
                      <span className={`admin-badge ${STATUS_COLORS[ev.status]}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td>
                      <p>
                        {ev.ticketsSold} / {ev.totalCapacity}
                      </p>
                      <p className="admin-table__sub">{ev.totalOrders} orders</p>
                    </td>
                    <td>{fmtMoney(ev.revenue)}</td>
                    <td>
                      <div className="admin-table__action-cell">
                        <select
                          className="admin-select admin-select--sm"
                          value={newStatuses[ev.id] ?? ev.status}
                          onChange={(e) =>
                            setNewStatuses((prev) => ({
                              ...prev,
                              [ev.id]: e.target.value as EventStatus,
                            }))
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          disabled={
                            updatingId === ev.id ||
                            (newStatuses[ev.id] ?? ev.status) === ev.status
                          }
                          onClick={() => void handleStatusUpdate(ev.id)}
                        >
                          {updatingId === ev.id ? "..." : "Apply"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="admin-btn admin-btn--ghost"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="admin-pagination__info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="admin-btn admin-btn--ghost"
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
