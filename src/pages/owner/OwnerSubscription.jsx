import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

// Plan information for Business and Marketplace tiers across monthly & yearly billing cycles
export const PLAN_TIER_CONFIG = {
  business: {
    id: 'business',
    title: 'Business Management',
    tag: 'Included',
    tagTone: 'slate',
    desc: 'Run your rental operations privately — perfect for individual shop owners.',
    monthly: { price: '$29', period: 'per month' },
    yearly: { price: '$290', period: 'per year', save: 'Save 2 months' },
    limitLabel: { monthly: 'Up to 5 businesses', yearly: 'Unlimited businesses' },
  },
  marketplace: {
    id: 'marketplace',
    title: 'Marketplace Exposure',
    tag: 'Recommended',
    tagTone: 'green',
    highlight: true,
    desc: 'Everything in Business Management, plus publish your business & products to public customers.',
    monthly: { price: '$49', period: 'per month' },
    yearly: { price: '$490', period: 'per year', save: 'Save 2 months' },
    limitLabel: { monthly: 'Up to 5 businesses', yearly: 'Unlimited businesses' },
  },
};

const quota = (billing) => [
  { label: 'Rental businesses', value: billing === 'yearly' ? 'Unlimited' : 'Up to 5 businesses' },
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
  { title: 'Payment methods', desc: 'PayPal and online subscriptions' },
  { title: 'Priority support', desc: 'Faster help whenever you need it' },
];

