import { useEffect, useState } from 'react';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';

const PLANS = [
  { key: 'monthly', name: 'Monthly', price: '$29', period: '/mo', limit: 5, features: ['Up to 5 businesses', 'Bookings & payments', 'Analytics', 'Priority support'] },
  { key: 'yearly', name: 'Yearly', price: '$290', period: '/yr', limit: 'Unlimited', features: ['Unlimited businesses', 'Everything in Monthly', 'Multi-branch support', '2 months free'], best: true },
];

export default function OwnerSubscription() {
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.subscription.get().then(setSub).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      const next = await fn();
      setSub(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!sub) return <Loading />;

  const isPaid = sub.effectivePlan === 'monthly' || sub.effectivePlan === 'yearly';

  return (
    <div>
      <PageHeader title="Subscription" subtitle="Manage your plan and billing." />

      <ErrorNote>{error}</ErrorNote>

      {/* Current status */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              Current plan
              <Badge tone={sub.isTrialActive ? 'amber' : isPaid ? 'green' : 'slate'}>
                {sub.effectivePlan === 'none' ? 'Inactive' : sub.effectivePlan}
              </Badge>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {sub.isTrialActive
                ? `Free trial — ${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? '' : 's'} left.`
                : isPaid
                  ? 'Your subscription is active.'
                  : 'No active plan. Start a trial or subscribe below.'}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Businesses used</p>
            <p className="text-2xl font-bold text-brand">
              {sub.businessesUsed}
              <span className="text-base font-normal text-slate-400"> / {sub.businessLimit}</span>
            </p>
          </div>
        </div>

        {sub.plan === 'none' && (
          <button
            onClick={() => run(api.subscription.startTrial)}
            disabled={busy}
            className="mt-4 rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent-dark hover:bg-accent/5 disabled:opacity-60"
          >
            Start 7-day free trial
          </button>
        )}
      </div>

      {/* Plans */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {PLANS.map((p) => {
          const current = sub.effectivePlan === p.key;
          return (
            <div
              key={p.key}
              className={`rounded-xl border bg-white p-6 ${p.best ? 'border-accent shadow-md' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                {p.best && <Badge tone="green">Best value</Badge>}
              </div>
              <p className="mt-2">
                <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                <span className="text-sm text-slate-500">{p.period}</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={busy || current}
                onClick={() => run(() => api.subscription.choosePlan(p.key))}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                  p.best
                    ? 'bg-accent text-white hover:bg-accent-dark'
                    : 'border border-slate-300 text-slate-700 hover:border-brand hover:text-brand'
                }`}
              >
                {current ? 'Current plan' : `Switch to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
