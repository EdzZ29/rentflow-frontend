import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, ErrorNote, Loading, PageHeader, StatCard } from '../../components/ui';
import { api } from '../../lib/api';

export default function OwnerOverview() {
  const [sub, setSub] = useState(null);
  const [businesses, setBusinesses] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

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

  const planLabel = sub.effectivePlan === 'none' ? 'No active plan' : sub.effectivePlan;
  const pending = reservations.filter((r) => r.status === 'pending');

  return (
    <div>
      <PageHeader title="Overview" subtitle="Your rental business at a glance." />

      {/* Plan / trial banner */}
      <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              Current plan
              <Badge tone={sub.isTrialActive ? 'amber' : sub.effectivePlan === 'none' ? 'slate' : 'green'}>
                {planLabel}
              </Badge>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {sub.isTrialActive
                ? `Your free trial ends in ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? '' : 's'}.`
                : sub.effectivePlan === 'none'
                  ? 'Your trial has ended. Subscribe to keep adding businesses.'
                  : 'Your subscription is active.'}
            </p>
          </div>
          <Link
            to="/owner/subscription"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Manage plan
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Businesses" value={businesses.length} hint={`Limit: ${sub.businessLimit}`} />
        <StatCard label="Total bookings" value={reservations.length} tone="accent" />
        <StatCard label="Pending approval" value={pending.length} />
        <StatCard
          label="Trial days left"
          value={sub.isTrialActive ? sub.trialDaysLeft : '—'}
        />
      </div>

      {/* Booking requests needing action */}
      <Card title="Booking requests" className="mt-6">
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">
            No pending requests.{' '}
            <Link to="/owner/reservations" className="font-semibold text-accent hover:underline">
              View all bookings →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.product?.name}</p>
                  <p className="text-xs text-slate-500">
                    {r.startDate} → {r.endDate} · {r.customer?.fullName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(r)} className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark">
                    ✓ Approve
                  </button>
                  <Link to="/owner/reservations" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Your businesses" className="mt-6">
        {businesses.length === 0 ? (
          <p className="text-sm text-slate-500">
            You haven't added any businesses yet.{' '}
            <Link to="/owner/businesses" className="font-semibold text-accent hover:underline">
              Add your first business →
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {businesses.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-500">
                    {b.category}
                    {b.location ? ` · ${b.location}` : ''}
                  </p>
                </div>
                <Badge tone={b.status === 'active' ? 'green' : 'amber'}>{b.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
