import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useEventStore } from "@/stores/event.store";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";

export default function HomePage() {
  const { events, isLoading, error, fetchEvents, searchEvents } =
    useEventStore();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (query: string) => {
    if (query) {
      void searchEvents(query);
      void navigate(`/events?search=${encodeURIComponent(query)}`);
    } else {
      void fetchEvents();
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-40">
      {/* Search */}
      <section className="flex justify-center py-20 sm:py-20">
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* Upcoming Events */}
      <section className="pb-16">
        <h2 className="mb-6 text-2xl text-text-primary">Upcoming Events</h2>

        {isLoading ? (
          <Spinner />
        ) : error ? (
          <p className="text-sm text-text-muted">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-text-muted">No events available yet</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}