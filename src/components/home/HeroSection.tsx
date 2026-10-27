import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

interface HeroSectionProps {
  onSearch: (query: string) => void;
}

const QUICK_CATEGORIES = [
  "Concerts",
  "Festivals",
  "Sports",
  "Comedy",
  "Conferences",
  "Food & Drink",
];

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      void navigate(`/events?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategoryClick = (cat: string) => {
    onSearch(cat);
    void navigate(`/events?search=${encodeURIComponent(cat)}`);
  };

  return (
    <section className="relative overflow-hidden bg-[#0d0f14] pt-14 pb-20 sm:pt-20 sm:pb-28">
      {/* Ambient glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #f5c518 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 right-0 w-[380px] h-[380px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: copy + search */}
          <div className="flex-1 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#f5c518] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f5c518]">
                Live events near you
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Find your next{" "}
              <span className="text-[#f5c518]">night out.</span>
            </h1>

            <p className="max-w-lg mx-auto lg:mx-0 text-sm sm:text-base text-[#9aa0b4] leading-relaxed mb-8">
              Concerts, festivals, matches and more. Book in a few taps, pay
              with eSewa or Khalti, and show your QR ticket at the door.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center bg-[#1a1e28] border border-white/10 rounded-2xl overflow-hidden shadow-xl mb-6 focus-within:border-[#f5c518]/40 transition-colors"
            >
              <div className="pl-5 flex items-center text-[#9aa0b4] pointer-events-none flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, venues, artists…"
                className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-[#9aa0b4] outline-none min-w-0"
              />
              <button
                type="submit"
                className="flex-shrink-0 m-2 px-5 py-2.5 rounded-xl bg-[#f5c518] hover:bg-[#e0b010] text-[#0d0f14] text-sm font-bold transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Quick category chips */}
            <div className="flex items-center flex-wrap gap-2 justify-center lg:justify-start">
              <span className="text-[11px] font-semibold text-[#9aa0b4] uppercase tracking-wider">
                Browse:
              </span>
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#9aa0b4] border border-white/10 hover:border-[#f5c518]/50 hover:text-[#f5c518] transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right: floating ticket visual */}
          <div className="flex-shrink-0 hidden lg:flex items-center justify-center w-72 xl:w-80">
            <div className="relative">
              {/* Main ticket card */}
              <div className="relative bg-[#f5c518] rounded-2xl p-6 w-64 shadow-[0_20px_60px_rgba(245,197,24,0.35)] rotate-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#0d0f14]/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#0d0f14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0d0f14]/70">
                    Ticket Bro
                  </span>
                </div>
                <div className="text-[#0d0f14] font-extrabold text-xl leading-tight mb-1">
                  Himal Beats
                  <br />Night
                </div>
                <div className="text-[11px] text-[#0d0f14]/70 font-medium">
                  Sat, Nov 15 · 7:00 PM
                </div>
                {/* Ticket tear line */}
                <div className="mt-4 border-t-2 border-dashed border-[#0d0f14]/20 pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#0d0f14]/60 font-bold">Seat</div>
                    <div className="text-sm font-extrabold text-[#0d0f14]">GA · Floor</div>
                  </div>
                  <div className="w-12 h-12 bg-[#0d0f14]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#0d0f14]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Behind card glow */}
              <div
                aria-hidden
                className="absolute -z-10 inset-0 bg-[#f5c518]/30 rounded-2xl blur-2xl scale-90 translate-y-4"
              />

              {/* Feature badges */}
              <div className="absolute -bottom-4 -left-8 bg-[#1a1e28] border border-white/10 rounded-xl px-3 py-2 shadow-lg text-white text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Instant QR pass
              </div>
              <div className="absolute -top-4 -right-6 bg-[#1a1e28] border border-white/10 rounded-xl px-3 py-2 shadow-lg text-white text-xs font-semibold flex items-center gap-2">
                <span className="text-[#f5c518]">✓</span>
                Verified seller
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
