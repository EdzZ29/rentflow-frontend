import { Link } from 'react-router-dom';
import Logo from './Logo';
import StoreBadges from './StoreBadges';

// `to` → internal route, `href` → in-page anchor, otherwise a placeholder.
const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Find a Rent', to: '/rentals' },
      { label: 'Services', to: '/services' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Integrations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers' },
      { label: 'Blog' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center' },
      { label: 'Documentation' },
      { label: 'Status' },
      { label: 'Privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo className="h-9 w-9" />
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-brand">Rent</span>
                <span className="text-accent">Flow</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-600">
              Modern rental management for businesses of every kind. List,
              book, track, and grow — all in one place.
            </p>

            {/* App download */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900">
                Available on iOS &amp; Android
              </p>
              <p className="mt-1 text-xs text-slate-500">Download the app manage your rentals on the go.</p>
              <StoreBadges className="mt-3" />
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="text-sm text-slate-600 transition-colors hover:text-accent">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href || '#'} className="text-sm text-slate-600 transition-colors hover:text-accent">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RentFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-slate-500">
            <a href="#" className="text-sm hover:text-accent">Terms</a>
            <a href="#" className="text-sm hover:text-accent">Privacy</a>
            <a href="#" className="text-sm hover:text-accent">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
