import { Link } from 'react-router-dom';
import Logo from './Logo';

const bullets = [
  'One dashboard for every rental item',
  'Online booking page for your customers',
  'Payments, maintenance & reports built in',
];

// Two-column shell used by the Login and Signup pages:
// content on the left, a branded panel ("image") on the right.
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: content */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-brand">Rent</span>
            <span className="text-accent">Flow</span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Right: branded panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-accent lg:flex lg:flex-col lg:justify-center lg:px-14 lg:text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

        <div className="relative max-w-md">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80">
            Manage. Rent. Grow.
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            Run your entire rental business in one place.
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Join hundreds of rental businesses using RentFlow to manage
            inventory, bookings, and customers.
          </p>

          <ul className="mt-8 space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white/90">{b}</span>
              </li>
            ))}
          </ul>

          
        </div>
      </div>
    </div>
  );
}
