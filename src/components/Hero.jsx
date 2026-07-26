import { Link } from 'react-router-dom';
import artwork from '../assets/images/art-1.png';

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* soft brand glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Rental management, made simple
          </span>

          {/* Tagline */}
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.25em]">
            <span className="text-brand">Manage.</span>{' '}
            <span className="text-accent">Rent.</span>{' '}
            <span className="text-brand">Grow.</span>
          </p>

          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Run your entire rental business from{' '}
            <span className="text-brand">one</span>{' '}
            <span className="text-accent">dashboard</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-slate-600">
            Cars, party supplies, sound systems, cameras, tools and more
            manage reservations, inventory, customers, and payments in real time.
            Rentivo keeps your whole operation moving.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              Get started free
            </Link>
            <a
              href="/rentals"
              className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
            >
              Explore Rentals & Business
            </a>
          </div>

          
        </div>

        {/* Hero artwork */}
        <div className="relative">
          <img
            src={artwork}
            alt="Rentivo rental management illustration"
            className="w-full max-w-xl object-contain lg:ml-auto"
          />

          {/* floating badge */}
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
            <p className="text-xs text-slate-500">This month</p>
            <p className="text-lg font-bold text-accent">+18% bookings</p>
          </div>
        </div>
      </div>
    </section>
  );
}
