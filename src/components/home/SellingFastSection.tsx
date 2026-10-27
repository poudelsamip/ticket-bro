import { Link } from "react-router";
import type { EventListItem } from "@/types";
import GradientEventCard from "./GradientEventCard";
import Spinner from "@/components/Spinner";

interface SellingFastSectionProps {
  events: EventListItem[];
  isLoading: boolean;
}

export default function SellingFastSection({ events, isLoading }: SellingFastSectionProps) {
  // Show the first 4 events as "selling fast"
  const featured = events.slice(0, 4);

  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="bg-[#0d0f14] py-16 sm:py-20">
      {/* Subtle top border accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#f5c518] mb-1">
              Going quickly
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Selling fast
            </h2>
            <p className="text-sm text-[#9aa0b4] mt-1">
              Grab your spot before they're gone.
            </p>
          </div>
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#f5c518] hover:text-[#e0b010] transition-colors"
          >
            See all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <Spinner label="Loading events…" />
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {featured.map((event, i) => (
              <GradientEventCard
                key={event.id}
                event={event}
                colorIndex={i + 4} /* offset so colors differ from upcoming section */
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
