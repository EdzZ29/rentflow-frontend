import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { homePathForRole, useAuth } from '../context/AuthContext';
import { assetUrl } from '../lib/api';
import { LogoutIcon, SettingsIcon } from './icons';
import Logo from './Logo';
import Modal from './Modal';
import NotificationBell from './NotificationBell';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-accent/10 text-accent-dark' : 'text-slate-600 hover:bg-slate-100'
  }`;

// A collapsible sidebar section whose children are routed links. Opens
// automatically when the current route is one of its children.
function NavGroup({ item }) {
  const { pathname } = useLocation();
  const hasActiveChild = item.children.some((c) =>
    c.end ? pathname === c.to : pathname.startsWith(c.to),
  );
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          hasActiveChild ? 'text-accent-dark' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <span className="h-5 w-5">{item.icon}</span>
        {item.label}
        <svg
          className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 space-y-1 pl-4">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              end={c.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-accent/10 text-accent-dark' : 'text-slate-500 hover:bg-slate-100'
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ nav, roleLabel, banner }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Log out is confirmed through a modal so it can't be hit by accident.
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  // Settings lives under each role's dashboard, e.g. /owner/settings.
  const roleHome = homePathForRole(user?.role);
  const settingsPath = roleHome === '/' ? '/' : `${roleHome}/settings`;

  const displayName = user?.fullName || user?.email || 'Account';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  const avatar = user?.avatarUrl ? assetUrl(user.avatarUrl) : null;

  // Flatten groups for the horizontal mobile nav.
  const mobileItems = nav.flatMap((item) => (item.children ? item.children : [item]));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
          <Logo className="h-8 w-8" />
          <span className="font-logo text-xl ">
            <span className="text-accent">rentivo</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {roleLabel}
          </p>
          {nav.map((item) =>
            item.children ? (
              <NavGroup key={item.label} item={item} />
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                <span className="h-5 w-5">{item.icon}</span>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="px-2">
            <p className="truncate text-sm font-medium text-slate-900">{user?.email}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Top bar (desktop) */}
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-8 backdrop-blur lg:flex">
          <div className="relative w-full max-w-sm">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Actions: notifications, settings, log out */}
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Link
                to={settingsPath}
                title="Settings"
                aria-label="Settings"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand"
              >
                <SettingsIcon className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                title="Log out"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
              >
                <LogoutIcon className="h-5 w-5" />
                Logout
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              {avatar ? (
                <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-brand text-sm font-semibold text-white">
                  {initial}
                </span>
              )}
              <div className="leading-tight">
                <p className="max-w-[12rem] truncate text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs capitalize text-slate-400">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Top bar (mobile nav + logout) */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-logo text-lg ">
              <span className="text-accent">rentivo</span>
            </span>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Link
                to={settingsPath}
                aria-label="Settings"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand"
              >
                <SettingsIcon className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                aria-label="Log out"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
              >
                <LogoutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto">
            {mobileItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-accent/10 text-accent-dark' : 'text-slate-600'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="p-5 lg:p-8">
          {banner}
          <Outlet />
        </main>
      </div>

      {confirmLogout && (
        <Modal title="Log out" onClose={() => !loggingOut && setConfirmLogout(false)}>
          <p className="text-sm text-slate-600">
            Are you sure you want to log out?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmLogout(false)}
              disabled={loggingOut}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
