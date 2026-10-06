import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import AdminLayout from "./AdminLayout";

interface DashboardStats {
  totalUsers: number;
  totalOrganizers: number;
  totalEvents: number;
  publishedEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  pendingRefunds: number;
  pendingPayouts: number;
}

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className={`admin-stat-card admin-stat-card--${color}`}>
      <div className="admin-stat-card__icon">{icon}</div>
      <div className="admin-stat-card__body">
        <p className="admin-stat-card__label">{label}</p>
        <p className="admin-stat-card__value">{value}</p>
        {sub && <p className="admin-stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

function fmtMoney(n: number) {
  return `Rs. ${n.toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<ApiResponse<DashboardStats>>("/admin/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Platform overview at a glance</p>
      </div>

      {loading && (
        <div className="admin-loading">
          <div className="admin-spinner" />
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}

      {stats && (
        <>
          <div className="admin-stats-grid">
            <StatCard
              label="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon="👥"
              color="blue"
              sub={`${stats.totalOrganizers} organizers`}
            />
            <StatCard
              label="Total Events"
              value={stats.totalEvents.toLocaleString()}
              icon="🎟"
              color="purple"
              sub={`${stats.publishedEvents} published`}
            />
            <StatCard
              label="Tickets Sold"
              value={stats.totalTicketsSold.toLocaleString()}
              icon="🎫"
              color="green"
            />
            <StatCard
              label="Total Revenue"
              value={fmtMoney(stats.totalRevenue)}
              icon="💵"
              color="emerald"
            />
            <StatCard
              label="Pending Refunds"
              value={stats.pendingRefunds}
              icon="↩"
              color={stats.pendingRefunds > 0 ? "red" : "gray"}
            />
            <StatCard
              label="Pending Payouts"
              value={fmtMoney(stats.pendingPayouts)}
              icon="💰"
              color={stats.pendingPayouts > 0 ? "amber" : "gray"}
            />
          </div>

          <div className="admin-quick-links">
            <h2 className="admin-section-title">Quick Actions</h2>
            <div className="admin-quick-links__grid">
              <a href="/admin/events" className="admin-quick-link">
                <span>🎟</span> Manage Events
              </a>
              <a href="/admin/users" className="admin-quick-link">
                <span>👥</span> Manage Users
              </a>
              <a href="/admin/refunds" className="admin-quick-link">
                <span>↩</span> Process Refunds
              </a>
              <a href="/admin/payouts" className="admin-quick-link">
                <span>💰</span> View Payouts
              </a>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
