import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

export default function RegisterPage() {
  const [role, setRole] = useState<"USER" | "ORGANIZER">("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const body =
      role === "USER"
        ? { role, email, password, fullName, phone }
        : { role, email, password, orgName };

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
    "w-full rounded-lg border border-text-primary/70 bg-white px-3 py-2 text-base text-text-primary placeholder:text-text-muted outline-none";
  const labelClass = "mb-1 block text-sm text-text-secondary";

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-3 py-6 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-4 text-xl text-text-primary">Register</h1>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-lg border border-text-primary/70 p-5"
        >
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(["USER", "ORGANIZER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`cursor-pointer rounded-lg border border-text-primary/70 py-2 text-base transition-colors ${
                  role === r
                    ? "bg-text-primary text-white"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                {r === "USER" ? "user" : "organizer"}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="register-email" className={labelClass}>
              email
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="register-password" className={labelClass}>
              password
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="min 8 characters"
            />
          </div>

          {role === "USER" ? (
            <>
              <div>
                <label htmlFor="register-fullname" className={labelClass}>
                  full name
                </label>
                <input
                  id="register-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="register-phone" className={labelClass}>
                  phone
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="98XXXXXXXX"
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="register-orgname" className={labelClass}>
                organization name
              </label>
              <input
                id="register-orgname"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className={inputClass}
                placeholder="Your Organization"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg border border-text-primary/70 py-2 text-base text-text-primary transition-colors hover:bg-text-primary hover:text-white disabled:opacity-40"
          >
            {isLoading ? "creating account..." : "register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-text-primary underline">
            login
          </Link>
        </p>
      </div>
    </div>
  );
}