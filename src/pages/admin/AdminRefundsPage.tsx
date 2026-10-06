import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { ApiResponse, Pagination } from "@/types";
import AdminLayout from "./AdminLayout";

interface RefundPayment {
  id: string;
  provider: "ESEWA" | "KHALTI";
  transactionId: string | null;
  amount: number;
  status: string;
  createdAt: string;
  order: {
    id: string;
    user: { id: string; email: string; fullName: string | null; phone: string | null };
    event: { id: string; title: string; slug: string };
  };
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMoney(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}

export default function AdminRefundsPage() {
  const [payments, setPayments] = useState<RefundPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchRefunds = useCallback(() => {
    setLoading(true);
    api
      .get<
        ApiResponse<{ payments: RefundPayment[]; pagination: Pagination; totalAmount: number }>
      >(`/admin/refunds?page=${page}&limit=20`)
      .then((r) => {
        setPayments(r.data.data.payments);
        setPagination(r.data.data.pagination);
        setTotalAmount(r.data.data.totalAmount);
      })
      .catch(() => setError("Failed to load refunds."))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleMarkRefunded = async (paymentId: string) => {
    if (!window.confirm("Mark this payment as refunded?")) return;
    setMarkingId(paymentId);
    try {
      await api.patch(`/admin/payments/${paymentId}/refund`);
      fetchRefunds();
    } catch {
      alert("Failed to mark as refunded.");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pending Refunds</h1>
        <p className="admin-page-sub">Payments requiring manual refund processing</p>
      </div>

      {!loading && !error && (
        <div className="admin-summary-banner">
          <span className="admin-summary-banner__label">Total refund liability:</span>
          <span className="admin-summary-banner__value">{fmtMoney(totalAmount)}</span>
          {pagination && (
            <span className="admin-summary-banner__count">
              ({pagination.total} payments)
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
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="admin-table__empty">
                      🎉 No pending refunds!
                    </td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="admin-table__title admin-monospace">
                        {p.transactionId ?? "—"}
                      </p>
                    </td>
                    <td>
                      <p>{p.order.user.fullName ?? "—"}</p>
                      <p className="admin-table__sub">{p.order.user.email}</p>
                      {p.order.user.phone && (
                        <p className="admin-table__sub">{p.order.user.phone}</p>
                      )}
                    </td>
                    <td>{p.order.event.title}</td>
                    <td className="admin-table__amount">{fmtMoney(p.amount)}</td>
                    <td>
                      <span className="admin-badge admin-badge--gray">{p.provider}</span>
                    </td>
                    <td>{fmtDate(p.createdAt)}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn--success admin-btn--sm"
                        disabled={markingId === p.id}
                        onClick={() => void handleMarkRefunded(p.id)}
                      >
                        {markingId === p.id ? "Processing…" : "Mark Refunded"}
                      </button>
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
