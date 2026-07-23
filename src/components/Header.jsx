import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Rental categories shown in the "Find a rent" mega menu.
const categories = [
  {
    name: 'Vehicles',
    items: [
      { title: 'Cars', desc: 'Sedans, SUVs, and vans' },
      { title: 'Motorcycles', desc: 'Scooters and big bikes' },
      { title: 'Bicycles', desc: 'City, mountain, and e-bikes' },
      { title: 'Trucks', desc: 'Moving and hauling trucks' },
      { title: 'Heavy Equipment', desc: 'Construction machinery' },
      { title: 'Boats & Watercraft', desc: 'Jet skis and boats' },
    ],
  },
  {
    name: 'Events & Party',
    items: [
      { title: 'Chairs & Tables', desc: 'Seating and banquet sets' },
      { title: 'Tents & Canopies', desc: 'Covered event spaces' },
      { title: 'Catering Equipment', desc: 'Serving and cooking gear' },
      { title: 'Decorations', desc: 'Backdrops and styling' },
      { title: 'Inflatables', desc: 'Bounce houses for kids' },
      { title: 'Stage & Trussing', desc: 'Platforms and rigging' },
    ],
  },
  {
    name: 'Audio & Video',
    items: [
      { title: 'Sound Systems', desc: 'Speakers and mixers' },
      { title: 'Videoke / Karaoke', desc: 'Machines and mics' },
      { title: 'Projectors', desc: 'Screens and displays' },
      { title: 'DJ Equipment', desc: 'Controllers and lights' },
      { title: 'Microphones', desc: 'Wired and wireless' },
      { title: 'LED Walls', desc: 'Video walls and panels' },
    ],
  },
  {
    name: 'Photography',
    items: [
      { title: 'Cameras', desc: 'DSLR and mirrorless' },
      { title: 'Lenses', desc: 'Prime and zoom glass' },
      { title: 'Lighting', desc: 'Studio and portable' },
      { title: 'Drones', desc: 'Aerial photography' },
      { title: 'Tripods & Gimbals', desc: 'Stabilizers and mounts' },
      { title: 'Studio Space', desc: 'Rentable studios' },
    ],
  },
  {
    name: 'Tools & Equipment',
    items: [
      { title: 'Power Tools', desc: 'Drills, saws, grinders' },
      { title: 'Generators', desc: 'Portable power' },
      { title: 'Ladders & Scaffolds', desc: 'Access equipment' },
      { title: 'Cleaning', desc: 'Pressure washers, vacuums' },
      { title: 'Gardening', desc: 'Mowers and trimmers' },
      { title: 'Welding', desc: 'Welders and cutters' },
    ],
  },
  {
    name: 'Sports & Outdoor',
    items: [
      { title: 'Camping Gear', desc: 'Tents and sleeping bags' },
      { title: 'Water Sports', desc: 'Kayaks and paddleboards' },
      { title: 'Fitness Equipment', desc: 'Weights and machines' },
      { title: 'Ski & Snow', desc: 'Winter equipment' },
      { title: 'Team Sports', desc: 'Field and court gear' },
      { title: 'Adventure', desc: 'Climbing and trekking' },
    ],
  },
];

// Each nav item is its own route now (so they work from any page, not just the
// landing page). Contact stays an in-page anchor — the Footer (#contact) is
// rendered on every page.
const rightLinks = [
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Pricing', to: '/pricing' },
];

function Chevron({ className = '' }) {
  return (
    <svg className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false); // mobile menu
  const [rentOpen, setRentOpen] = useState(false); // mega menu
  const [cat, setCat] = useState(0); // active category

  const closeRent = () => setRentOpen(false);
  const linkClass =
    'text-sm font-medium text-slate-700 transition-colors hover:text-accent';

  return (
    <header
      className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur"
      onMouseLeave={closeRent}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo + wordmark */}
        <Link to="/" className="flex items-center gap-2.5" onMouseEnter={closeRent}>
          <Logo className="h-9 w-9" />
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-brand">Rent</span>
            <span className="text-accent">Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className={linkClass} onMouseEnter={closeRent}>
            Home
          </Link>

          <button
            type="button"
            className={`flex items-center gap-1 ${linkClass} ${rentOpen ? 'text-accent' : ''}`}
            onMouseEnter={() => setRentOpen(true)}
            aria-expanded={rentOpen}
          >
            Find a rent
            <Chevron className={`transition-transform ${rentOpen ? 'rotate-180' : ''}`} />
          </button>

          {rightLinks.map((link) =>
            link.to ? (
              <Link key={link.label} to={link.to} className={linkClass} onMouseEnter={closeRent}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className={linkClass} onMouseEnter={closeRent}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex" onMouseEnter={closeRent}>
          <Link to="/login" className="text-sm font-medium text-slate-700 transition-colors hover:text-brand">
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-dark"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mega menu (desktop) */}
      {rentOpen && (
        <div
          className="absolute inset-x-0 top-full z-40 hidden md:block"
          onMouseEnter={() => setRentOpen(true)}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mt-2 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="grid grid-cols-[240px_1fr]">
                {/* Category list */}
                <div className="border-r border-slate-100 bg-slate-50 p-3">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Categories
                  </p>
                  {categories.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onMouseEnter={() => setCat(i)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        i === cat
                          ? 'bg-white font-semibold text-brand shadow-sm'
                          : 'text-slate-700 hover:bg-white/70'
                      }`}
                    >
                      {c.name}
                      <Chevron className="-rotate-90 opacity-50" />
                    </button>
                  ))}
                </div>

                {/* Subcategories */}
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {categories[cat].name}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                    {categories[cat].items.map((item) => (
                      <Link
                        key={item.title}
                        to={`/rentals?category=${encodeURIComponent(categories[cat].name)}`}
                        className="group block"
                        onClick={closeRent}
                      >
                        <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-accent">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer links */}
              <div className="flex items-center gap-6 border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                <Link to="/rentals" className="flex items-center gap-1 text-sm font-medium text-accent-dark hover:text-accent" onClick={closeRent}>
                  See all rentals <Chevron className="-rotate-90" />
                </Link>
                <Link to="/signup" className="flex items-center gap-1 text-sm font-medium text-accent-dark hover:text-accent" onClick={closeRent}>
                  List your items <Chevron className="-rotate-90" />
                </Link>
                <Link to="/services" className="flex items-center gap-1 text-sm font-medium text-accent-dark hover:text-accent" onClick={closeRent}>
                  How it works <Chevron className="-rotate-90" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            <Link to="/" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-slate-700 hover:text-accent">
              Home
            </Link>
            <Link to="/rentals" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-slate-700 hover:text-accent">
              Find a rent
            </Link>
            {rightLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm font-medium text-slate-700 hover:text-accent"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm font-medium text-slate-700 hover:text-accent"
                >
                  {link.label}
                </a>
              ),
            )}
            <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-4">
              <Link to="/login" className="flex-1 rounded-lg border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-700 hover:border-brand hover:text-brand">
                Login
              </Link>
              <Link to="/signup" className="flex-1 rounded-lg bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-dark">
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
