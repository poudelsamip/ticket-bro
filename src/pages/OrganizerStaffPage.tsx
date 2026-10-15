import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types";
import Spinner from "@/components/Spinner";

interface StaffMember {
  id: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
  };
}

interface PendingInvite {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export default function OrganizerStaffPage() {
  const { user, isInitialized } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, invitesRes] = await Promise.all([
        api.get<ApiResponse<{ staff: StaffMember[] }>>("/organizer/staff"),
        api.get<ApiResponse<{ invites: PendingInvite[] }>>(
          "/organizer/staff/invites",
        ),
      ]);
      setStaff(staffRes.data.data.staff);
      setInvites(invitesRes.data.data.invites);
    } catch {
      // silently fail — access control handled below
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && user?.role === "ORGANIZER") {
      void fetchData();
    }
  }, [isInitialized, user]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setIsSending(true);
    try {
      await api.post("/organizer/staff/invite", { email: inviteEmail });
      setInviteSuccess(`Invitation dispatched to ${inviteEmail}`);
      setInviteEmail("");
      void fetchData();
    } catch (err: unknown) {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message ?? "Failed to send invitation";
      setInviteError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleRemove = async (staffId: string) => {
    if (!confirm("Remove this staff member from your organization?")) return;
    setRemovingId(staffId);
    try {
      await api.delete(`/organizer/staff/${staffId}`);
      setStaff((prev) => prev.filter((s) => s.id !== staffId));
    } catch {
      alert("Failed to remove staff member");
    } finally {
      setRemovingId(null);
    }
  };

  if (!isInitialized || isLoading) return <Spinner label="Loading staff registry..." />;

  if (!user || user.role !== "ORGANIZER") {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <h2 className="empty-state__title">Organizer Access Only</h2>
          <p className="empty-state__body">Please sign in with your organizer account.</p>
          <Link to="/login" className="navbar__btn text-xs">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container--narrow">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="navbar__role-tag !bg-accent-light !text-accent font-bold">
            Team Coordination
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          Gate Staff Management
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Invite and assign scanning crew members to check attendees in at venue entrances
        </p>
      </div>

      {/* Invite Form Card */}
      <div className="card card--padded bg-surface border-border shadow-sm mb-10">
        <h2 className="text-sm font-bold text-text-primary mb-3">
          Invite New Gate Staff Member
        </h2>

        <form onSubmit={(e) => void handleInvite(e)} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              id="staff-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@domain.com"
              className="w-full rounded-xl border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10"
            />
          </div>
          <button
            type="submit"
            id="send-invite-btn"
            disabled={isSending}
            className="navbar__btn navbar__btn--accent text-xs font-bold uppercase tracking-wider py-2.5 px-5 shrink-0 disabled:opacity-40"
          >
            {isSending ? "Sending..." : "Send Invite Link"}
          </button>
        </form>

        {inviteSuccess && (
          <div className="mt-3 p-3 rounded-lg bg-success-bg border border-success-border text-xs font-semibold text-success flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{inviteSuccess}</span>
          </div>
        )}

        {inviteError && (
          <div className="mt-3 p-3 rounded-lg bg-danger-bg border border-danger-border text-xs font-semibold text-danger flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{inviteError}</span>
          </div>
        )}
      </div>

      {/* Pending Invites List */}
      {invites.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-faint">
              Pending Invites ({invites.length})
            </h2>
          </div>
          <div className="space-y-2.5">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-warning-border bg-warning-bg/40 text-xs"
              >
                <div>
                  <p className="font-bold text-text-primary">{inv.email}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Valid until{" "}
                    {new Date(inv.expiresAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="status-pill status-pill--DRAFT text-[10px]">
                  Pending Acceptance
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Staff List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-faint">
            Active Staff Team ({staff.length})
          </h2>
        </div>

        {staff.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-state__icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <h3 className="empty-state__title">No active staff members</h3>
            <p className="empty-state__body">
              Invite scanner staff to scan digital QR passes on event days.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {staff.map((s) => (
              <div
                key={s.id}
                className="card p-4 flex items-center justify-between border-border bg-surface shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {(s.user.fullName || s.user.email)[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {s.user.fullName ?? s.user.email}
                    </p>
                    <p className="text-xs text-text-muted truncate">{s.user.email}</p>
                  </div>
                </div>

                <button
                  id={`remove-staff-${s.id}`}
                  onClick={() => void handleRemove(s.id)}
                  disabled={removingId === s.id}
                  className="px-3 py-1.5 rounded-lg border border-danger-border text-danger text-xs font-semibold hover:bg-danger-bg transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {removingId === s.id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
