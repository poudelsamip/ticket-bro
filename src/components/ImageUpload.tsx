import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type DragEvent,
} from "react";

interface ImageUploadProps {
  value: string;
  onFileSelect: (file: File | null) => void;
  label?: string;
  id?: string;
}

export default function ImageUpload({
  value,
  onFileSelect,
  label = "Event Poster / Banner Image",
  id = "image-upload",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF image files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds the 5 MB limit.");
      return;
    }

    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = previewUrl || value;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5"
      >
        {label}
      </label>

      {displayUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border shadow-sm group aspect-[21/9] sm:aspect-[24/9] bg-surface-secondary">
          <img
            src={displayUrl}
            alt="Banner preview"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
          {/* Glass overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 backdrop-blur-xs opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-white/90 text-text-primary text-xs font-bold shadow-md hover:bg-white transition-all cursor-pointer"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-lg bg-danger text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Remove
            </button>
          </div>
          {previewUrl && (
            <span className="absolute bottom-2.5 right-2.5 rounded-full bg-accent text-white font-bold text-[10px] px-2.5 py-0.5 shadow-sm">
              Ready to Upload
            </span>
          )}
        </div>
      ) : (
        <div
          id={id}
          onDrop={handleDrop}
          onDragOver={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${
            dragging
              ? "border-accent bg-accent-light/50"
              : "border-border bg-surface-secondary hover:border-accent hover:bg-surface-secondary/80"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted shadow-xs">
            <svg
              className="h-6 w-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-text-primary">
              Click to select or drag & drop poster
            </p>
            <p className="mt-1 text-[11px] text-text-muted">
              JPEG, PNG, WebP or GIF • Maximum 5 MB
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
