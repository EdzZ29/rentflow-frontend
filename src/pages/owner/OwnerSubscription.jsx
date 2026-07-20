import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { api } from '../../lib/api';

const PLAN_INFO = {
  monthly: { name: 'Monthly', price: '$29', period: 'per month', limitLabel: 'Up to 5 businesses' },
  yearly: { name: 'Yearly', price: '$290', period: 'per year', limitLabel: 'Unlimited businesses', save: 'Save 2 months' },
};

// Left column: quota-style features (show a value). Right column: capabilities (checkmark).
const quota = (plan) => [
  { label: 'Rental businesses', value: PLAN_INFO[plan].limitLabel },
  { label: 'Bookings & reservations', value: 'Unlimited' },
  { label: 'Analytics & reports', value: 'Included' },
];
const CAPABILITIES = [
  'Customer management',
  'Booking approvals & scheduling',
  'Multiple payment methods',
  'Email notifications',
  'Priority support',
  'Multi-branch support',
];

const INCLUDED = [
  { title: 'Rental businesses', desc: 'List and manage your rental businesses' },
  { title: 'Bookings & reservations', desc: 'Accept, approve, and track every booking' },
  { title: 'Analytics & reports', desc: 'Revenue, top products, and monthly trends' },
  { title: 'Customer management', desc: 'See every renter and their history' },
  { title: 'Payment methods', desc: 'Card, GCash, and PayPal at checkout' },
  { title: 'Priority support', desc: 'Faster help whenever you need it' },
];

// The two RentFlow business plans (separate from billing period above).
const BUSINESS_FEATURES = [
  'Dashboard',
  'Booking & reservation management',
  'Inventory / asset management',
  'Customer management (CRM)',
  'Employee & role management',
  'Payments & invoicing',
  'Maintenance scheduling',
  'Reports & analytics',
  'Notifications',
  'Business settings',
];
const MARKETPLACE_FEATURES = [
  'Everything in Business Management',
  'Public business profile',
  'Publish rental products & services',
  'Customer search & filtering',
  'Online bookings & reservation requests',
  'Ratings & reviews (coming soon)',
  'Direct customer inquiries',
];

