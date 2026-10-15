import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary/60 text-text-muted mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-text-primary">
                TICKET<span className="text-accent">BRO</span>
              </span>
              <span className="navbar__logo-badge">LIVE</span>
            </Link>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              Discover concerts, conferences, and festivals. Instant digital ticketing with verified QR passes for attendees and real-time revenue analytics for organizers.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-text-primary transition-colors">
                  All Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-text-primary transition-colors">
                  My Booked Passes
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-text-primary transition-colors">
                  Attendee Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
              For Organizers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/register/organizer" className="hover:text-text-primary transition-colors">
                  Host an Event
                </Link>
              </li>
              <li>
                <Link to="/organizer/events" className="hover:text-text-primary transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/staff/scan" className="hover:text-text-primary transition-colors">
                  Staff Gate Scanner
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-faint gap-4">
          <p>© {new Date().getFullYear()} Ticket Bro. Crafted for premium live experiences.</p>
          <div className="flex items-center gap-4 text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
