import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: 'for 7 days',
    description: 'Explore everything RentFlow offers — no credit card required.',
    cta: 'Start free trial',
    highlighted: false,
    features: [
      'Full access to all core features',
      'Up to 25 rental items',
      '1 user account',
      'Online booking page',
      'Email support',
    ],
  },
  {
    name: 'Monthly',
    price: '$29',
    period: 'per month',
    description: 'Everything a growing rental business needs, billed monthly.',
    cta: 'Choose Monthly',
    highlighted: false,
    features: [
      'Unlimited rental items',
      'Up to 10 team members',
      'Reservations & payments',
      'Maintenance tracking',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  {
    name: 'Yearly',
    price: '$290',
    period: 'per year',
    badge: 'Save 2 months',
    description: 'Best value for established businesses — two months free.',
    cta: 'Choose Yearly',
    highlighted: true,
    features: [
      'Everything in Monthly',
      'Multi-branch support',
      'Advanced analytics & reports',
      'Custom-branded booking page',
      'Dedicated account manager',
      '2 months free vs. monthly',
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
      </div>
    </section>
  );
}
