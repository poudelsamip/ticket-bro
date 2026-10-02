import type { EventListItem } from "@/types";
import { Link } from "react-router";

interface EventCardProps {
  event: EventListItem;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const eventYear = new Date(event.date).getFullYear();

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-white transition-all duration-300 hover:border-text-muted hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      {/* Banner */}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-surface-secondary">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50">
            <svg
              className="h-8 w-8 text-text-muted/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Category & Date row */}
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-primary-50 mx-[-6px] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
            {event.category.name}
          </span>
          <span className="text-[12px] font-medium tabular-nums">
            {eventDate}, {eventYear}
          </span>
        </div>

        <h3 className="mb-2.5 text-[15px] font-semibold leading-snug text-text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
          {event.title}
        </h3>

        {event.venue && (
          <div className="flex items-center gap-1.5 text-[12px]">
            <svg
              className="h-3 w-3 shrink-0"
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
              {event.venue.name}, {event.venue.district}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
