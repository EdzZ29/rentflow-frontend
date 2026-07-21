import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, ErrorNote, Loading } from '../../components/ui';
import { BarChart, Donut, Legend, Panel, StatTile, CHART_COLORS } from '../../components/dashboard';
import { useOwnerPlan } from '../../context/OwnerPlanContext';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function OwnerOverview() {
  const [sub, setSub] = useState(null);
  const [businesses, setBusinesses] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  const { subscribe } = useRealtime();
  const { isActive } = useOwnerPlan();

  const loadReservations = () =>
    api.reservations.list().then(setReservations).catch(() => {});

  useEffect(() => {
    Promise.all([api.subscription.get(), api.businesses.list()])
      .then(([s, b]) => {
        setSub(s);
        setBusinesses(b);
      })
      .catch((e) => setError(e.message));
    loadReservations();
  }, []);

  // Live-refresh the dashboard metrics + chart as bookings come in / change.
  useEffect(() => subscribe('reservation', loadReservations), [subscribe]);

  const approve = async (r) => {
    try {
      await api.reservations.updateStatus(r.id, 'confirmed');
      await loadReservations();
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!sub || !businesses) return <Loading />;

  // ── Derived metrics ───────────────────────────────────
  const planLabel = sub.effectivePlan === 'none' ? 'No active plan' : sub.effectivePlan;
  const pending = reservations.filter((r) => r.status === 'pending');
  const confirmed = reservations.filter((r) => r.status === 'confirmed');
  const completed = reservations.filter((r) => r.status === 'completed');
  const currency = reservations[0]?.product?.currency || 'PHP';
  const earned = [...confirmed, ...completed].reduce(
    (sum, r) => sum + rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0),
    0,
  );
  const completionPct = reservations.length
    ? Math.round((completed.length / reservations.length) * 100)
    : 0;

  // Booking activity over the last 7 days, keyed on when each booking was
  // placed (createdAt) — so a booking made today lands on today's bar, not on
  // the weekday of its future rental start date.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfToday.getTime() - (6 - i) * DAY_MS);
    return { label: WEEK[d.getDay()], value: 0 };
  });
  reservations.forEach((r) => {
    const created = new Date(r.createdAt);
    if (Number.isNaN(created.getTime())) return;
    created.setHours(0, 0, 0, 0);
    const idx = 6 - Math.round((startOfToday.getTime() - created.getTime()) / DAY_MS);
    if (idx >= 0 && idx < 7) days[idx].value++;
  });
  const barData = days;

  const donutSegments = [
    { label: 'Completed', value: completed.length, color: CHART_COLORS.brand },
    { label: 'Confirmed', value: confirmed.length, color: CHART_COLORS.accent },
    { label: 'Pending', value: pending.length, color: CHART_COLORS.amber },
  ];

  const recent = [...reservations].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your rentals, bookings, and plan with ease.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/owner/businesses"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Add Business
          </Link>
          <Link
            to="/owner/subscription"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Manage Plan
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Bookings" value={reservations.length} hint="All-time reservations" highlight />
        <StatTile label="Confirmed" value={confirmed.length} hint="Ready to hand off" />
        <StatTile label="Pending Approval" value={pending.length} hint="Needs your action" />
        <StatTile label="Estimated Revenue" value={formatPrice(earned, currency)} hint="Confirmed + completed" />
      </div>

      {/* Analytics + plan */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="Booking Activity"
          className="lg:col-span-2"
          action={<span className="text-xs font-medium text-slate-400">Last 7 days</span>}
        >
          <BarChart data={barData} />
          <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-sm">
            <Stat label="Businesses" value={`${businesses.length} / ${sub.businessLimit}`} />
            <Stat label="Completed" value={completed.length} />
            <Stat label="Completion rate" value={`${completionPct}%`} />
          </div>
        </Panel>

        {/* Plan card (featured, dark) */}
        <div
          className="flex flex-col justify-between rounded-2xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${CHART_COLORS.brandDark}, ${CHART_COLORS.brand})` }}
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Current plan</p>
              <Badge tone={sub.isTrialActive ? 'amber' : sub.effectivePlan === 'none' ? 'slate' : 'green'}>
                {sub.isTrialActive ? 'Trial' : sub.effectivePlan === 'none' ? 'Inactive' : 'Active'}
              </Badge>
            </div>
            <p className="mt-1 text-2xl font-bold capitalize">{planLabel}</p>
            <p className="mt-2 text-sm text-white/70">
              {sub.isTrialActive
                ? `Your free trial ends in ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? '' : 's'}.`
                : sub.effectivePlan === 'none'
                  ? 'Your trial has ended. Subscribe to keep adding businesses.'
                  : 'Your subscription is active.'}
            </p>
          </div>
          <Link
            to="/owner/subscription"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-white/90"
          >
            Manage plan
          </Link>
        </div>
      </div>

      {/* Requests + progress */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="Booking Requests"
          className="lg:col-span-2"
          action={
            <Link to="/owner/bookings" className="text-xs font-semibold text-accent hover:underline">
              View all
            </Link>
          }
        >
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No pending requests right now.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{r.product?.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {r.startDate} → {r.endDate} · {r.customer?.fullName}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => approve(r)}
                      disabled={!isActive}
                      title={!isActive ? 'Subscribe to approve bookings' : undefined}
                      className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <Link
                      to="/owner/bookings"
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Manage
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Booking Progress">
          <Donut segments={donutSegments} centerValue={`${completionPct}%`} centerLabel="Completed" />
          <div className="mt-5">
            <Legend items={donutSegments} />
          </div>
        </Panel>
      </div>

      {/* Businesses + recent */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Your Businesses"
          action={
            <Link to="/owner/businesses" className="text-xs font-semibold text-accent hover:underline">
              Manage
            </Link>
          }
        >
          {businesses.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              You haven&apos;t added any businesses yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {businesses.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{b.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {b.category}
                      {b.location ? ` · ${b.location}` : ''}
                    </p>
                  </div>
                  <Badge tone={b.status === 'active' ? 'green' : 'amber'}>{b.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent Bookings"
          action={
            <Link to="/owner/bookings" className="text-xs font-semibold text-accent hover:underline">
              View all
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => {
                const total = rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0);
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{r.product?.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {r.startDate} → {r.endDate}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatPrice(total, r.product?.currency)}</p>
                      <Badge tone={STATUS_TONE[r.status] || 'slate'}>{r.status}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

const STATUS_TONE = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
