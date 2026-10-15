import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      // Read the user immediately after login
      const user = useAuthStore.getState().user;
      if (user?.role === "ADMIN") {
        void navigate("/admin");
      } else {
        void navigate("/");
      }
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const resp = (err as { response: { data?: { message?: string } } })
          .response;
        setError(resp.data?.message ?? "Login failed");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="page-container--form">
      <div className="w-full">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              TICKET<span className="text-accent">BRO</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome back
          </h1>
          <p className="mt-1.5 text-xs text-text-muted">
            Sign in to access your booked passes and reservations
          </p>
        </div>

        {/* Card Form */}
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
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-text-faint"
                >
                  Password
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="spinner !w-3.5 !h-3.5 !border-white !border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-muted space-y-2">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-accent hover:underline">
                Create attendee account
              </Link>
            </p>
            <p>
              Looking to host events?{" "}
              <Link to="/register/organizer" className="font-semibold text-text-primary hover:underline">
                Sign up as Organizer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}