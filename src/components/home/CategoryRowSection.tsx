import { Link } from "react-router";
import type { EventListItem } from "@/types";
import GradientEventCard from "./GradientEventCard";
import Spinner from "@/components/Spinner";

interface CategoryRowSectionProps {
  /** Events that match the category to show */
  events: EventListItem[];
  isLoading: boolean;
  /** Display title for this row, e.g. "Concerts & Music" */
  title: string;
  subtitle?: string;
  /** href for the "see all" link */
  seeAllHref: string;
  /** Starting color index offset for gradient cards */
  colorOffset?: number;
}

/**
 * A horizontally scrollable row of gradient event cards for a single category.
 * Rendered on the light background below the Selling Fast section.
 */
export default function CategoryRowSection({
  events,
  isLoading,
  title,
  subtitle,
  seeAllHref,
  colorOffset = 0,
}: CategoryRowSectionProps) {
  const displayed = events.slice(0, 8);

  if (!isLoading && displayed.length === 0) return null;

  return (
    <section className="bg-[#f4f5f7] py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <Link
            to={seeAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9930a] hover:text-[#e0b010] transition-colors whitespace-nowrap"
          >
            See all concerts
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <Spinner label="Loading…" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory scrollbar-hide">
            {displayed.map((event, i) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start"
              >
                <GradientEventCard event={event} colorIndex={(i + colorOffset) % 8} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
