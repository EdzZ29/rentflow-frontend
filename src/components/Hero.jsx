import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '500+', label: 'Rental businesses' },
  { value: '12k+', label: 'Items tracked' },
  { value: '99.9%', label: 'Uptime' },
];

// Each slide is a different kind of rental business the platform can run.
const businesses = [
  {
    name: 'Vehicle Rentals',
    icon: 'M3 13l1-4h13l3 4v4h-2m-4 0H9m-4 0H3v-4m2 4a2 2 0 104 0m6 0a2 2 0 104 0',
    items: [
      { name: 'Toyota Hiace', sub: 'ABC-123', status: 'Available', tone: 'text-accent bg-accent/10' },
      { name: 'Honda Click', sub: 'XYZ-889', status: 'On rent', tone: 'text-brand bg-brand/10' },
      { name: 'Mountain Bike', sub: 'BKE-231', status: 'Maintenance', tone: 'text-amber-600 bg-amber-100' },
    ],
  },
  {
    name: 'Party & Events',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    items: [
      { name: 'Banquet Chairs ×200', sub: 'Set A', status: 'Available', tone: 'text-accent bg-accent/10' },
      { name: 'Round Tables ×30', sub: 'Set B', status: 'Reserved', tone: 'text-brand bg-brand/10' },
      { name: 'Party Tent 6×12', sub: 'Unit 3', status: 'Out', tone: 'text-amber-600 bg-amber-100' },
    ],
  },
  {
    name: 'Videoke & Sound',
    icon: 'M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2',
    items: [
      { name: 'Videoke Machine', sub: 'VK-08', status: 'Available', tone: 'text-accent bg-accent/10' },
      { name: 'Speaker Set 2000W', sub: 'SPK-02', status: 'On rent', tone: 'text-brand bg-brand/10' },
      { name: 'Wireless Mic ×4', sub: 'MIC-11', status: 'Cleaning', tone: 'text-amber-600 bg-amber-100' },
    ],
  },
  {
    name: 'Camera & Gear',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z',
    items: [
      { name: 'DSLR Camera', sub: 'CAM-05', status: 'Available', tone: 'text-accent bg-accent/10' },
      { name: 'Tripod + Lights', sub: 'LGT-01', status: 'Reserved', tone: 'text-brand bg-brand/10' },
      { name: 'Drone 4K', sub: 'DRN-02', status: 'On rent', tone: 'text-brand bg-brand/10' },
    ],
  },
  {
    name: 'Tools & Equipment',
    icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63',
    items: [
      { name: 'Power Generator', sub: 'GEN-04', status: 'Available', tone: 'text-accent bg-accent/10' },
      { name: 'Concrete Mixer', sub: 'MIX-01', status: 'On rent', tone: 'text-brand bg-brand/10' },
      { name: 'Scaffold Set', sub: 'SCF-07', status: 'Maintenance', tone: 'text-amber-600 bg-amber-100' },
    ],
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  // Auto-advance the carousel through each business type.
  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % businesses.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const business = businesses[active];

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
            RentFlow keeps your whole operation moving.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
            >
              Get started free
            </Link>
            <a
              href="#services"
              className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand"
            >
              Explore services
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-bold text-brand sm:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Rotating business mockup */}
        <div className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  key={`icon-${active}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand"
                  style={{ animation: 'fadeSlide 0.5s ease' }}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={business.icon} />
                  </svg>
                </div>
                <div key={`title-${active}`} style={{ animation: 'fadeSlide 0.5s ease' }}>
                  <p className="text-sm font-semibold text-slate-900">{business.name}</p>
                  <p className="text-xs text-slate-500">Live availability</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-dark">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Live
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {business.items.map((item, i) => (
                <li
                  key={`${active}-${i}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  style={{ animation: `fadeSlide 0.5s ease ${i * 0.08}s both` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={business.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.tone}`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>

            {/* Carousel dots */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {businesses.map((b, i) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${b.name}`}
                  className={
                    i === active
                      ? 'h-2 w-6 rounded-full bg-accent transition-all'
                      : 'h-2 w-2 rounded-full bg-slate-300 transition-all hover:bg-slate-400'
                  }
                />
              ))}
            </div>
          </div>

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
