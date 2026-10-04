import { Link } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <nav className="border-b border-border bg-white">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-40">
        <Link
          to="/"
          className="text-lg font-bold uppercase tracking-wide text-text-primary"
        >
          Ticket Bro
        </Link>

        <div className="flex items-center gap-6 text-base text-text-primary">
          <Link to="/events" className="hover:underline">
            events
          </Link>

          {user ? (
            <>
              {user.role === "ORGANIZER" && (
                <>
                  <Link to="/organizer/events" className="hover:underline">
                    my events
                  </Link>
                  <Link to="/organizer/staff" className="hover:underline">
                    staff
                  </Link>
                  <Link to="/events/new" className="hover:underline">
                    add event
                  </Link>
                </>
              )}
              {user.role === "STAFF" && (
                <Link to="/staff/scan" className="hover:underline">
                  scan tickets
                </Link>
              )}
              {user.role === "USER" && (
                <Link to="/my-tickets" className="hover:underline">
                  my tickets
                </Link>
              )}
              <span className="text-text-secondary">
                {user.fullName ?? user.email}
              </span>
              <button
                onClick={() => void logout()}
                className="cursor-pointer hover:underline"
              >
                logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">
              login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}