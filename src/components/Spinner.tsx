interface SpinnerProps {
  label?: string;
  className?: string;
}

export default function Spinner({ label, className = "py-16" }: SpinnerProps) {
  return (
    <div className={`spinner-wrap flex-col gap-3 ${className}`}>
      <div className="spinner" />
      {label && <p className="text-xs font-medium text-text-muted">{label}</p>}
    </div>
  );
}
