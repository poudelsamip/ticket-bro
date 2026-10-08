import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router";
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
  const [seatingType, setSeatingType] = useState<"GENERAL" | "BLOCK">(
    "GENERAL"
  );
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
      void navigate("/events");
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
    "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary";
  const labelClass = "mb-1.5 block text-sm font-medium text-text-secondary";
  const sectionTitle = "text-sm font-semibold text-text-primary mb-3";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">
          Create Event
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Fill in the details below to publish a new event
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-8"
      >
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className={sectionTitle}>Basic Information</h2>

          <div>
            <label htmlFor="event-title" className={labelClass}>
              Event title
            </label>
            <input
              id="event-title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Summer Music Festival"
            />
          </div>

          <div>
            <label htmlFor="event-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="event-description"
              required
              maxLength={1000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Describe your event..."
            />
          </div>

          <div>
            <label htmlFor="event-category" className={labelClass}>
              Category
            </label>
            <select
              id="event-category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {categories.length === 0 && (
                <option value="">Loading categories...</option>
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
            label="Banner Image"
            value={bannerUrl}
            onFileSelect={(file) => {
              setBannerFile(file);
              if (!file) setBannerUrl("");
            }}
          />
        </section>

        {/* Date & Time */}
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className={sectionTitle}>Date & Time</h2>

          <div>
            <label htmlFor="event-date" className={labelClass}>
              Date
            </label>
            <input
              id="event-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-start" className={labelClass}>
                Start time
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
                End time
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
        </section>

        {/* Venue */}
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className={sectionTitle}>Venue</h2>

          <div>
            <label htmlFor="venue-name" className={labelClass}>
              Venue name
            </label>
            <input
              id="venue-name"
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Dashrath Rangashala"
            />
          </div>

          <div>
            <label htmlFor="venue-address" className={labelClass}>
              Address
            </label>
            <input
              id="venue-address"
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className={inputClass}
              placeholder="Full address"
            />
          </div>

          <div>
            <label htmlFor="venue-district" className={labelClass}>
              District
            </label>
            <input
              id="venue-district"
              type="text"
              value={venueDistrict}
              onChange={(e) => setVenueDistrict(e.target.value)}
              className={inputClass}
              placeholder="e.g. Kathmandu"
            />
          </div>

          <div>
            <label htmlFor="venue-gmaps" className={labelClass}>
              Google Maps link
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
        </section>

        {/* Tickets */}
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className={sectionTitle}>Tickets</h2>

          <div>
            <label className={labelClass}>Seating type</label>
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
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    seatingType === type
                      ? "border-text-primary bg-text-primary text-white"
                      : "border-border-light text-text-secondary hover:border-text-muted"
                  }`}
                >
                  {type === "GENERAL" ? "General Admission" : "Block / Section"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {ticketTypes.map((ticket, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-surface-secondary p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    {seatingType === "GENERAL"
                      ? "General Admission"
                      : `Block ${index + 1}`}
                  </span>
                  {seatingType === "BLOCK" && ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className="cursor-pointer text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div
                  className={`grid gap-3 ${
                    seatingType === "BLOCK" ? "grid-cols-3" : "grid-cols-2"
                  }`}
                >
                  {seatingType === "BLOCK" && (
                    <div>
                      <label className="mb-1 block text-xs text-text-muted">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={ticket.name}
                        onChange={(e) =>
                          updateTicket(index, "name", e.target.value)
                        }
                        className={inputClass}
                        placeholder="e.g. VIP"
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">
                      Price (NPR)
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
                    <label className="mb-1 block text-xs text-text-muted">
                      Capacity
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
                className="w-full cursor-pointer rounded-lg border border-dashed border-border-light py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-text-muted hover:text-text-secondary"
              >
                + Add block
              </button>
            )}
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-lg bg-text-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isSubmitting ? "Creating event..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
