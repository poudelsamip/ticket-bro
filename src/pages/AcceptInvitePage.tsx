import { useState, type FormEvent } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.post<ApiResponse<{ message: string }>>("/staff/accept-invite", {
        token,
        fullName,
        password,
      });
      setSuccess(true);
      setTimeout(() => void navigate("/login"), 3000);
    } catch (err: unknown) {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message ?? "Failed to accept invite. The link may be invalid or expired.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5";

  if (!token) {
    return (
      <div className="page-container--form">
        <div className="card card--padded max-w-md w-full text-center border-border shadow-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-danger-bg text-danger flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Invalid Invitation Link
          </h1>
          <p className="text-xs text-text-muted mb-6 leading-relaxed">
            This invite token is missing, expired, or malformed. Please request a new invite link from your event organizer.
          </p>
          <Link to="/" className="navbar__btn text-xs">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-container--form">
        <div className="card card--padded max-w-md w-full text-center border-2 border-success-border bg-surface shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-bg text-success flex items-center justify-center border border-success-border">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-text-primary mb-2">
            Staff Account Activated!
          </h1>
          <p className="text-xs text-text-muted mb-6">
            Your credentials have been set. Redirecting you to sign in...
          </p>
          <Link to="/login" className="navbar__btn text-xs">
            Sign In Now →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container--form">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              TICKET<span className="text-accent">BRO</span>
            </span>
          </Link>
          <div className="inline-block px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-bold uppercase tracking-wider mb-2">
            Staff Invitation
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Accept Staff Member Role
          </h1>
          <p className="mt-1.5 text-xs text-text-muted">
            Complete your profile to start validating tickets for your organizer
          </p>
        </div>

        {/* Form Card */}
        <div className="card card--padded shadow-md border-border bg-surface">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-danger-bg border border-danger-border text-xs font-semibold text-danger flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="staff-fullname" className={labelClass}>
                Full Name
              </label>
              <input
                id="staff-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Jane Staff"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className={labelClass}>
                Set Password
              </label>
              <input
                id="staff-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="staff-confirm-password" className={labelClass}>
                Confirm Password
              </label>
              <input
                id="staff-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="spinner !w-3.5 !h-3.5 !border-white !border-t-transparent" />
                  <span>Activating Account...</span>
                </>
              ) : (
                "Activate Staff Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
