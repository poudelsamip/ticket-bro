import { Link } from "react-router";

/**
 * "Hosting an event?" CTA banner — amber/yellow background, matching reference.
 * Purely static / non-data-driven section.
 */
export default function HostCallout() {
  return (
    <section className="bg-[#f5c518] py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Copy */}
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0d0f14] mb-3">
              Hosting an event?
            </h2>
            <p className="text-sm sm:text-base text-[#0d0f14]/70 leading-relaxed">
              Create your event, set up tickets and check guests in with QR scans
              all in one place, and grow your event-hosting business.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/register/organizer"
              className="px-6 py-3.5 rounded-xl bg-[#0d0f14] hover:bg-[#1a1e28] text-white text-sm font-bold text-center transition-colors shadow-lg"
            >
              Start selling tickets
            </Link>
            <Link
              to="/register/organizer"
              className="px-6 py-3.5 rounded-xl bg-white/30 hover:bg-white/50 text-[#0d0f14] text-sm font-bold text-center transition-colors border border-[#0d0f14]/20"
            >
              Organizer login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
