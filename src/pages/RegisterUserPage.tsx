import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await register({ role: "USER", email, password, fullName, phone });
      void navigate("/login");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const resp = (err as { response: { data?: { message?: string } } })
          .response;
        setError(resp.data?.message ?? "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5";

  return (
    <div className="page-container--form">
      <div className="w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold tracking-tight text-text-primary">
              TICKET<span className="text-accent">BRO</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Create attendee account
          </h1>
          <p className="mt-1.5 text-xs text-text-muted">
            Book tickets, manage your passes, and attend events seamlessly
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
              <label htmlFor="user-fullname" className={labelClass}>
                Full Name
              </label>
              <input
                id="user-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="user-email" className={labelClass}>
                Email Address
              </label>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label htmlFor="user-phone" className={labelClass}>
                Phone Number
              </label>
              <input
                id="user-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="98XXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="user-password" className={labelClass}>
                Password
              </label>
              <input
                id="user-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-muted space-y-2">
            <p>
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Sign in to your account
              </Link>
            </p>
            <p>
              Are you an event coordinator?{" "}
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