const BUSINESS_FEATURES = [
  'Dashboard & Analytics',
  'Booking & reservation management',
  'Inventory / asset management',
  'Customer management (CRM)',
  'Employee & role management',
  'Payments & invoicing',
  'Maintenance scheduling',
  'Notifications & Business settings',
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

/**
 * Resolves the PayPal Plan ID from environment variables based on plan tier and billing period.
 */
export function getPaypalPlanId(tier, billing) {
  if (tier === 'business') {
    if (billing === 'monthly') {
      return (
        import.meta.env.VITE_PAYPAL_BUSINESS_MONTHLY_PLAN_ID ||
        import.meta.env.VITE_PAYPAL_PLAN_ID ||
        ''
      );
    }
    if (billing === 'yearly') {
      return import.meta.env.VITE_PAYPAL_BUSINESS_YEARLY_PLAN_ID || '';
    }
  }
  if (tier === 'marketplace') {
    if (billing === 'monthly') {
      return import.meta.env.VITE_PAYPAL_MARKETPLACE_MONTHLY_PLAN_ID || '';
    }
    if (billing === 'yearly') {
      return import.meta.env.VITE_PAYPAL_MARKETPLACE_YEARLY_PLAN_ID || '';
    }
  }
  return '';
}

export default function OwnerSubscription() {
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [comingSoonTarget, setComingSoonTarget] = useState(null);

  useEffect(() => {
    api.subscription
      .get()
      .then((s) => {
        setSub(s);
        setBilling(s.effectivePlan === 'monthly' ? 'yearly' : 'monthly');
      })
      .catch((e) => setError(e.message));
  }, []);

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

  const handleSelectPlan = (tier, selectedBilling = billing) => {
    const planId = getPaypalPlanId(tier, selectedBilling);
    if (!planId) {
      setComingSoonTarget({ tier, billing: selectedBilling });
    } else {
      setCheckoutTarget({ tier, billing: selectedBilling });
    }
  };

  if (!sub) return <Loading />;

  const isPaid = sub.effectivePlan === 'monthly' || sub.effectivePlan === 'yearly';
  const statusLabel = sub.isTrialActive ? 'Trial' : isPaid ? 'Active' : 'Inactive';
  const statusTone = sub.isTrialActive ? 'amber' : isPaid ? 'green' : 'slate';
  const currentPlanName =
    sub.effectivePlan === 'none'
      ? 'Free plan'
      : `${sub.effectivePlan === 'yearly' ? 'Yearly' : 'Monthly'} plan`;

  const limitLabel = sub.businessLimit > 100 ? 'Unlimited' : sub.businessLimit;
  const usagePct =
    sub.businessLimit > 100 ? 12 : Math.min(100, Math.round((sub.businessesUsed / sub.businessLimit) * 100));

  const bizInfo = PLAN_TIER_CONFIG.business[billing];
  const mktInfo = PLAN_TIER_CONFIG.marketplace[billing];
  const onCurrentBilling = sub.effectivePlan === billing;

  return (
    <div>
      <PageHeader title="Billing & Subscription" subtitle="Manage your plan, usage, and payment method." />
      <ErrorNote>{error}</ErrorNote>

      {/* Subscription Summary Box */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900">{currentPlanName}</h2>
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

        {/* Plan Header & Billing Switcher */}
        <div className="px-6 py-6">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="text-xl font-bold text-slate-900">Choose your subscription plan</h3>
            <p className="mt-2 text-sm text-slate-500">
              Select between Business Management or Marketplace Exposure to unlock more features, businesses, and public reach.
            </p>

            {/* Global Billing Toggle */}
            <div className="mt-5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {['monthly', 'yearly'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setBilling(k)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    billing === k ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {k} {k === 'yearly' && <span className="ml-1 text-xs text-emerald-600 font-semibold">(Save 2 mos)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Features comparison */}
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

        {/* Summary Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <a href="/#pricing" className="text-sm text-brand hover:underline">
              Learn more about Pricing and Plans
            </a>
            {sub.plan === 'none' && (
              <button
                type="button"
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
            disabled={busy || onCurrentBilling}
            onClick={() => handleSelectPlan('business', billing)}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {onCurrentBilling ? 'Current Billing Cycle' : `Upgrade to ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`}
          </button>
        </div>
      </div>

      {/* Business Plan Cards with Aligned Action Buttons */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Select Plan Tier & Exposure</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose the plan tier that fits your growth. Buttons are aligned for easy comparison.
        </p>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2 items-stretch">
        <PlanCard
          title={PLAN_TIER_CONFIG.business.title}
          tag={PLAN_TIER_CONFIG.business.tag}
          tagTone={PLAN_TIER_CONFIG.business.tagTone}
          desc={PLAN_TIER_CONFIG.business.desc}
          price={bizInfo.price}
          period={bizInfo.period}
          save={bizInfo.save}
          features={BUSINESS_FEATURES}
          isCurrent={sub.effectivePlan === billing}
          onSelect={() => handleSelectPlan('business', billing)}
          actionLabel={`Choose Business ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`}
        />

        <PlanCard
          title={PLAN_TIER_CONFIG.marketplace.title}
          tag={PLAN_TIER_CONFIG.marketplace.tag}
          tagTone={PLAN_TIER_CONFIG.marketplace.tagTone}
          highlight={PLAN_TIER_CONFIG.marketplace.highlight}
          desc={PLAN_TIER_CONFIG.marketplace.desc}
          price={mktInfo.price}
          period={mktInfo.period}
          save={mktInfo.save}
          features={MARKETPLACE_FEATURES}
          isCurrent={false}
          onSelect={() => handleSelectPlan('marketplace', billing)}
          actionLabel={`Choose Marketplace ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`}
        />
      </div>

      {/* Per-business marketplace listing note */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600 max-w-2xl">
          Choose which of your businesses appear on the public Rentivo marketplace from the
          <span className="font-semibold text-slate-800"> My Businesses</span> page. Switching to private keeps all your data — it just hides the business from public search.
        </p>
        <Link
          to="/owner/businesses"
          className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          Manage marketplace listing
        </Link>
      </div>

      {/* Modals */}
      {comingSoonTarget && (
        <ComingSoonModal
          target={comingSoonTarget}
          onClose={() => setComingSoonTarget(null)}
        />
      )}

      {checkoutTarget && (
        <CheckoutModal
          initialTarget={checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
          onSuccess={(nextSub) => {
            setSub(nextSub);
            setCheckoutTarget(null);
          }}
          onComingSoon={(target) => {
            setCheckoutTarget(null);
            setComingSoonTarget(target);
          }}
        />
      )}
    </div>
  );
}

/**
 * Reusable PlanCard component with flex layout for bottom button alignment
 */
function PlanCard({
  title,
  tag,
  tagTone,
  desc,
  price,
  period,
  save,
  features,
  highlight,
  onSelect,
  isCurrent,
  actionLabel,
}) {
  return (
    <div
      className={`flex flex-col justify-between h-full rounded-2xl border bg-white p-6 transition-all ${
        highlight ? 'border-accent shadow-md ring-1 ring-accent/20' : 'border-slate-200 shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <Badge tone={tagTone}>{tag}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
        {price && (
          <p className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{price}</span>
            <span className="text-sm font-medium text-slate-500"> {period}</span>
            {save && (
              <span className="ml-2.5 inline-block rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {save}
              </span>
            )}
          </p>
        )}
        <div className="my-4 border-t border-slate-100" />
        <ul className="space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
              <CheckDot />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Aligned bottom action container */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={isCurrent}
          onClick={onSelect}
          className={`w-full rounded-lg py-2.5 px-4 text-center text-sm font-semibold transition-colors ${
            isCurrent
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : highlight
              ? 'bg-accent text-white hover:bg-accent-dark'
              : 'bg-brand text-white hover:bg-slate-800'
          }`}
        >
          {isCurrent ? 'Current Plan' : actionLabel || 'Select Plan'}
        </button>
      </div>
    </div>
  );
}

function CheckDot() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

/**
 * Clean, user-friendly modal shown when online checkout for a plan is coming soon.
 */
function ComingSoonModal({ target, onClose }) {
  if (!target) return null;
  const tierName = target.tier === 'marketplace' ? 'Marketplace' : 'Business Management';
  const billingName = target.billing === 'yearly' ? 'Yearly' : 'Monthly';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-500 mb-4">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <Badge tone="amber">Coming Soon</Badge>
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {tierName} ({billingName}) Plan
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Online checkout for the <span className="font-semibold text-slate-800">{tierName} ({billingName})</span> plan is coming soon. Please check back shortly or contact support if you have questions.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Checkout modal ─────────────────────────────────────── */

function CheckoutModal({ initialTarget, onClose, onSuccess, onComingSoon }) {
  const { refreshUser } = useAuth();
  const [tier, setTier] = useState(initialTarget?.tier || 'business');
  const [billing, setBilling] = useState(initialTarget?.billing || 'monthly');
  const [err, setErr] = useState('');

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const planId = getPaypalPlanId(tier, billing);

  const planConfig = PLAN_TIER_CONFIG[tier];
  const cycleConfig = planConfig[billing];

  const handleSwitchOption = (newTier, newBilling) => {
    setTier(newTier);
    setBilling(newBilling);
    const newPlanId = getPaypalPlanId(newTier, newBilling);
    if (!newPlanId && onComingSoon) {
      onComingSoon({ tier: newTier, billing: newBilling });
    }
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
              <span className="inline-block rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                {planConfig.title}
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                Checkout — {planConfig.title} ({billing === 'yearly' ? 'Yearly' : 'Monthly'})
              </h2>
              <p className="text-sm text-slate-500">Unlock features, businesses, and priority support.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Plan & Cycle Selectors in Modal */}
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => handleSwitchOption('business', billing)}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tier === 'business' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Business Plan
            </button>
            <button
              type="button"
              onClick={() => handleSwitchOption('marketplace', billing)}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                tier === 'marketplace' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Marketplace Plan
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">
                {planConfig.title}
              </span>
              {/* Billing Toggle inside order summary */}
              <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchOption(tier, 'monthly')}
                  className={`px-2 py-0.5 rounded ${billing === 'monthly' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchOption(tier, 'yearly')}
                  className={`px-2 py-0.5 rounded ${billing === 'yearly' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600'}`}
                >
                  Yearly
                </button>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {cycleConfig.price} <span className="font-normal text-slate-400">{cycleConfig.period}</span>
            </span>
          </div>

          {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{err}</div>}

          {/* PayPal Checkout Button */}
          {clientId && planId ? (
            <div className="mb-6 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Subscribe with PayPal ({planConfig.title} - {billing})
              </p>
              <PayPalScriptProvider options={{ 'client-id': clientId, intent: 'subscription', vault: true }}>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'blue', shape: 'rect' }}
                  createSubscription={(data, actions) => {
                    return actions.subscription.create({ plan_id: planId });
                  }}
                  onApprove={async (data) => {
                    try {
                      const nextSub = await api.subscription.activatePaypal(data.subscriptionID, billing);
                      await refreshUser();
                      if (onSuccess) onSuccess(nextSub);
                    } catch (e) {
                      setErr(e.message);
                    }
                  }}
                  onError={() => {
                    setErr('PayPal checkout failed. Please try again.');
                  }}
                />
              </PayPalScriptProvider>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Coming Soon
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Online checkout for the {planConfig.title} ({billing}) plan is coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
