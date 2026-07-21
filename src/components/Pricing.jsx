import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: 'for 7 days',
    description: 'Explore everything RentFlow offers no credit card required.',
    cta: 'Start free trial',
    highlighted: false,
    features: [
      'Full access for 7 days',
      '1 rental business',
      'Unlimited bookings & reservations',
      'Card, GCash & PayPal payments',
      'Email support',
    ],
  },
  {
    name: 'Monthly',
    price: '20$',
    period: 'per month',
    description: 'Everything a growing rental business needs, billed monthly.',
    cta: 'Choose Monthly',
    highlighted: false,
    features: [
      'Up to 5 rental businesses',
      'Unlimited bookings & reservations',
      'Analytics & reports',
      'Customer management',
      'Card, GCash & PayPal payments',
      'Priority support',
    ],
  },
  {
    name: 'Yearly',
    price: '$230',
    period: 'per year',
    badge: 'Save 2 months',
    description: 'Best value for established businesses two months free.',
    cta: 'Choose Yearly',
    highlighted: true,
    features: [
      'Everything in Monthly',
      'Unlimited rental businesses',
      'Multi-branch support',
      'Advanced analytics & reports',
      'Priority support',
      '2 months free vs. monthly',
    ],
  },
];

// Every business gets full internal management; Marketplace adds public exposure.
// Kept in sync with the owner dashboard (OwnerSubscription.jsx).
const exposurePlans = [
  {
    name: 'Business Management',
    tag: 'Included',
    highlighted: false,
    description: 'Run your rental operations privately — never shown in the public marketplace.',
    features: [
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
    ],
  },
  {
    name: 'Marketplace',
    tag: 'Upgrade',
    highlighted: true,
    description: 'Everything in Business Management, plus publish your business and products to customers.',
    features: [
      'Everything in Business Management',
      'Public business profile',
      'Publish rental products & services',
      'Customer search & filtering',
      'Online bookings & reservation requests',
      'Ratings & reviews (coming soon)',
      'Direct customer inquiries',
    ],
  },
];

function Check({ className = '' }) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, flexible plans
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Start with a 7-day free trial. Upgrade any time — cancel whenever you
            like.
          </p>
        </div>

        <div className="mt-16 grid items-start gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? 'relative rounded-2xl border-2 border-accent bg-white p-8 shadow-xl lg:-mt-4 lg:mb-4'
                  : 'relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'
              }
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white shadow">
                  Most popular
                </span>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                {plan.badge && (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {plan.description}
              </p>

              <Link
                to="/signup"
                className={
                  plan.highlighted
                    ? 'mt-6 block rounded-lg bg-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-dark'
                    : 'mt-6 block rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:text-brand'
                }
              >
                {plan.cta}
              </Link>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  What's included
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={plan.highlighted ? 'text-accent' : 'text-brand'} />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          All plans include secure cloud hosting, automatic updates, and your own
          online booking page.
        </p>

        {/* Exposure plans — how each business is presented to customers */}
        <div className="mx-auto mt-24 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Business plans
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Choose your exposure
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every business gets full internal management. Upgrade any business to
            Marketplace to also list it publicly to customers.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl items-start gap-8 md:grid-cols-2">
          {exposurePlans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? 'relative rounded-2xl border-2 border-accent bg-white p-8 shadow-xl'
                  : 'relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <span
                  className={
                    plan.highlighted
                      ? 'rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-dark'
                      : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500'
                  }
                >
                  {plan.tag}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {plan.description}
              </p>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  What's included
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={plan.highlighted ? 'text-accent' : 'text-brand'} />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
