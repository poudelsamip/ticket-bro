import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types";

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
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
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
    if (!confirm("Remove this staff member?")) return;
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

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ORGANIZER") {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="mb-4 text-[14px] text-text-secondary">
          This page is only accessible to organizers.
        </p>
        <Link
          to="/login"
          className="text-[13px] font-medium underline underline-offset-4"
        >
          Login
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Invite staff members to help manage your organization.
        </p>
      </div>

      {/* Invite Form */}
      <div className="mb-10 rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          Invite a Staff Member
        </h2>

        <form
          onSubmit={(e) => void handleInvite(e)}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="staff-email"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Email address
            </label>
            <input
              id="staff-email"
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={inputClass}
              placeholder="staff@example.com"
            />
          </div>
          <button
            type="submit"
            id="send-invite-btn"
            disabled={isSending}
            className="shrink-0 cursor-pointer rounded-lg bg-text-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isSending ? "Sending…" : "Send Invite"}
          </button>
        </form>

        {inviteSuccess && (
          <p className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {inviteSuccess}
          </p>
        )}
        {inviteError && (
          <p className="mt-3 text-sm text-red-600">{inviteError}</p>
        )}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-base font-semibold text-text-primary">
            Pending Invitations ({invites.length})
          </h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-border bg-amber-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {inv.email}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Expires{" "}
                    {new Date(inv.expiresAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff List */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-text-primary">
          Staff Members ({staff.length})
        </h2>

        {staff.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-secondary py-14 text-center">
            <svg
              className="mx-auto mb-3 h-9 w-9 text-text-muted"
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
            <p className="text-sm text-text-secondary">No staff members yet.</p>
            <p className="mt-1 text-[12px] text-text-muted">
              Send an invitation above to add your first team member.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {staff.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3.5 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {s.user.fullName ?? s.user.email}
                  </p>
                  <p className="text-[12px] text-text-muted">{s.user.email}</p>
                </div>
                <button
                  id={`remove-staff-${s.id}`}
                  onClick={() => void handleRemove(s.id)}
                  disabled={removingId === s.id}
                  className="ml-4 shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-[12px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
                >
                  {removingId === s.id ? "Removing…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
