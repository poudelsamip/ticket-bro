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
    "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary";
  const labelClass = "mb-1.5 block text-sm font-medium text-text-secondary";

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-3 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Join as an attendee to discover and book events
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
            <label htmlFor="user-fullname" className={labelClass}>
              Full name
            </label>
            <input
              id="user-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="user-email" className={labelClass}>
              Email address
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="user-phone" className={labelClass}>
              Phone number
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
              placeholder="Min 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg bg-text-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? "Creating account..." : "Create account"}
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
              to="/register/organizer"
              className="font-medium text-text-primary underline"
            >
              Register as organizer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
