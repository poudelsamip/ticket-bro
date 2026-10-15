import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    return (email?.[0] || "U").toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-text-primary text-base">
              TICKET<span className="text-accent">BRO</span>
            </span>
            <span className="navbar__logo-badge">LIVE</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar__links">
          <Link
            to="/events"
            className={`navbar__link ${isActive("/events") && !location.pathname.startsWith("/events/new") ? "navbar__link--active" : ""}`}
          >
            Explore Events
          </Link>

          {user ? (
            <>
              {user.role === "ORGANIZER" && (
                <>
                  <Link
                    to="/organizer/events"
                    className={`navbar__link ${isActive("/organizer/events") ? "navbar__link--active" : ""}`}
                  >
                    My Events
                  </Link>
                  <Link
                    to="/organizer/staff"
                    className={`navbar__link ${isActive("/organizer/staff") ? "navbar__link--active" : ""}`}
                  >
                    Staff Team
                  </Link>
                  <Link
                    to="/events/new"
                    className="navbar__btn navbar__btn--accent text-xs py-1.5 px-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Event
                  </Link>
                </>
              )}

              {user.role === "STAFF" && (
                <Link
                  to="/staff/scan"
                  className={`navbar__link ${isActive("/staff/scan") ? "navbar__link--active" : ""}`}
                >
                  <svg className="w-4 h-4 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  </svg>
                  Scan Tickets
                </Link>
              )}

              {user.role === "USER" && (
                <Link
                  to="/my-tickets"
                  className={`navbar__link ${isActive("/my-tickets") ? "navbar__link--active" : ""}`}
                >
                  My Tickets
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="navbar__link text-accent font-semibold"
                >
                  Admin Console
                </Link>
              )}

              <div className="navbar__user-badge ml-1">
                <span className="navbar__avatar">
                  {getInitials(user.fullName, user.email)}
                </span>
                <span className="max-w-[130px] truncate">
                  {user.fullName || user.email}
                </span>
                <span className="navbar__role-tag">{user.role}</span>
              </div>

              <button
                onClick={() => void logout()}
                className="navbar__logout"
                title="Sign out of account"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="navbar__link">
                Sign In
              </Link>
              <Link to="/register" className="navbar__btn">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/events" className="navbar__mobile-link" onClick={closeMenu}>
            Explore Events
          </Link>

          {user ? (
            <>
              {user.role === "ORGANIZER" && (
                <>
                  <Link to="/organizer/events" className="navbar__mobile-link" onClick={closeMenu}>
                    My Events
                  </Link>
                  <Link to="/organizer/staff" className="navbar__mobile-link" onClick={closeMenu}>
                    Staff Team
                  </Link>
                  <Link to="/events/new" className="navbar__mobile-link font-semibold text-accent" onClick={closeMenu}>
                    + Create Event
                  </Link>
                </>
              )}

              {user.role === "STAFF" && (
                <Link to="/staff/scan" className="navbar__mobile-link" onClick={closeMenu}>
                  Scan Tickets
                </Link>
              )}

              {user.role === "USER" && (
                <Link to="/my-tickets" className="navbar__mobile-link" onClick={closeMenu}>
                  My Tickets
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link to="/admin" className="navbar__mobile-link text-accent font-semibold" onClick={closeMenu}>
                  Admin Console
                </Link>
              )}

              <div className="navbar__mobile-divider" />
              <div className="px-3 py-1 flex items-center gap-2">
                <span className="navbar__avatar">{getInitials(user.fullName, user.email)}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">{user.fullName || user.email}</span>
                  <span className="text-[10px] text-text-muted capitalize">{user.role.toLowerCase()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  closeMenu();
                  void logout();
                }}
                className="navbar__mobile-logout"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="navbar__mobile-divider" />
              <Link to="/login" className="navbar__mobile-link" onClick={closeMenu}>
                Sign In
              </Link>
              <Link to="/register" className="navbar__mobile-link font-semibold text-accent" onClick={closeMenu}>
                Register Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}