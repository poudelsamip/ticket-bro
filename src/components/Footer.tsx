import { Link } from "react-router";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0d0f14] border-t border-white/[0.06] text-[#9aa0b4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                TICKET<span className="text-[#f5c518]">BRO</span>
              </span>
              <span className="text-[10px] font-bold bg-[#f5c518] text-[#0d0f14] px-1.5 py-0.5 rounded tracking-widest uppercase">
                LIVE
              </span>
            </Link>
            <p className="text-xs leading-relaxed max-w-[220px]">
              Discover concerts, conferences, and festivals. Instant digital
              ticketing with verified QR passes and real-time analytics.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Discover
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/events?search=concerts" className="hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore / For Organizers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Organizers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register/organizer" className="hover:text-white transition-colors">
                  Organizer Login
                </Link>
              </li>
              <li>
                <Link to="/organizer/events" className="hover:text-white transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/staff/scan" className="hover:text-white transition-colors">
                  Staff Gate Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Log in / Sign up
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition-colors">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[#9aa0b4]">
            © {year} Ticket Bro. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[#9aa0b4]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
