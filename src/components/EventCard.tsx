import type { EventListItem } from "@/types";
import { Link } from "react-router";

interface EventCardProps {
  event: EventListItem;
}

export default function EventCard({ event }: EventCardProps) {
  const dateObj = new Date(event.date);
  const isValidDate = !isNaN(dateObj.getTime());

  const month = isValidDate
    ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : "TBD";
  const day = isValidDate
    ? dateObj.toLocaleDateString("en-US", { day: "numeric" })
    : "--";
  const year = isValidDate ? dateObj.getFullYear() : "";

  return (
    <Link to={`/events/${event.slug}`} className="event-card group">
      {/* Banner / Poster Image */}
      <div className="event-card__image">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            loading="lazy"
          />
        ) : (
          <div className="event-card__image-placeholder">
            <svg
              className="w-10 h-10 text-text-muted/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
              />
            </svg>
          </div>
        )}

        {/* Date Badge Overlay */}
        <div className="event-card__date-badge">
          <span className="event-card__date-badge-month">{month}</span>
          <span className="event-card__date-badge-day">{day}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="event-card__body">
        {/* Category & Year */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="event-card__category">
            {event.category.name}
          </span>
          {year && (
            <span className="text-[11px] font-medium text-text-faint">
              {year} • {event.startTime}
            </span>
          )}
        </div>

        {/* Event Title */}
        <h3 className="event-card__title">
          {event.title}
        </h3>

        {/* Organizer */}
        {event.organizer && (
          <p className="text-[12px] text-text-muted mb-3 flex items-center gap-1">
            <span>By</span>
            <span className="font-semibold text-text-secondary truncate">
              {event.organizer.orgName}
            </span>
          </p>
        )}

        {/* Venue Location */}
        {event.venue && (
          <div className="event-card__meta">
            <svg
              className="w-3.5 h-3.5 text-text-muted shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="truncate">
              {event.venue.name}{event.venue.district ? `, ${event.venue.district}` : ""}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
