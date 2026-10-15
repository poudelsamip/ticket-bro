import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useEventStore } from "@/stores/event.store";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";

export default function HomePage() {
  const { events, isLoading, error, fetchEvents, searchEvents } = useEventStore();
  const navigate = useNavigate();
  const [showNotice, setShowNotice] = useState(true);

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

  const quickCategories = ["Music", "Conferences", "Festivals", "Sports", "Workshops"];

  return (
    <div className="w-full pb-20">
      {/* Disclaimer / Demo Notice Banner */}
      {showNotice && (
        <div className="bg-primary-50 border-b border-border py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded">
                Demo Notice
              </span>
              <span>
                Events listed are for demonstration purposes only. Tickets are simulated and not valid for actual entry.
              </span>
            </div>
            <button
              onClick={() => setShowNotice(false)}
              className="text-text-muted hover:text-text-primary ml-4 text-xs font-semibold"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface to-surface-secondary border-b border-border pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15] mb-6">
            Find and experience <br className="hidden sm:inline" />
            <span className="text-accent underline decoration-accent/30 decoration-wavy decoration-2">
              unforgettable events.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary mb-10 leading-relaxed">
            Discover concerts, festivals, comedy shows, and workshops. Book verified tickets instantly and access your digital QR passes anytime.
          </p>

          {/* Search Bar in Hero */}
          <div className="flex justify-center mb-6">
            <SearchBar onSearch={handleSearch} placeholder="Search concerts, festivals, artists, or venues..." />
          </div>

          {/* Quick Categories */}
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-text-muted">
            <span className="font-semibold text-text-secondary">Popular:</span>
            {quickCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleSearch(cat)}
                className="px-3 py-1 rounded-full bg-surface border border-border hover:border-accent hover:text-accent transition-colors cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="max-w-5xl mx-auto px-4 mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs">
            <div className="w-9 h-9 mx-auto mb-2.5 rounded-lg bg-accent-light text-accent flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              </svg>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-1">Instant QR Passes</h4>
            <p className="text-xs text-text-muted">Immediate digital confirmation & phone-ready entry pass.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs">
            <div className="w-9 h-9 mx-auto mb-2.5 rounded-lg bg-accent-light text-accent flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-1">Seamless Checkout</h4>
            <p className="text-xs text-text-muted">Swift ticket reservation with secured payment handling.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs">
            <div className="w-9 h-9 mx-auto mb-2.5 rounded-lg bg-accent-light text-accent flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-1">Verified Organizers</h4>
            <p className="text-xs text-text-muted">Authentic events backed by trusted venue coordinators.</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-border">
          <div>
            <div className="section-label">Browse Schedule</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Upcoming Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            <span>Explore all events</span>
            <span>→</span>
          </Link>
        </div>

        {isLoading ? (
          <Spinner label="Loading scheduled events..." />
        ) : error ? (
          <div className="rounded-xl border border-danger-border bg-danger-bg p-8 text-center max-w-lg mx-auto">
            <p className="text-sm font-medium text-danger">{error}</p>
            <button
              onClick={() => void fetchEvents()}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-danger text-white hover:opacity-90"
            >
              Try Again
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <h3 className="empty-state__title">No Events Available</h3>
            <p className="empty-state__body">Check back soon for freshly scheduled concerts and festivals.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Organizer Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-subtle bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
              For Event Creators
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              Planning your next big gathering?
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Ticket Bro makes it easy to set up ticket tiers, assign scanner staff, manage entry validation, and track revenue seamlessly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/register/organizer"
              className="px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold text-center transition-all shadow-md"
            >
              Start Hosting Events
            </Link>
            <Link
              to="/events"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold text-center transition-all border border-white/15"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
