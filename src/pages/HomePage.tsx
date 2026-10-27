import { useEffect, useState } from "react";
import { useEventStore } from "@/stores/event.store";
import HeroSection from "@/components/home/HeroSection";
import UpcomingEventsSection from "@/components/home/UpcomingEventsSection";
import SellingFastSection from "@/components/home/SellingFastSection";
import CategoryRowSection from "@/components/home/CategoryRowSection";
import HostCallout from "@/components/home/HostCallout";

export default function HomePage() {
  const { events, isLoading, error, fetchEvents, searchEvents, setFilters } =
    useEventStore();

  const [showNotice, setShowNotice] = useState(true);

  // Load all upcoming events on mount
  useEffect(() => {
    setFilters({ limit: 20, page: 1, search: undefined });
    void fetchEvents();
  }, [fetchEvents, setFilters]);

  const handleSearch = (query: string) => {
    if (query) {
      void searchEvents(query);
    } else {
      void fetchEvents();
    }
  };

  const handleCategoryFilter = (category: string) => {
    if (category) {
      void searchEvents(category);
    } else {
      setFilters({ search: undefined, page: 1 });
      void fetchEvents();
    }
  };

  // Derive a "concerts & music" subset by category name matching
  const concertEvents = events.filter(
    (e) =>
      e.category.name.toLowerCase().includes("concert") ||
      e.category.name.toLowerCase().includes("music") ||
      e.category.slug.toLowerCase().includes("concert") ||
      e.category.slug.toLowerCase().includes("music")
  );

  return (
    <div className="w-full">
      {/* Demo notice banner */}
      {showNotice && (
        <div className="bg-[#0d0f14] border-b border-white/10 py-2 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#9aa0b4]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] uppercase tracking-wider bg-[#f5c518]/10 text-[#f5c518] px-2 py-0.5 rounded">
                Demo Notice
              </span>
              <span>
                Events listed are for demonstration purposes. Tickets are simulated and not valid for actual entry.
              </span>
            </div>
            <button
              onClick={() => setShowNotice(false)}
              className="text-[#9aa0b4] hover:text-white ml-4 text-xs font-bold cursor-pointer"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. Dark hero with search */}
      <HeroSection onSearch={handleSearch} />

      {/* 2. Upcoming events with category filter tabs */}
      <UpcomingEventsSection
        events={events}
        isLoading={isLoading}
        error={error}
        onRetry={() => void fetchEvents()}
        onCategoryFilter={handleCategoryFilter}
      />

      {/* 3. Selling fast — dark section, shows first 4 events */}
      <SellingFastSection events={events} isLoading={isLoading} />

      {/* 4. Concerts & Music category row (only shown if we have matching events) */}
      {(isLoading || concertEvents.length > 0) && (
        <CategoryRowSection
          events={concertEvents.length > 0 ? concertEvents : events}
          isLoading={isLoading}
          title="Concerts & Music"
          subtitle="In sync from festivals across ticket.bro platform."
          seeAllHref="/events?search=concerts"
          colorOffset={2}
        />
      )}

      {/* 5. Amber "Hosting an event?" CTA */}
      <HostCallout />
    </div>
  );
}
