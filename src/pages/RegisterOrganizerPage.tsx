import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterOrganizerPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const body: Record<string, string> = {
      role: "ORGANIZER",
      email,
      password,
      orgName,
    };

    if (contactEmail.trim()) body.contactEmail = contactEmail.trim();
    if (contactPhone.trim()) body.contactPhone = contactPhone.trim();
    if (website.trim()) body.website = website.trim();

    try {
      await register(body);
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
          <div className="inline-block px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-bold uppercase tracking-wider mb-2">
            Organizer Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Register as Organizer
          </h1>
          <p className="mt-1.5 text-xs text-text-muted">
            Set up your organization to create, sell, and scan event tickets
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
              <label htmlFor="org-name" className={labelClass}>
                Organization / Producer Name *
              </label>
              <input
                id="org-name"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Acme Productions"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="org-email" className={labelClass}>
                  Login Email *
                </label>
                <input
                  id="org-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="admin@acme.com"
                />
              </div>

              <div>
                <label htmlFor="org-password" className={labelClass}>
                  Password *
                </label>
                <input
                  id="org-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="org-contact-email" className={labelClass}>
                  Public Contact Email
                </label>
                <input
                  id="org-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className={inputClass}
                  placeholder="contact@acme.com"
                />
              </div>

              <div>
                <label htmlFor="org-contact-phone" className={labelClass}>
                  Contact Phone
                </label>
                <input
                  id="org-contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className={inputClass}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label htmlFor="org-website" className={labelClass}>
                Official Website or Social Page
              </label>
              <input
                id="org-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https://acmeproductions.com"
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
                  <span>Registering Organization...</span>
                </>
              ) : (
                "Create Organizer Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-muted space-y-2">
            <p>
              Already have an organizer account?{" "}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Sign in
              </Link>
            </p>
            <p>
              Registering as attendee instead?{" "}
              <Link to="/register" className="font-semibold text-text-primary hover:underline">
                Sign up as Attendee
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
