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
      void navigate("/");
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
        setError("Login failed");
      }
    }
  };

  const inputClass =
    "w-full rounded-lg border border-text-primary/70 bg-white px-3 py-2 text-base text-text-primary placeholder:text-text-muted outline-none";

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-3 sm:px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-4 text-xl text-text-primary">Login</h1>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-lg border border-text-primary/70 p-5"
        >
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-sm text-text-secondary"
            >
              email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-sm text-text-secondary"
            >
              password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-lg border border-text-primary/70 py-2 text-base text-text-primary transition-colors hover:bg-text-primary hover:text-white disabled:opacity-40"
          >
            {isLoading ? "signing in..." : "login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-text-primary underline">
            register
          </Link>
        </p>
      </div>
    </div>
  );
}