import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ApiResponse, Pagination } from "@/types";
import AdminLayout from "./AdminLayout";

/* --------------------------- Types --------------------------- */

type PaymentStatus = "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED" | "NEED_REFUND";
type Tab = "individual" | "by-event" | "by-organizer";

interface AdminPayment {
  id: string;
  provider: "ESEWA" | "KHALTI";
  transactionId: string | null;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  order: {
    id: string;
    total: number;
    status: string;
    user: { id: string; email: string; fullName: string | null };
    event: { id: string; title: string; slug: string };
  };
}

interface EventPaymentSummary {
  eventId: string;
  title: string;
  slug: string;
  status: string;
  date: string;
  organizer: { id: string; orgName: string; email: string };
  totalCollected: number;
  totalRefunded: number;
  pendingRefunds: number;
  failed: number;
  successCount: number;
  ticketsSold: number;
}

interface OrganizerPaymentSummary {
  organizerId: string;
  orgName: string;
  email: string;
  totalEvents: number;
  totalCollected: number;
  totalRefunded: number;
  pendingRefundsAmount: number;
  pendingRefundCount: number;
  successCount: number;
  totalOwed: number;
}

/* --------------------------- Constants --------------------------- */

const STATUS_COLORS: Record<PaymentStatus, string> = {
  INITIATED: "admin-badge--gray",
  SUCCESS: "admin-badge--green",
  FAILED: "admin-badge--red",
  REFUNDED: "admin-badge--blue",
  NEED_REFUND: "admin-badge--amber",
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "admin-badge--gray",
  PUBLISHED: "admin-badge--green",
  CANCELLED: "admin-badge--red",
  COMPLETED: "admin-badge--blue",
};

const STATUS_OPTIONS: PaymentStatus[] = [
  "INITIATED",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "NEED_REFUND",
];

/* --------------------------- Helpers --------------------------- */

function fmtDate(s: string) {
  return new Date(s).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDateShort(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtMoney(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}

/* --------------------------- StatPill --------------------------- */

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "green" | "red" | "amber" | "blue" | "default";
}) {
  const colorMap: Record<string, string> = {
    green: "var(--admin-success)",
    red: "var(--admin-danger)",
    amber: "var(--admin-warning)",
    blue: "var(--admin-info)",
    default: "var(--admin-text-muted)",
  };
  const color = colorMap[accent ?? "default"];
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        padding: "4px 10px",
        background: "var(--admin-surface-2)",
        borderRadius: "8px",
        minWidth: "70px",
      }}
    >
      <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: "14px", fontWeight: 700, color }}>{value}</span>
    </span>
  );
}

/* --------------------------- Tab: Individual --------------------------- */

