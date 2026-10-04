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
    "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary";
  const labelClass = "mb-1.5 block text-sm font-medium text-text-secondary";

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            Invalid Invite Link
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            This invite link is missing or malformed.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            <svg
              className="h-7 w-7 text-green-600"
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
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            Account Created!
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your staff account has been set up. Redirecting you to login…
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-3 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">
            Accept Staff Invitation
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Set up your staff account to get started.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="staff-fullname" className={labelClass}>
              Full name
            </label>
            <input
              id="staff-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="staff-password" className={labelClass}>
              Password
            </label>
            <input
              id="staff-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label htmlFor="staff-confirm-password" className={labelClass}>
              Confirm password
            </label>
            <input
              id="staff-confirm-password"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            id="accept-invite-btn"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg bg-text-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? "Setting up account…" : "Create account & join"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
