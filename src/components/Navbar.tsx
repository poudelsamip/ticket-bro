import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

// ── Icon Components ──────────────────────────────────────────────────────────

const IconCompass = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconQrCode = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625h2.25m2.25 0h-2.25m0 0v2.25m0-2.25v-2.25m2.25 4.5h-2.25m2.25 0v2.25M13.5 19.875v-2.25" />
  </svg>
);

const IconTicket = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const IconShield = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const IconLogIn = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const IconUserPlus = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
);

const IconLogOut = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 15l3-3m0 0l-3-3m3 3H2.25" />
  </svg>
);

// ────────────────────────────────────────────────────────────────────────────

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
            <IconCompass />
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
                    <IconCalendar />
                    My Events
                  </Link>
                  <Link
                    to="/organizer/staff"
                    className={`navbar__link ${isActive("/organizer/staff") ? "navbar__link--active" : ""}`}
                  >
                    <IconUsers />
                    Staff Team
                  </Link>
                  <Link
                    to="/events/new"
                    className="navbar__btn navbar__btn--accent text-xs py-1.5 px-3"
                  >
                    <IconPlus />
                    Create Event
                  </Link>
                </>
              )}

              {user.role === "STAFF" && (
                <Link
                  to="/staff/scan"
                  className={`navbar__link ${isActive("/staff/scan") ? "navbar__link--active" : ""}`}
                >
                  <IconQrCode />
                  Scan Tickets
                </Link>
              )}

              {user.role === "USER" && (
                <Link
                  to="/my-tickets"
                  className={`navbar__link ${isActive("/my-tickets") ? "navbar__link--active" : ""}`}
                >
                  <IconTicket />
                  My Tickets
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="navbar__link text-accent font-semibold"
                >
                  <IconShield />
                  Admin Console
                </Link>
              )}

              <div className="navbar__user-badge ml-1">
                <span className="navbar__avatar">
                  {getInitials(user.fullName, user.email)}
                </span>
                <div className="navbar__user-tooltip">
                  <span className="navbar__user-tooltip-name">
                    {user.fullName || user.email}
                  </span>
                  {user.role === "ORGANIZER" && (
                    <span className="navbar__user-tooltip-org">
                      Organizer Account
                    </span>
                  )}
                  <span className="navbar__user-tooltip-email">{user.email}</span>
                  <span className="navbar__user-tooltip-role">
                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => void logout()}
                className="navbar__logout"
                title="Sign out of account"
              >
                <IconLogOut />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="navbar__link">
                <IconLogIn />
                Sign In
              </Link>
              <Link to="/register" className="navbar__btn">
                <IconUserPlus />
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
            <IconCompass />
            Explore Events
          </Link>

          {user ? (
            <>
              {user.role === "ORGANIZER" && (
                <>
                  <Link to="/organizer/events" className="navbar__mobile-link" onClick={closeMenu}>
                    <IconCalendar />
                    My Events
                  </Link>
                  <Link to="/organizer/staff" className="navbar__mobile-link" onClick={closeMenu}>
                    <IconUsers />
                    Staff Team
                  </Link>
                  <Link to="/events/new" className="navbar__mobile-link font-semibold text-accent" onClick={closeMenu}>
                    <IconPlus />
                    Create Event
                  </Link>
                </>
              )}

              {user.role === "STAFF" && (
                <Link to="/staff/scan" className="navbar__mobile-link" onClick={closeMenu}>
                  <IconQrCode />
                  Scan Tickets
                </Link>
              )}

              {user.role === "USER" && (
                <Link to="/my-tickets" className="navbar__mobile-link" onClick={closeMenu}>
                  <IconTicket />
                  My Tickets
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link to="/admin" className="navbar__mobile-link text-accent font-semibold" onClick={closeMenu}>
                  <IconShield />
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
                <IconLogOut />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="navbar__mobile-divider" />
              <Link to="/login" className="navbar__mobile-link" onClick={closeMenu}>
                <IconLogIn />
                Sign In
              </Link>
              <Link to="/register" className="navbar__mobile-link font-semibold text-accent" onClick={closeMenu}>
                <IconUserPlus />
                Register Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}