function IndividualTab() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    api
      .get<ApiResponse<{ payments: AdminPayment[]; pagination: Pagination }>>(
        `/admin/payments?${params}`
      )
      .then((r) => {
        setPayments(r.data.data.payments);
        setPagination(r.data.data.pagination);
      })
      .catch(() => setError("Failed to load payments."))
      .finally(() => setLoading(false));
  }, [page, statusFilter, search]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <>
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-filters__search">
          <input
            type="text"
            id="payments-search"
            placeholder="Search by txn ID or user email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="admin-btn admin-btn--primary">Search</button>
          {search && (
            <button type="button" className="admin-btn admin-btn--ghost"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
              Clear
            </button>
          )}
        </form>
        <select
          id="payments-status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="admin-select"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <div className="admin-loading"><div className="admin-spinner" /></div>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Amount</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr><td colSpan={7} className="admin-table__empty">No payments found.</td></tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="admin-table__title admin-monospace">{p.transactionId ?? "-"}</p>
                      <p className="admin-table__sub">Order: {p.order.id.slice(0, 8)}...</p>
                    </td>
                    <td>
                      <p>{p.order.user.fullName ?? "-"}</p>
                      <p className="admin-table__sub">{p.order.user.email}</p>
                    </td>
                    <td>{p.order.event.title}</td>
                    <td className="admin-table__amount">{fmtMoney(p.amount)}</td>
                    <td><span className="admin-badge admin-badge--gray">{p.provider}</span></td>
                    <td><span className={`admin-badge ${STATUS_COLORS[p.status]}`}>{p.status}</span></td>
                    <td>{fmtDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-btn admin-btn--ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>? Prev</button>
              <span className="admin-pagination__info">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="admin-btn admin-btn--ghost" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next ?</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* --------------------------- Tab: By Event --------------------------- */

function ByEventTab() {
  const [events, setEvents] = useState<EventPaymentSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    api
      .get<ApiResponse<{ events: EventPaymentSummary[]; pagination: Pagination }>>(
        `/admin/payments/by-event?${params}`
      )
      .then((r) => { setEvents(r.data.data.events); setPagination(r.data.data.pagination); })
      .catch(() => setError("Failed to load event payment data."))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setSearch(searchInput); };

  return (
    <>
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-filters__search">
          <input
            type="text"
            id="payments-event-search"
            placeholder="Search by event title or organizer..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="admin-btn admin-btn--primary">Search</button>
          {search && (
            <button type="button" className="admin-btn admin-btn--ghost"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {loading && <div className="admin-loading"><div className="admin-spinner" /></div>}
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
                  <th>Tickets Sold</th>
                  <th>Payment Breakdown</th>
                  <th>Collected</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr><td colSpan={7} className="admin-table__empty">No events with payments found.</td></tr>
                )}
                {events.map((ev) => (
                  <tr key={ev.eventId}>
                    <td>
                      <p className="admin-table__title">{ev.title}</p>
                      <p className="admin-table__sub">{ev.slug}</p>
                    </td>
                    <td>
                      <p>{ev.organizer.orgName}</p>
                      <p className="admin-table__sub">{ev.organizer.email}</p>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmtDateShort(ev.date)}</td>
                    <td>
                      <span className={`admin-badge ${EVENT_STATUS_COLORS[ev.status] ?? "admin-badge--gray"}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{ev.ticketsSold}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <StatPill label="Success" value={ev.successCount} accent="green" />
                        {ev.pendingRefunds > 0 && <StatPill label="Refund?" value={ev.pendingRefunds} accent="amber" />}
                        {ev.totalRefunded > 0 && <StatPill label="Refunded" value={fmtMoney(ev.totalRefunded)} accent="blue" />}
                        {ev.failed > 0 && <StatPill label="Failed" value={ev.failed} accent="red" />}
                      </div>
                    </td>
                    <td className="admin-table__amount">{fmtMoney(ev.totalCollected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-btn admin-btn--ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>? Prev</button>
              <span className="admin-pagination__info">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="admin-btn admin-btn--ghost" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next ?</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* --------------------------- Tab: By Organizer --------------------------- */

function ByOrganizerTab() {
  const [organizers, setOrganizers] = useState<OrganizerPaymentSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    api
      .get<ApiResponse<{ organizers: OrganizerPaymentSummary[]; pagination: Pagination }>>(
        `/admin/payments/by-organizer?${params}`
      )
      .then((r) => { setOrganizers(r.data.data.organizers); setPagination(r.data.data.pagination); })
      .catch(() => setError("Failed to load organizer payment data."))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setSearch(searchInput); };

  return (
    <>
      <div className="admin-filters">
        <form onSubmit={handleSearch} className="admin-filters__search">
          <input
            type="text"
            id="payments-organizer-search"
            placeholder="Search by organizer name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="admin-btn admin-btn--primary">Search</button>
          {search && (
            <button type="button" className="admin-btn admin-btn--ghost"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {loading && <div className="admin-loading"><div className="admin-spinner" /></div>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Organizer</th>
                  <th>Events</th>
                  <th>Successful Txns</th>
                  <th>Total Collected</th>
                  <th>Refunded</th>
                  <th>Pending Refunds</th>
                  <th>Owed (Completed Events)</th>
                </tr>
              </thead>
              <tbody>
                {organizers.length === 0 && (
                  <tr><td colSpan={7} className="admin-table__empty">No organizers with payments found.</td></tr>
                )}
                {organizers.map((org) => (
                  <tr key={org.organizerId}>
                    <td>
                      <p className="admin-table__title">{org.orgName}</p>
                      <p className="admin-table__sub">{org.email}</p>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>{org.totalEvents}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="admin-badge admin-badge--green">{org.successCount}</span>
                    </td>
                    <td className="admin-table__amount">{fmtMoney(org.totalCollected)}</td>
                    <td>
                      {org.totalRefunded > 0
                        ? <span style={{ color: "var(--admin-info)", fontWeight: 600 }}>{fmtMoney(org.totalRefunded)}</span>
                        : <span className="admin-table__sub">-</span>}
                    </td>
                    <td>
                      {org.pendingRefundCount > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ color: "var(--admin-warning)", fontWeight: 700 }}>{fmtMoney(org.pendingRefundsAmount)}</span>
                          <span className="admin-table__sub">{org.pendingRefundCount} transaction{org.pendingRefundCount > 1 ? "s" : ""}</span>
                        </div>
                      ) : (
                        <span className="admin-badge admin-badge--green" style={{ fontSize: "11px" }}>None</span>
                      )}
                    </td>
                    <td>
                      {org.totalOwed > 0
                        ? <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--admin-accent)" }}>{fmtMoney(org.totalOwed)}</span>
                        : <span className="admin-table__sub">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-btn admin-btn--ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>? Prev</button>
              <span className="admin-pagination__info">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="admin-btn admin-btn--ghost" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next ?</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* --------------------------- Main Page --------------------------- */

const TAB_LABELS: { id: Tab; label: string; desc: string }[] = [
  { id: "individual", label: "Individual Transactions", desc: "Full transaction history across the platform" },
  { id: "by-event", label: "By Event", desc: "Payment breakdown per event - revenue, refunds & ticket sales" },
  { id: "by-organizer", label: "By Organizer", desc: "Payment summary per organizer - collected, refunded & owed" },
];

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<Tab>("individual");
  const current = TAB_LABELS.find((t) => t.id === tab)!;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Payments</h1>
        <p className="admin-page-sub">{current.desc}</p>
      </div>

      <div className="admin-tabs">
        {TAB_LABELS.map((t) => (
          <button
            key={t.id}
            id={`payments-tab-${t.id}`}
            className={`admin-tab ${tab === t.id ? "admin-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "individual" && <IndividualTab />}
      {tab === "by-event" && <ByEventTab />}
      {tab === "by-organizer" && <ByOrganizerTab />}
    </AdminLayout>
  );
}
