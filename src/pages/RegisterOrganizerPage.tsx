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
    "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary";
  const labelClass = "mb-1.5 block text-sm font-medium text-text-secondary";

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-3 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">
            Register as Organizer
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Create and manage events for your audience
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
            <label htmlFor="org-name" className={labelClass}>
              Organization name
            </label>
            <input
              id="org-name"
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={inputClass}
              placeholder="Your Organization"
            />
          </div>

          <div>
            <label htmlFor="org-email" className={labelClass}>
              Login email
            </label>
            <input
              id="org-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@organization.com"
            />
          </div>

          <div>
            <label htmlFor="org-password" className={labelClass}>
              Password
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

          <div>
            <label htmlFor="org-contact-email" className={labelClass}>
              Contact email
            </label>
            <input
              id="org-contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
              placeholder="contact@org.com"
            />
          </div>

          <div>
            <label htmlFor="org-contact-phone" className={labelClass}>
              Contact phone
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

          <div>
            <label htmlFor="org-website" className={labelClass}>
              Website
            </label>
            <input
              id="org-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClass}
              placeholder="https://yourorganization.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg bg-text-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? "Creating account..." : "Create organizer account"}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center text-sm text-text-secondary">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-text-primary underline"
            >
              Sign in
            </Link>
          </p>
          <p>
            <Link
              to="/register"
              className="font-medium text-text-primary underline"
            >
              Register as attendee
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
