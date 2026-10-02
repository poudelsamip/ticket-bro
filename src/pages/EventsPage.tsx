import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useEventStore } from "@/stores/event.store";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";

export default function EventsPage() {
  const {
    events,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchEvents,
  } = useEventStore();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search") ?? undefined;
    const page = Number(searchParams.get("page")) || 1;
    setFilters({ search, page });
  }, [searchParams, setFilters]);

  useEffect(() => {
    void fetchEvents();
  }, [filters, fetchEvents]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Events
          </h1>
          <p className="mt-1 text-[13px] text-text-muted">
            Browse all upcoming events
          </p>
        </div>
        <SearchBar onSearch={handleSearch} placeholder="Search events..." />
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-lg border border-border bg-surface-secondary py-16 text-center">
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border bg-surface-secondary py-20 text-center">
          <svg
            className="mb-4 h-10 w-10 text-text-muted/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="text-sm font-medium text-text-secondary">
            No events found
          </p>
          <p className="mt-1 text-[13px] text-text-muted">
            Try adjusting your search
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="cursor-pointer rounded-md border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-[13px] font-medium tabular-nums text-text-muted">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="cursor-pointer rounded-md border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary transition-all hover:border-text-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
