import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ApiResponse, Pagination } from "@/types";
import AdminLayout from "./AdminLayout";

interface PayoutOrganizer {
  organizerId: string;
  orgName: string;
  email: string;
  totalAmount: number;
  count: number;
}

interface PayoutPayment {
  id: string;
  amount: number;
  provider: "ESEWA" | "KHALTI";
  transactionId: string | null;
  createdAt: string;
  order: {
    id: string;
    user: { email: string; fullName: string | null };
    event: {
      id: string;
      title: string;
      slug: string;
      organizer: {
        id: string;
        orgName: string;
        contactEmail: string | null;
        user: { email: string };
      };
    };
  };
}

function fmtMoney(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminPayoutsPage() {
  const [tab, setTab] = useState<"summary" | "detail">("summary");
  const [summary, setSummary] = useState<PayoutOrganizer[]>([]);
  const [payments, setPayments] = useState<PayoutPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(() => {
    setLoading(true);
    api
      .get<ApiResponse<PayoutOrganizer[]>>("/admin/payouts/summary")
      .then((r) => setSummary(r.data.data))
      .catch(() => setError("Failed to load payout summary."))
      .finally(() => setLoading(false));
  }, []);

  const fetchDetail = useCallback(() => {
    setLoading(true);
    api
      .get<
        ApiResponse<{
          payments: PayoutPayment[];
          pagination: Pagination;
          totalAmount: number;
        }>
      >(`/admin/payouts?page=${page}&limit=20`)
      .then((r) => {
        setPayments(r.data.data.payments);
        setPagination(r.data.data.pagination);
        setTotalAmount(r.data.data.totalAmount);
      })
      .catch(() => setError("Failed to load payouts."))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    setError("");
    if (tab === "summary") {
      fetchSummary();
    } else {
      fetchDetail();
    }
  }, [tab, fetchSummary, fetchDetail]);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Payouts</h1>
        <p className="admin-page-sub">
          Completed-event payments owed to organizers
        </p>
      </div>

      {/* Tab switcher */}
      <div className="admin-tabs">
        <button
          id="payouts-tab-summary"
          className={`admin-tab ${tab === "summary" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("summary")}
        >
          By Organizer
        </button>
        <button
          id="payouts-tab-detail"
          className={`admin-tab ${tab === "detail" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("detail")}
        >
          All Transactions
        </button>
      </div>

      {tab === "detail" && !loading && !error && (
        <div className="admin-summary-banner">
          <span className="admin-summary-banner__label">Total pending payouts:</span>
          <span className="admin-summary-banner__value">{fmtMoney(totalAmount)}</span>
          {pagination && (
            <span className="admin-summary-banner__count">
              ({pagination.total} transactions)
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      )}
      {error && <p className="admin-error">{error}</p>}

      {/* Summary Tab */}
      {!loading && !error && tab === "summary" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Contact Email</th>
                <th>Transactions</th>
                <th>Total Due</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-table__empty">
                    No pending payouts.
                  </td>
                </tr>
              )}
              {summary.map((o) => (
                <tr key={o.organizerId}>
                  <td className="admin-table__title">{o.orgName}</td>
                  <td className="admin-table__sub">{o.email}</td>
                  <td>{o.count}</td>
                  <td className="admin-table__amount">{fmtMoney(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Tab */}
      {!loading && !error && tab === "detail" && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Organizer</th>
                  <th>Event</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-table__empty">
                      No payouts found.
                    </td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="admin-monospace">{p.transactionId ?? "—"}</td>
                    <td>
                      <p>{p.order.event.organizer.orgName}</p>
                      <p className="admin-table__sub">
                        {p.order.event.organizer.contactEmail ??
                          p.order.event.organizer.user.email}
                      </p>
                    </td>
                    <td>{p.order.event.title}</td>
                    <td>
                      <p>{p.order.user.fullName ?? "—"}</p>
                      <p className="admin-table__sub">{p.order.user.email}</p>
                    </td>
                    <td className="admin-table__amount">{fmtMoney(p.amount)}</td>
                    <td>{fmtDate(p.createdAt)}</td>
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
