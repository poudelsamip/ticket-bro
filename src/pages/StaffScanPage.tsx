import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types";

interface ScanResult {
  alreadyScanned: boolean;
  checkedInAt: string;
  ticket: {
    id: string;
    ticketType: string;
    event: string;
    holder: string;
  };
}

type ResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ScanResult }
  | { status: "error"; message: string };

export default function StaffScanPage() {
  const { user, isInitialized } = useAuthStore();
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const scan = async (code: string) => {
    if (!code.trim()) return;
    setResult({ status: "loading" });
    try {
      const { data } = await api.post<ApiResponse<ScanResult>>(
        "/staff/scan",
        { qrCode: code.trim() },
      );
      setResult({ status: "success", data: data.data });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Scan failed — invalid or unknown QR code";
      setResult({ status: "error", message: msg });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await scan(qrCode);
    setQrCode("");
  };

  const handleReset = () => {
    setResult({ status: "idle" });
    setQrCode("");
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "STAFF") {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="mb-4 text-[14px] text-text-secondary">
          This page is only accessible to staff members.
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

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Ticket Scanner</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enter a ticket QR code to check in an attendee.
        </p>
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mb-6 rounded-xl border border-border bg-white p-6 shadow-sm"
      >
        <label
          htmlFor="qr-input"
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          QR Code
        </label>
        <div className="flex gap-3">
          <input
            id="qr-input"
            type="text"
            autoFocus
            autoComplete="off"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Paste or scan QR code here…"
            className="flex-1 rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary font-mono"
          />
          <button
            id="scan-submit-btn"
            type="submit"
            disabled={result.status === "loading" || !qrCode.trim()}
            className="shrink-0 cursor-pointer rounded-lg bg-text-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {result.status === "loading" ? "…" : "Scan"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          Tip: if using a barcode scanner, focus this field and scan — it
          submits automatically.
        </p>
      </form>

      {/* Result */}
      {result.status === "success" && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-green-800">
                ✓ Check-In Successful
              </p>

              <div className="mt-3 space-y-1.5">
                <Row
                  label="Holder"
                  value={result.data.ticket.holder}
                  highlight
                />
                <Row label="Event" value={result.data.ticket.event} />
                <Row
                  label="Ticket type"
                  value={result.data.ticket.ticketType}
                />
                <Row
                  label="Checked in at"
                  value={new Date(result.data.checkedInAt).toLocaleString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                />
              </div>
            </div>
          </div>

          <button
            id="scan-again-btn"
            onClick={handleReset}
            className="mt-5 w-full cursor-pointer rounded-lg border border-current py-2 text-sm font-semibold transition-opacity hover:opacity-70"
          >
            Scan next ticket
          </button>
        </div>
      )}

      {result.status === "error" && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div>
              <p className="font-semibold text-red-800">Scan Failed</p>
              <p className="mt-1 text-sm text-red-700">{result.message}</p>
            </div>
          </div>
          <button
            id="scan-retry-btn"
            onClick={handleReset}
            className="mt-4 w-full cursor-pointer rounded-lg border border-red-400 py-2 text-sm font-semibold text-red-700 transition-opacity hover:opacity-70"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <span
        className={`text-sm ${highlight ? "font-semibold text-text-primary" : "text-text-secondary"}`}
      >
        {value}
      </span>
    </div>
  );
}
