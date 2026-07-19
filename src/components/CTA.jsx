import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section id="get-started" className="px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-accent px-8 py-14 text-center shadow-xl sm:px-16">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to grow your rental business?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
          Join hundreds of businesses who trust RentFlow to manage their
          inventory, bookings, and customers with ease.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/signup"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-slate-100"
          >
            Sign up free
          </Link>
          <a
            href="#contact"
            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Talk to sales
          </a>
        </div>
      </div>
    </section>
  );
}
