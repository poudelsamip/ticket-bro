import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types";
import Spinner from "@/components/Spinner";

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
          ?.message ?? "Scan failed — invalid, cancelled, or unrecognized QR code";
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

  if (!isInitialized) return <Spinner label="Authenticating staff permissions..." />;

  if (!user || user.role !== "STAFF") {
    return (
      <div className="page-container--form">
        <div className="empty-state max-w-md w-full">
          <svg className="empty-state__icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
          </svg>
          <h2 className="empty-state__title">Staff Access Restricted</h2>
          <p className="empty-state__body">
            This terminal is restricted exclusively to authorized gate check-in staff members.
          </p>
          <Link to="/login" className="navbar__btn text-xs">
            Sign In with Staff Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container--narrow">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="navbar__role-tag !bg-accent-light !text-accent font-bold">
              Staff Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Ticket Gate Scanner
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Scan attendee digital QR codes or enter ticket string manually for instant gate verification
          </p>
        </div>
      </div>

      {/* Scanner Input Card */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="card card--padded shadow-md border-border bg-surface mb-8"
      >
        <label
          htmlFor="qr-input"
          className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-2"
        >
          Scan or Enter QR Code String
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="qr-input"
              type="text"
              autoFocus
              autoComplete="off"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="e.g. TKT-98F4-490B..."
              className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10"
            />
          </div>
          <button
            id="scan-submit-btn"
            type="submit"
            disabled={result.status === "loading" || !qrCode.trim()}
            className="py-3 px-6 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shrink-0"
          >
            {result.status === "loading" ? (
              <>
                <div className="spinner !w-3.5 !h-3.5 !border-white !border-t-transparent" />
                <span>Checking...</span>
              </>
            ) : (
              "Validate Pass"
            )}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-text-muted flex items-center gap-1.5">
          <span>💡</span> Focus this field when using physical handheld USB/Bluetooth barcode scanners.
        </p>
      </form>

      {/* Result Display */}
      {result.status === "success" && (
        <div className="card overflow-hidden border-2 border-success-border bg-success-bg p-6 sm:p-7 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-success border border-success-border flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-success tracking-tight">
                  {result.data.alreadyScanned ? "Ticket Already Checked In!" : "Valid Ticket — Access Granted"}
                </span>
                {result.data.alreadyScanned && (
                  <span className="status-pill status-pill--CANCELLED text-[10px]">
                    DUPLICATE
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 bg-white/70 p-4 rounded-xl border border-success-border/50 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-text-faint font-bold uppercase tracking-wider text-[10px]">Attendee</span>
                  <span className="font-bold text-sm text-text-primary">{result.data.ticket.holder}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-text-faint font-bold uppercase tracking-wider text-[10px]">Event</span>
                  <span className="font-semibold text-text-secondary truncate max-w-[220px]">{result.data.ticket.event}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-text-faint font-bold uppercase tracking-wider text-[10px]">Tier</span>
                  <span className="font-bold text-accent bg-accent-light px-2 py-0.5 rounded">{result.data.ticket.ticketType}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-text-faint font-bold uppercase tracking-wider text-[10px]">Timestamp</span>
                  <span className="text-text-muted font-mono">
                    {new Date(result.data.checkedInAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            id="scan-again-btn"
            onClick={handleReset}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-success text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-sm transition-all cursor-pointer"
          >
            Scan Next Attendee Pass →
          </button>
        </div>
      )}

      {result.status === "error" && (
        <div className="card overflow-hidden border-2 border-danger-border bg-danger-bg p-6 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-danger border border-danger-border flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-base font-extrabold text-danger tracking-tight">
                Scan Verification Failed
              </p>
              <p className="mt-1 text-xs font-medium text-danger/80 leading-relaxed">
                {result.message}
              </p>
            </div>
          </div>
          <button
            id="scan-retry-btn"
            onClick={handleReset}
            className="mt-5 w-full py-2.5 px-4 rounded-xl border border-danger-border bg-white text-xs font-bold text-danger hover:bg-danger-bg transition-colors cursor-pointer"
          >
            Try Scanning Again
          </button>
        </div>
      )}
    </div>
  );
}
