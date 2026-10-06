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

interface PayoutHistoryRecord {
  id: string;
  organizerId: string;
  amount: number;
  note: string | null;
  releasedAt: string;
  organizer: {
    id: string;
    orgName: string;
    contactEmail: string | null;
    user: { email: string };
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Release Payment Modal ── */
function ReleasePaymentModal({
  organizer,
  onClose,
  onSuccess,
}: {
  organizer: PayoutOrganizer;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/admin/payouts/release", {
        organizerId: organizer.organizerId,
        amount: organizer.totalAmount,
        note: note.trim() || undefined,
      });
      onSuccess(
        `Successfully released payout of ${fmtMoney(organizer.totalAmount)} to ${organizer.orgName}!`,
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to release payout.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "14px",
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(16,185,129,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            💸
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--admin-text)" }}>
              Release Payment
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--admin-text-muted)" }}>
              Record payout released to organizer
            </p>
          </div>
        </div>

        {error && (
          <p
            className="admin-error"
            style={{ marginBottom: "16px", padding: "8px 12px", borderRadius: "6px" }}
          >
            {error}
          </p>
        )}

        {/* Organizer info */}
        <div
          style={{
            background: "var(--admin-surface-2)",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>Organizer</span>
            <span style={{ fontWeight: 600, color: "var(--admin-text)" }}>{organizer.orgName}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>Email</span>
            <span style={{ fontSize: "13px", color: "var(--admin-text)" }}>{organizer.email}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>Completed Txns</span>
            <span style={{ fontWeight: 600, color: "var(--admin-text)" }}>{organizer.count}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
              borderTop: "1px solid var(--admin-border)",
              marginTop: "4px",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>Amount to Release</span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--admin-success)",
              }}
            >
              {fmtMoney(organizer.totalAmount)}
            </span>
          </div>
        </div>

        {/* Note / Transfer Reference */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--admin-text-muted)",
              marginBottom: "6px",
            }}
          >
            Payment Note / Reference (Optional)
          </label>
          <input
            type="text"
            className="admin-input"
            placeholder="e.g., Bank Transfer Ref #12345, Cash, Cheque"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitting}
            style={{ width: "100%" }}
          />
        </div>

        {/* Notice */}
        <p
          style={{
            fontSize: "12px",
            color: "var(--admin-text-muted)",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.25)",
            borderRadius: "8px",
            padding: "10px 14px",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
          This will mark the pending balance as settled and record this payout into the organizer's Payout History.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button className="admin-btn admin-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            id={`release-payment-confirm-${organizer.organizerId}`}
            className="admin-btn admin-btn--success"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Releasing..." : "Confirm & Release"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminPayoutsPage() {
  const [tab, setTab] = useState<"summary" | "detail">("summary");
  const [summary, setSummary] = useState<PayoutOrganizer[]>([]);
  const [payouts, setPayouts] = useState<PayoutHistoryRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [releaseTarget, setReleaseTarget] = useState<PayoutOrganizer | null>(null);

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
          payouts: PayoutHistoryRecord[];
          pagination: Pagination;
          totalAmount: number;
        }>
      >(`/admin/payouts?page=${page}&limit=20`)
      .then((r) => {
        setPayouts(r.data.data.payouts || []);
        setPagination(r.data.data.pagination);
        setTotalAmount(r.data.data.totalAmount || 0);
      })
      .catch(() => setError("Failed to load payout history."))
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

  const handleReleaseSuccess = (msg: string) => {
    setReleaseTarget(null);
    setSuccessMsg(msg);
    fetchSummary();
    setTimeout(() => {
      setSuccessMsg("");
    }, 6000);
  };

  return (
    <AdminLayout>
      {releaseTarget && (
        <ReleasePaymentModal
          organizer={releaseTarget}
          onClose={() => setReleaseTarget(null)}
          onSuccess={handleReleaseSuccess}
        />
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">Payouts</h1>
        <p className="admin-page-sub">
          {tab === "summary"
            ? "Pending payouts owed to organizers from completed events"
            : "History of all payouts released to organizers"}
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid var(--admin-success)",
            color: "var(--admin-success)",
            padding: "12px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 500,
          }}
        >
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab switcher */}
      <div className="admin-tabs">
        <button
          id="payouts-tab-summary"
          className={`admin-tab ${tab === "summary" ? "admin-tab--active" : ""}`}
          onClick={() => {
            setTab("summary");
            setPage(1);
          }}
        >
          By Organizer
        </button>
        <button
          id="payouts-tab-detail"
          className={`admin-tab ${tab === "detail" ? "admin-tab--active" : ""}`}
          onClick={() => {
            setTab("detail");
            setPage(1);
          }}
        >
          Payout History
        </button>
      </div>

      {tab === "detail" && !loading && !error && (
        <div className="admin-summary-banner">
          <span className="admin-summary-banner__label">Total paid out to organizers:</span>
          <span className="admin-summary-banner__value">{fmtMoney(totalAmount)}</span>
          {pagination && (
            <span className="admin-summary-banner__count">
              ({pagination.total} payout record{pagination.total !== 1 ? "s" : ""})
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

      {/* By Organizer Tab */}
      {!loading && !error && tab === "summary" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Contact Email</th>
                <th>Completed Event Txns</th>
                <th>Pending Amount Due</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-table__empty">
                    No pending payouts. All completed events are settled.
                  </td>
                </tr>
              )}
              {summary.map((o) => (
                <tr key={o.organizerId}>
                  <td className="admin-table__title">{o.orgName}</td>
                  <td className="admin-table__sub">{o.email}</td>
                  <td>{o.count}</td>
                  <td className="admin-table__amount">{fmtMoney(o.totalAmount)}</td>
                  <td>
                    <button
                      id={`release-payment-btn-${o.organizerId}`}
                      className="admin-btn admin-btn--success admin-btn--sm"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                      onClick={() => setReleaseTarget(o)}
                    >
                      <span>💸</span>
                      <span>Release Payment</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payout History Tab */}
      {!loading && !error && tab === "detail" && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Payout ID</th>
                  <th>Organizer</th>
                  <th>Amount</th>
                  <th>Note / Reference</th>
                  <th>Date Released</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-table__empty">
                      No payout history found. Payouts released to organizers will appear here.
                    </td>
                  </tr>
                )}
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="admin-monospace" title={p.id}>
                        {p.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td>
                      <p className="admin-table__title">{p.organizer?.orgName ?? "—"}</p>
                      <p className="admin-table__sub">
                        {p.organizer?.contactEmail ?? p.organizer?.user?.email ?? "—"}
                      </p>
                    </td>
                    <td className="admin-table__amount" style={{ color: "var(--admin-success)" }}>
                      {fmtMoney(p.amount)}
                    </td>
                    <td>
                      <span className="admin-table__sub">{p.note || "—"}</span>
                    </td>
                    <td>{fmtDate(p.releasedAt)}</td>
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