export default function OwnerSubscription() {
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [checkout, setCheckout] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [planBusy, setPlanBusy] = useState(null); // id being toggled

  const loadBusinesses = () => api.businesses.list().then(setBusinesses).catch(() => {});

  useEffect(() => {
    api.subscription
      .get()
      .then((s) => {
        setSub(s);
        // Default the billing toggle to the natural upgrade target.
        setBilling(s.effectivePlan === 'monthly' ? 'yearly' : 'monthly');
      })
      .catch((e) => setError(e.message));
    loadBusinesses();
  }, []);

  const setBusinessPlan = async (b, type) => {
    setPlanBusy(b.id);
    setError('');
    try {
      await api.businesses.update(b.id, { subscriptionType: type });
      await loadBusinesses();
    } catch (e) {
      setError(e.message);
    } finally {
      setPlanBusy(null);
    }
  };

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      const next = await fn();
      setSub(next);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!sub) return <Loading />;

  const isPaid = sub.effectivePlan === 'monthly' || sub.effectivePlan === 'yearly';
  const statusLabel = sub.isTrialActive ? 'Trial' : isPaid ? 'Active' : 'Inactive';
  const statusTone = sub.isTrialActive ? 'amber' : isPaid ? 'green' : 'slate';
  const currentName =
    sub.effectivePlan === 'none' ? 'Free plan' : `${PLAN_INFO[sub.effectivePlan]?.name || sub.effectivePlan} plan`;
  const info = PLAN_INFO[billing];
  const onCurrent = sub.effectivePlan === billing;
  const limitLabel = sub.businessLimit > 100 ? 'Unlimited' : sub.businessLimit;
  const usagePct = sub.businessLimit > 100 ? 12 : Math.min(100, Math.round((sub.businessesUsed / sub.businessLimit) * 100));

  return (
    <div>
      <PageHeader title="Billing & Subscription" subtitle="Manage your plan, usage, and payment method." />
      <ErrorNote>{error}</ErrorNote>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900">{currentName}</h2>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
          <div className="flex gap-2">
            <Link
              to="/owner/reports"
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Usage
            </Link>
            <button
              type="button"
              disabled
              title="No invoices yet"
              className="cursor-not-allowed rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-400"
            >
              Invoices
            </button>
          </div>
        </div>

        {/* Usage strip */}
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Businesses used</span>
            <span className="font-semibold text-slate-900">
              {sub.businessesUsed} <span className="font-normal text-slate-400">/ {limitLabel}</span>
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-brand" style={{ width: `${usagePct}%` }} />
          </div>
          {sub.isTrialActive && (
            <p className="mt-2 text-xs text-amber-600">
              Free trial — {sub.trialDaysLeft} day{sub.trialDaysLeft === 1 ? '' : 's'} left.
            </p>
          )}
        </div>

        {/* Upgrade pitch */}
        <div className="px-6 py-6">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              {info.name}
            </span>
            <h3 className="mt-3 text-xl font-bold text-slate-900">
              {onCurrent ? `You're on the ${info.name} plan` : `Upgrade to ${info.name}`}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Your plan includes a fixed amount of free usage. Unlock more businesses, collaboration, and
              priority support.
            </p>

            {/* Billing toggle */}
            <div className="mt-5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {['monthly', 'yearly'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setBilling(k)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    billing === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <p className="mt-3">
              <span className="text-3xl font-bold text-slate-900">{info.price}</span>
              <span className="text-sm text-slate-500"> {info.period}</span>
              {info.save && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-dark">{info.save}</span>}
            </p>
          </div>

          {/* Feature grid */}
          <div className="mx-auto mt-6 grid max-w-3xl gap-x-6 gap-y-1 md:grid-cols-2">
            {quota(billing).map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{f.label}</span>
                <span className="font-semibold text-brand">{f.value}</span>
              </div>
            ))}
            {CAPABILITIES.map((c) => (
              <div key={c} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-700">{c}</span>
                <CheckDot />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/#pricing" className="text-sm text-brand hover:underline">
              Learn more about Pricing and Plans
            </a>
            {sub.plan === 'none' && (
              <button
                onClick={() => run(api.subscription.startTrial)}
                disabled={busy}
                className="text-sm font-semibold text-accent-dark hover:underline disabled:opacity-60"
              >
                Start 7-day free trial
              </button>
            )}
          </div>
          <button
            type="button"
            disabled={busy || onCurrent}
            onClick={() => setCheckout(true)}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {onCurrent ? 'Current plan' : `Upgrade to ${info.name}`}
          </button>
        </div>
      </div>

      {/* Business plans (marketplace exposure) */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Choose your exposure</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every business gets full internal management. Upgrade a business to Marketplace to also
          list it publicly to customers.
        </p>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <PlanCard
          title="Business Management"
          tag="Included"
          tagTone="slate"
          desc="Run your rental operations privately — never shown in the public marketplace."
          features={BUSINESS_FEATURES}
        />
        <PlanCard
          title="Marketplace"
          tag="Upgrade"
          tagTone="green"
          highlight
          desc="Everything in Business Management, plus publish your business and products to customers."
          features={MARKETPLACE_FEATURES}
        />
      </div>

      {/* Per-business marketplace listing control */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Marketplace listing</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose which of your businesses appear on the public RentFlow marketplace. Switching to
          private keeps all your data — it just hides the business from customers.
        </p>
        {businesses.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No businesses yet.{' '}
            <Link to="/owner/businesses" className="font-semibold text-accent hover:underline">
              Add one first
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {businesses.map((b) => {
              const isMkt = b.subscriptionType === 'marketplace';
              return (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-slate-900">{b.name}</span>
                    <Badge tone={isMkt ? 'green' : 'slate'}>{isMkt ? 'Marketplace' : 'Business'}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {isMkt && (
                      <Link
                        to={`/owner/businesses/${b.id}/products`}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Manage published products
                      </Link>
                    )}
                    <button
                      type="button"
                      disabled={planBusy === b.id}
                      onClick={() => setBusinessPlan(b, isMkt ? 'business' : 'marketplace')}
                      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        isMkt
                          ? 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                          : 'bg-accent text-white hover:bg-accent-dark'
                      }`}
                    >
                      {planBusy === b.id ? 'Saving…' : isMkt ? 'Switch to private' : 'Enable Marketplace'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {checkout && (
        <CheckoutModal
          info={info}
          busy={busy}
          onClose={() => setCheckout(false)}
          onConfirm={async () => {
            const ok = await run(() => api.subscription.choosePlan(billing));
            if (ok) setCheckout(false);
          }}
        />
      )}
    </div>
  );
}

function PlanCard({ title, tag, tagTone, desc, features, highlight }) {
  return (
    <div className={`rounded-2xl border bg-white p-6 ${highlight ? 'border-accent shadow-sm' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <Badge tone={tagTone}>{tag}</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
      <ul className="mt-4 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
            <CheckDot />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckDot() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

/* ── Checkout modal ─────────────────────────────────────── */

const COUNTRIES = ['Philippines', 'United States', 'Singapore', 'Australia', 'United Kingdom', 'Japan', 'Canada'];
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
const fmtExp = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

function CheckoutModal({ info, busy, onClose, onConfirm }) {
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Philippines');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (card.replace(/\D/g, '').length < 13) return setErr('Enter a valid card number.');
    if (!/^\d{2}\/\d{2}$/.test(exp)) return setErr('Enter the expiry as MM/YY.');
    if (!/^\d{3,4}$/.test(cvc)) return setErr('CVC is 3–4 digits.');
    if (!name.trim()) return setErr('Enter the name on the card.');
    setErr('');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-[240px_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* What's included */}
        <aside className="hidden overflow-y-auto border-r border-slate-100 bg-slate-50 p-5 md:block">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">What's included</h3>
          <ul className="space-y-3">
            {INCLUDED.map((it) => (
              <li key={it.title} className="flex gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-800">{it.title}</p>
                  <p className="text-xs text-slate-500">{it.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Payment form */}
        <div className="overflow-y-auto p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <span className="inline-block rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">{info.name}</span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">Upgrade to {info.name}</h2>
              <p className="text-sm text-slate-500">Unlock more businesses and priority support.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">{info.name} plan</span>
            <span className="text-sm font-bold text-slate-900">
              {info.price} <span className="font-normal text-slate-400">{info.period}</span>
            </span>
          </div>

          {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{err}</div>}

          <div className="space-y-4">
            <L label="Card number">
              <input value={card} onChange={(e) => setCard(fmtCard(e.target.value))} inputMode="numeric" placeholder="1234 1234 1234 1234" className={inputCls} />
            </L>
            <div className="grid grid-cols-2 gap-4">
              <L label="Expiration date">
                <input value={exp} onChange={(e) => setExp(fmtExp(e.target.value))} inputMode="numeric" placeholder="MM / YY" className={inputCls} />
              </L>
              <L label="Security code">
                <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="CVC" className={inputCls} />
              </L>
            </div>
            <L label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Dela Cruz" className={inputCls} />
            </L>
            <L label="Country or region">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </L>
            <L label="Address">
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, ZIP" className={inputCls} />
            </L>
            <L label="Tax ID (optional)">
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="123456789012" className={inputCls} />
            </L>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            This is a secure demo checkout — no real charge is made and card details are never stored.
          </p>

          <button
            onClick={submit}
            disabled={busy}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? 'Processing…' : `Upgrade to ${info.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20';

function L({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
