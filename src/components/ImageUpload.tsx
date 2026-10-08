import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type DragEvent,
} from "react";

interface ImageUploadProps {
  /** Committed image URL — used to show an existing banner (e.g. on EditEventPage) */
  value: string;
  /** Called with the selected File when the user picks one, or null when cleared */
  onFileSelect: (file: File | null) => void;
  label?: string;
  id?: string;
}

export default function ImageUpload({
  value,
  onFileSelect,
  label = "Banner Image",
  id = "image-upload",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  /** Local object URL for instant preview — created from the picked File */
  const [previewUrl, setPreviewUrl] = useState("");

  // Revoke the object URL when the component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");
    // Revoke previous local preview
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

  // Show local preview first, fall back to the committed URL from props
  const displayUrl = previewUrl || value;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text-secondary"
      >
        {label}
      </label>

      {displayUrl ? (
        /* Preview */
        <div className="relative overflow-hidden rounded-xl border border-border-light bg-surface-secondary">
          <img
            src={displayUrl}
            alt="Banner preview"
            className="h-44 w-full object-cover"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-text-primary shadow transition hover:bg-gray-100"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700"
            >
              Remove
            </button>
          </div>
          {previewUrl && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
              Pending upload
            </span>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          id={id}
          onDrop={handleDrop}
          onDragOver={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
            dragging
              ? "border-text-primary bg-gray-50"
              : "border-border-light bg-surface-secondary hover:border-text-muted"
          }`}
        >
          <svg
            className="h-8 w-8 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-text-secondary">
              Click or drag &amp; drop to upload
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              JPEG, PNG, WebP, GIF · max 5 MB · uploaded on submit
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

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
