import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: "⊞" },
  { label: "Events", path: "/admin/events", icon: "🎟" },
  { label: "Users", path: "/admin/users", icon: "👥" },
  { label: "Payments", path: "/admin/payments", icon: "💳" },
  { label: "Refunds", path: "/admin/refunds", icon: "↩" },
  { label: "Payouts", path: "/admin/payouts", icon: "💰" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary">Access Denied</p>
          <p className="mt-2 text-text-muted">You must be an admin to view this page.</p>
          <Link to="/" className="mt-4 inline-block text-text-secondary underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    void navigate("/login");
  };

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-logo">
            <span className="admin-logo__icon">🎟</span>
            <span className="admin-logo__text">TicketBro</span>
          </div>
          <span className="admin-logo__badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav__item ${isActive ? "admin-nav__item--active" : ""}`}
              >
                <span className="admin-nav__icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {(user.fullName ?? user.email)[0].toUpperCase()}
            </div>
            <div className="admin-user-details">
              <p className="admin-user-name">{user.fullName ?? "Admin"}</p>
              <p className="admin-user-email">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="admin-logout-btn"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="admin-topbar__title">
            {NAV_ITEMS.find((n) =>
              n.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(n.path)
            )?.label ?? "Admin"}
          </span>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
