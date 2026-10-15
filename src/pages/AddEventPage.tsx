import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/lib/api";
import type { EventCategory, ApiResponse } from "@/types";
import ImageUpload from "@/components/ImageUpload";

interface TicketTypeInput {
  name: string;
  price: string;
  total: string;
}

const emptyTicket = (): TicketTypeInput => ({
  name: "",
  price: "",
  total: "",
});

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddEventPage() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const navigate = useNavigate();

  // Redirect non-organizers
  useEffect(() => {
    if (isInitialized && (!user || user.role !== "ORGANIZER")) {
      void navigate("/");
    }
  }, [user, isInitialized, navigate]);

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [seatingType, setSeatingType] = useState<"GENERAL" | "BLOCK">("GENERAL");
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>([
    emptyTicket(),
  ]);

  // Venue
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueDistrict, setVenueDistrict] = useState("");
  const [venueGoogleMaps, setVenueGoogleMaps] = useState("");

  // Fetch categories
  useEffect(() => {
    api
      .get<ApiResponse<{ categories: EventCategory[] }>>("/categories")
      .then((res) => {
        setCategories(res.data.data.categories);
        if (res.data.data.categories.length > 0) {
          setCategoryId(res.data.data.categories[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const updateTicket = (
    index: number,
    field: keyof TicketTypeInput,
    value: string
  ) => {
    setTicketTypes((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addTicket = () => setTicketTypes((prev) => [...prev, emptyTicket()]);

  const removeTicket = (index: number) => {
    if (ticketTypes.length <= 1) return;
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const minDate = getTodayDateString();
    if (date < minDate) {
      setError("Event date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);

    // Upload banner image first if a file was selected
    let resolvedBannerUrl = bannerUrl;
    if (bannerFile) {
      try {
        const formData = new FormData();
        formData.append("image", bannerFile);
        const uploadRes = await api.post<{ data: { url: string } }>(
          "/upload/image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        resolvedBannerUrl = uploadRes.data.data.url;
      } catch {
        setError("Image upload failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    // Build ISO datetimes from date + time
    const startISO = new Date(`${date}T${startTime}`).toISOString();
    const endISO = endTime
      ? new Date(`${date}T${endTime}`).toISOString()
      : undefined;

    const body: Record<string, unknown> = {
      title,
      description,
      categoryId,
      date,
      startTime: startISO,
      endTime: endISO,
      seatingType,
      ticketTypes: ticketTypes.map((t) => ({
        ...(seatingType === "BLOCK" && t.name ? { name: t.name } : {}),
        price: Number(t.price),
        total: Number(t.total),
      })),
    };

    if (resolvedBannerUrl.trim()) body.bannerUrl = resolvedBannerUrl.trim();

    if (venueName.trim() || venueAddress.trim() || venueDistrict.trim()) {
      body.venue = {
        name: venueName,
        address: venueAddress,
        district: venueDistrict,
        ...(venueGoogleMaps.trim() ? { googleMaps: venueGoogleMaps } : {}),
      };
    }

    try {
      await api.post("/event", body);
      void navigate("/organizer/events");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const resp = (err as { response: { data?: { message?: string } } })
          .response;
        setError(resp.data?.message ?? "Failed to create event");
      } else {
        setError("Failed to create event");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "ORGANIZER") {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint outline-none transition-all focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/10";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5";
  const sectionTitle = "text-base font-bold text-text-primary mb-4 pb-2 border-b border-border flex items-center gap-2";

  return (
    <div className="page-container--narrow">
      {/* Back button */}
      <Link to="/organizer/events" className="back-link">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to my events
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="navbar__role-tag !bg-accent-light !text-accent font-bold">
            New Listing
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          Publish a New Event
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Fill out the event details, venue coordinates, and configure ticket allocations
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-danger-bg border border-danger-border text-xs font-semibold text-danger flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <div className="card card--padded bg-surface border-border shadow-xs">
          <h2 className={sectionTitle}>
            <span>1. Basic Information</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="event-title" className={labelClass}>
                Event Title *
              </label>
              <input
                id="event-title"
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g. Nepal International Music Festival 2026"
              />
            </div>

            <div>
              <label htmlFor="event-description" className={labelClass}>
                Description & Agenda *
              </label>
              <textarea
                id="event-description"
                required
                maxLength={1000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="Write compelling details about the artists, schedule, entry requirements, and age restrictions..."
              />
            </div>

            <div>
              <label htmlFor="event-category" className={labelClass}>
                Event Category *
              </label>
              <select
                id="event-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                {categories.length === 0 && (
                  <option value="">Loading available categories...</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <ImageUpload
              id="event-banner"
              label="Event Banner / Poster"
              value={bannerUrl}
              onFileSelect={(file) => {
                setBannerFile(file);
                if (!file) setBannerUrl("");
              }}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="card card--padded bg-surface border-border shadow-xs">
          <h2 className={sectionTitle}>
            <span>2. Schedule & Timeline</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="event-date" className={labelClass}>
                Event Date *
              </label>
              <input
                id="event-date"
                type="date"
                required
                min={getTodayDateString()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-start" className={labelClass}>
                  Start Time *
                </label>
                <input
                  id="event-start"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="event-end" className={labelClass}>
                  End Time (Optional)
                </label>
                <input
                  id="event-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="card card--padded bg-surface border-border shadow-xs">
          <h2 className={sectionTitle}>
            <span>3. Venue Coordinates</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="venue-name" className={labelClass}>
                Venue / Stadium / Hall Name
              </label>
              <input
                id="venue-name"
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Dasarath Stadium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="venue-address" className={labelClass}>
                  Street Address
                </label>
                <input
                  id="venue-address"
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Tripureshwor, Ring Road"
                />
              </div>
              <div>
                <label htmlFor="venue-district" className={labelClass}>
                  District / City
                </label>
                <input
                  id="venue-district"
                  type="text"
                  value={venueDistrict}
                  onChange={(e) => setVenueDistrict(e.target.value)}
                  className={inputClass}
                  placeholder="Kathmandu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="venue-gmaps" className={labelClass}>
                Google Maps URL
              </label>
              <input
                id="venue-gmaps"
                type="url"
                value={venueGoogleMaps}
                onChange={(e) => setVenueGoogleMaps(e.target.value)}
                className={inputClass}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="card card--padded bg-surface border-border shadow-xs">
          <h2 className={sectionTitle}>
            <span>4. Ticket Inventory & Pricing</span>
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Seating Structure</label>
              <div className="flex gap-2">
                {(["GENERAL", "BLOCK"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSeatingType(type);
                      if (type === "GENERAL") {
                        setTicketTypes([emptyTicket()]);
                      }
                    }}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      seatingType === type
                        ? "border-accent bg-accent text-white shadow-xs"
                        : "border-border bg-surface-secondary text-text-muted hover:border-text-muted"
                    }`}
                  >
                    {type === "GENERAL" ? "General Admission" : "Multi-Tier / Reserved"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface-secondary p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                      {seatingType === "GENERAL"
                        ? "Standard Pass Tier"
                        : `Section / Tier #${index + 1}`}
                    </span>
                    {seatingType === "BLOCK" && ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicket(index)}
                        className="text-xs font-semibold text-danger hover:underline cursor-pointer"
                      >
                        Remove Tier
                      </button>
                    )}
                  </div>

                  <div
                    className={`grid gap-3 ${
                      seatingType === "BLOCK" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
                    }`}
                  >
                    {seatingType === "BLOCK" && (
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-text-faint uppercase">
                          Tier Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={ticket.name}
                          onChange={(e) =>
                            updateTicket(index, "name", e.target.value)
                          }
                          className={inputClass}
                          placeholder="e.g. VIP Front Row"
                        />
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-text-faint uppercase">
                        Price (NPR) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={ticket.price}
                        onChange={(e) =>
                          updateTicket(index, "price", e.target.value)
                        }
                        className={inputClass}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-bold text-text-faint uppercase">
                        Ticket Capacity *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={ticket.total}
                        onChange={(e) =>
                          updateTicket(index, "total", e.target.value)
                        }
                        className={inputClass}
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {seatingType === "BLOCK" && (
                <button
                  type="button"
                  onClick={addTicket}
                  className="w-full cursor-pointer rounded-xl border-2 border-dashed border-border py-3 text-xs font-bold text-accent hover:border-accent hover:bg-accent-light/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>+</span> Add Another Ticket Tier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
              <span>Publishing Event...</span>
            </>
          ) : (
            "Publish Event to Catalog"
          )}
        </button>
      </form>
    </div>
  );
}
