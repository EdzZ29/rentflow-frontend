import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { MapPinIcon } from '../../components/icons';
import { StarRating } from '../../components/StarRating';
import { categoryIcon } from '../../lib/categories';
import { api } from '../../lib/api';
import { cityOf } from '../../lib/location';
import { formatPrice } from '../../lib/currency';

export default function PackageDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setP(null);
    setError('');
    api.rentals.package(id).then(setP).catch((e) => setError(e.message));
  }, [id]);

  const city = p && cityOf(p.location);
  const unit = p?.priceUnit === 'day' ? '/day' : '';
  const itemValues = p?.itemValues || [];
  const options = p?.options || [];
  const tiers = p?.tiers || [];
  const individualTotal = itemValues.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const savings = individualTotal - Number(p?.price || 0);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-slate-500">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/rentals" className="hover:text-accent">Find a rent</Link>
        </p>

        {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {!p && !error && <p className="mt-10 text-slate-400">Loading…</p>}

        {p && (
          <div className="mt-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Package
                </span>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{p.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{p.category}</span>
                  {city && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {city}</span>}
                  <StarRating value={p.rating} count={p.reviewCount} />
                  {p.businessName && <span>· by {p.businessName}</span>}
                </div>
              </div>
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-accent/20 text-brand sm:flex">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(p.category)} />
                </svg>
              </div>
            </div>

            {p.description && <p className="mt-6 leading-relaxed text-slate-700">{p.description}</p>}

            {/* Package price */}
            <div className="mt-6 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-sm text-slate-500">Package price</p>
                <p className="text-3xl font-bold text-brand">
                  {formatPrice(p.price, p.currency)}<span className="text-base font-normal text-slate-400">{unit}</span>
                </p>
              </div>
              {savings > 0 && (
                <div className="text-right">
                  <p className="text-sm text-slate-400 line-through">{formatPrice(individualTotal, p.currency)}</p>
                  <p className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    You save {formatPrice(savings, p.currency)}
                  </p>
                </div>
              )}
            </div>

            {/* 1. Itemised value breakdown */}
            {itemValues.length > 0 && (
              <Section title="What you get — and its value">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {itemValues.map((r, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-slate-700">{r.label}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-slate-900">{formatPrice(r.value, p.currency)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">If booked individually</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">{formatPrice(individualTotal, p.currency)}</td>
                      </tr>
                      <tr className="bg-emerald-50">
                        <td className="px-4 py-2.5 font-semibold text-emerald-800">As this package</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                          {formatPrice(p.price, p.currency)}
                          {savings > 0 && <span className="ml-2 text-xs font-semibold">(save {formatPrice(savings, p.currency)})</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Plain inclusions (if the owner listed simple lines) */}
            {p.items?.length > 0 && itemValues.length === 0 && (
              <Section title="What's included">
                <ul className="space-y-1.5">
                  {p.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <svg className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {it}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 2. Options A / B */}
            {options.length > 0 && (
              <Section title="Choose an option">
                <div className="grid gap-4 sm:grid-cols-2">
                  {options.map((o, i) => (
                    <div key={i} className="flex flex-col rounded-2xl border border-slate-200 p-5 transition-shadow hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">{o.name}</h3>
                        <p className="text-xl font-bold text-brand">{formatPrice(o.price, p.currency)}</p>
                      </div>
                      {o.inclusions?.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {o.inclusions.map((inc, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                              <svg className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {inc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* 3. Tiered pricing with exchanges */}
            {tiers.length > 0 && (
              <Section title="Flexible pricing">
                <p className="-mt-1 mb-3 text-sm text-slate-500">
                  Prefer a lower price? Each discount comes with a simple exchange.
                </p>
                <ul className="space-y-2">
                  {tiers.map((t, i) => (
                    <li key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                      <span className="shrink-0 rounded-lg bg-brand/10 px-3 py-1.5 text-base font-bold text-brand">
                        {formatPrice(t.price, p.currency)}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {t.condition}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <Link to={`/rentals/business/${p.businessId}`} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
                View business &amp; items
              </Link>
              <Link to="/rentals" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand">
                Back to browse
              </Link>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      {children}
    </div>
  );
}
