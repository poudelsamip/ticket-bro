import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
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

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  const currentSearch = searchParams.get("search");

  return (
    <div className="page-container">
      {/* Breadcrumb & Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-text-muted">
        <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-text-primary font-semibold">Events Directory</span>
      </div>

      {/* Header with Search */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Explore Events
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Find and secure passes to concerts, festivals, conferences, and more.
          </p>
        </div>
        <div className="w-full lg:w-auto">
          <SearchBar onSearch={handleSearch} placeholder="Filter by event name or keyword..." />
        </div>
      </div>

      {/* Active Search Query Tag */}
      {currentSearch && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs text-text-muted">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-semibold border border-accent-subtle">
            "{currentSearch}"
            <button
              onClick={clearSearch}
              className="hover:text-danger ml-0.5 font-bold cursor-pointer"
              title="Remove filter"
            >
              ×
            </button>
          </span>
          <button
            onClick={clearSearch}
            className="text-xs text-text-muted hover:text-text-primary underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Event Grid / State Handling */}
      {isLoading ? (
        <Spinner label="Finding events matching your criteria..." />
      ) : error ? (
        <div className="rounded-xl border border-danger-border bg-danger-bg p-8 text-center max-w-lg mx-auto">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={() => void fetchEvents()}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-danger text-white hover:opacity-90"
          >
            Reload Events
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <svg
            className="empty-state__icon"
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
          <h3 className="empty-state__title">No events found</h3>
          <p className="empty-state__body">
            {currentSearch
              ? `We couldn't find any events matching "${currentSearch}". Try a different keyword.`
              : "There are currently no scheduled events. Please check back later!"}
          </p>
          {currentSearch && (
            <button
              onClick={clearSearch}
              className="navbar__btn text-xs"
            >
              Show All Events
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-3 pt-6 border-t border-border">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-secondary hover:border-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      p === pagination.page
                        ? "bg-primary text-white"
                        : "text-text-muted hover:bg-surface-secondary hover:text-text-primary border border-border"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-text-secondary hover:border-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
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
