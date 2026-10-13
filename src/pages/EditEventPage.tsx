import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import { useOrganizerStore } from "@/stores/organizer.store";
import api from "@/lib/api";
import type { EventCategory, ApiResponse } from "@/types";
import Spinner from "@/components/Spinner";
import ImageUpload from "@/components/ImageUpload";

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"] as const;

function toDateInputValue(isoDate: string) {
  // isoDate may be "2026-10-10T00:00:00.000Z" or "2026-10-10"
  return isoDate.slice(0, 10);
}

function toTimeInputValue(isoString?: string | null) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EditEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isInitialized } = useAuthStore();
  const { currentEvent, isLoading, fetchOrgEventBySlug } = useOrganizerStore();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state — seeded from currentEvent once loaded
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("DRAFT");

  // Venue
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueDistrict, setVenueDistrict] = useState("");
  const [venueGoogleMaps, setVenueGoogleMaps] = useState("");

  const [seeded, setSeeded] = useState(false);

  // Redirect non-organizers
  useEffect(() => {
    if (isInitialized && (!user || user.role !== "ORGANIZER")) {
      void navigate("/");
    }
  }, [user, isInitialized, navigate]);

  // Load event data
  useEffect(() => {
    if (isInitialized && user?.role === "ORGANIZER" && slug) {
      void fetchOrgEventBySlug(slug);
    }
  }, [isInitialized, user, slug, fetchOrgEventBySlug]);

  // Seed form once event is loaded
  useEffect(() => {
    if (currentEvent && currentEvent.slug === slug && !seeded) {
      setTitle(currentEvent.title);
      setDescription(currentEvent.description);
      setStatus(currentEvent.status);
      setBannerUrl(currentEvent.bannerUrl ?? "");
      setDate(toDateInputValue(currentEvent.date));
      if (currentEvent.startTime) {
        setStartTime(toTimeInputValue(currentEvent.startTime));
      }
      if (currentEvent.endTime) {
        setEndTime(toTimeInputValue(currentEvent.endTime));
      }
      if (currentEvent.venue) {
        setVenueName(currentEvent.venue.name);
        setVenueAddress(currentEvent.venue.address);
        setVenueDistrict(currentEvent.venue.district);
        setVenueGoogleMaps(currentEvent.venue.googleMaps ?? "");
      }
      setSeeded(true);
    }
  }, [currentEvent, slug, seeded]);

  // Fetch categories
  useEffect(() => {
    api
      .get<ApiResponse<{ categories: EventCategory[] }>>("/categories")
      .then((res) => {
        setCategories(res.data.data.categories);
        // Set categoryId: prefer matching by name (since OrgEventDetail only has name)
        if (currentEvent && res.data.data.categories.length > 0) {
          const match = res.data.data.categories.find(
            (c) => c.name === currentEvent.category.name
          );
          setCategoryId(match?.id ?? res.data.data.categories[0].id);
        } else if (res.data.data.categories.length > 0) {
          setCategoryId(res.data.data.categories[0].id);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent?.category.name]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const minDate = getTodayDateString();
    if (date && date < minDate) {
      setError("Event date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);

    // Upload banner image first if a new file was selected
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

    const body: Record<string, unknown> = {};

    if (title.trim()) body.title = title.trim();
    if (description.trim()) body.description = description.trim();
    if (categoryId) body.categoryId = categoryId;
    if (status) body.status = status;
    if (resolvedBannerUrl.trim()) body.bannerUrl = resolvedBannerUrl.trim();
    if (date) body.date = date;
    if (startTime) {
      body.startTime = new Date(`${date}T${startTime}`).toISOString();
    }
    if (endTime) {
      body.endTime = new Date(`${date}T${endTime}`).toISOString();
    }
    if (venueName.trim() || venueAddress.trim() || venueDistrict.trim()) {
      body.venue = {
        name: venueName,
        address: venueAddress,
        district: venueDistrict,
        ...(venueGoogleMaps.trim() ? { googleMaps: venueGoogleMaps } : {}),
      };
    }

    if (!currentEvent) return;

    try {
      const res = await api.patch<{ data: { slug?: string } }>(
        `/event/${currentEvent.id}`,
        body
      );
      const targetSlug = res.data?.data?.slug || currentEvent.slug || slug;
      setSuccess(true);
      // Refresh store so detail page is up to date
      if (targetSlug) {
        void fetchOrgEventBySlug(targetSlug);
        setTimeout(() => void navigate(`/organizer/events/${targetSlug}`), 800);
      }
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const resp = (err as { response: { data?: { message?: string } } })
          .response;
        setError(resp.data?.message ?? "Failed to update event");
      } else {
        setError("Failed to update event");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isInitialized || isLoading || !seeded) return <Spinner />;
  if (!currentEvent) return null;

  const inputClass =
    "w-full rounded-lg border border-border-light bg-white px-4 py-2.5 text-base text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-text-primary";
  const labelClass = "mb-1.5 block text-sm font-medium text-text-secondary";
  const sectionTitle = "text-sm font-semibold text-text-primary mb-3";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        to={`/organizer/events/${currentEvent?.slug ?? slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Back to event
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Edit Event</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Update the details for <span className="font-medium">{currentEvent.title}</span>
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">
            Event updated successfully! Redirecting…
          </div>
        )}

        {/* Basic Info */}
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className={sectionTitle}>Basic Information</h2>

          <div>
            <label htmlFor="edit-title" className={labelClass}>
              Event title
            </label>
            <input
              id="edit-title"
              type="text"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Summer Music Festival"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="edit-description"
              maxLength={1000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Describe your event..."
            />
          </div>

          <div>
            <label htmlFor="edit-category" className={labelClass}>
              Category
            </label>
            <select
              id="edit-category"
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
            id="edit-banner"
            label="Banner Image"
            value={bannerUrl}
            onFileSelect={(file) => {
              setBannerFile(file);
              if (!file) setBannerUrl("");
            }}
          />

          <div>
            <label htmlFor="edit-status" className={labelClass}>
              Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])
              }
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Date & Time */}
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className={sectionTitle}>Date & Time</h2>

          <div>
            <label htmlFor="edit-date" className={labelClass}>
              Date
            </label>
            <input
              id="edit-date"
              type="date"
              min={getTodayDateString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-start" className={labelClass}>
                Start time
              </label>
              <input
                id="edit-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="edit-end" className={labelClass}>
                End time
              </label>
              <input
                id="edit-end"
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
            <label htmlFor="edit-venue-name" className={labelClass}>
              Venue name
            </label>
            <input
              id="edit-venue-name"
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Dashrath Rangashala"
            />
          </div>

          <div>
            <label htmlFor="edit-venue-address" className={labelClass}>
              Address
            </label>
            <input
              id="edit-venue-address"
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className={inputClass}
              placeholder="Full address"
            />
          </div>

          <div>
            <label htmlFor="edit-venue-district" className={labelClass}>
              District
            </label>
            <input
              id="edit-venue-district"
              type="text"
              value={venueDistrict}
              onChange={(e) => setVenueDistrict(e.target.value)}
              className={inputClass}
              placeholder="e.g. Kathmandu"
            />
          </div>

          <div>
            <label htmlFor="edit-venue-gmaps" className={labelClass}>
              Google Maps link
            </label>
            <input
              id="edit-venue-gmaps"
              type="url"
              value={venueGoogleMaps}
              onChange={(e) => setVenueGoogleMaps(e.target.value)}
              className={inputClass}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          id="edit-event-submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-lg bg-text-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isSubmitting ? "Saving changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
