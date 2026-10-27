import { Link } from "react-router";
import type { EventListItem } from "@/types";

interface GradientEventCardProps {
  event: EventListItem;
  colorIndex: number;
}

const BG_CLASSES = [
  "gradient-card--bg-1",
  "gradient-card--bg-2",
  "gradient-card--bg-3",
  "gradient-card--bg-4",
  "gradient-card--bg-5",
  "gradient-card--bg-6",
  "gradient-card--bg-7",
  "gradient-card--bg-8",
];

/**
 * Colorful gradient event card used in the "Upcoming Events" grid
 * and "Selling Fast" section.
 */
export default function GradientEventCard({ event, colorIndex }: GradientEventCardProps) {
  const dateObj = new Date(event.date);
  const isValidDate = !isNaN(dateObj.getTime());
  const month = isValidDate ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "TBD";
  const day = isValidDate ? dateObj.toLocaleDateString("en-US", { day: "numeric" }) : "--";

  const bgClass = BG_CLASSES[colorIndex % BG_CLASSES.length];

  // Derive a lowest price from ticketTypes (not available in list; show free if 0)
  // EventListItem does NOT include ticketTypes, so we skip price for list cards.

  return (
    <Link to={`/events/${event.slug}`} className={`gradient-card ${bgClass}`}>
      <div className="gradient-card__overlay" />

      {/* Date badge */}
      <div className="gradient-card__date-badge">
        <span className="gradient-card__date-month">{month}</span>
        <span className="gradient-card__date-day">{day}</span>
      </div>

      {/* Banner image (if available) */}
      {event.bannerUrl && (
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Content */}
      <div className="gradient-card__content">
        <span className="gradient-card__cat">{event.category.name}</span>
        <h3 className="gradient-card__title">{event.title}</h3>

        {event.venue && (
          <div className="gradient-card__meta">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="truncate">{event.venue.district || event.venue.name}</span>
          </div>
        )}

        <div className="gradient-card__price mt-2">
          <span className="gradient-card__meta">{event.startTime}</span>
          <span className="gradient-card__cta">→</span>
        </div>
      </div>
    </Link>
  );
}
