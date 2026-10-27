import { useState } from "react";
import { Link } from "react-router";
import type { EventListItem } from "@/types";
import GradientEventCard from "./GradientEventCard";
import Spinner from "@/components/Spinner";

interface UpcomingEventsSectionProps {
  events: EventListItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCategoryFilter: (category: string) => void;
}

const CATEGORY_TABS = [
  { label: "All", value: "" },
  { label: "Concerts", value: "Concerts" },
  { label: "Festivals", value: "Festivals" },
  { label: "Sports", value: "Sports" },
  { label: "Comedy", value: "Comedy" },
  { label: "Conferences", value: "Conferences" },
  { label: "Food & Drink", value: "Food & Drink" },
];

export default function UpcomingEventsSection({
  events,
  isLoading,
  error,
  onRetry,
  onCategoryFilter,
}: UpcomingEventsSectionProps) {
  const [activeTab, setActiveTab] = useState("");

  const handleTab = (value: string) => {
    setActiveTab(value);
    onCategoryFilter(value);
  };

  const displayed = events.slice(0, 6);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#c9930a] mb-1">
              Browse Schedule
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Upcoming events
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9930a] hover:text-[#e0b010] transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Category tab bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTab(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.value
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <Spinner label="Loading events…" />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:opacity-90 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <h3 className="empty-state__title">No Upcoming Events</h3>
            <p className="empty-state__body">Check back soon for freshly scheduled concerts and festivals.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3">
              {displayed.map((event, i) => (
                <GradientEventCard key={event.id} event={event} colorIndex={i} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors"
              >
                View all events →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
