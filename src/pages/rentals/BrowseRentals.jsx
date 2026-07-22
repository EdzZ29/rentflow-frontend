import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { FlameIcon } from '../../components/icons';
import { CATEGORIES, categoryIcon } from '../../lib/categories';
import { api, assetUrl } from '../../lib/api';
import { formatPrice } from '../../lib/currency';

const ITEM_SORTS = [
  { key: 'popular', label: 'Most popular' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'newest', label: 'Newest' },
];
const BIZ_SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name A–Z' },
];
const PKG_SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A–Z' },
];

export default function BrowseRentals() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const [view, setView] = useState('items'); // items | packages | businesses
  const [products, setProducts] = useState(null);
  const [packages, setPackages] = useState(null);
  const [businesses, setBusinesses] = useState(null);
  const [search, setSearch] = useState(params.get('q') || '');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('popular');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.rentals.products(), api.rentals.packages(), api.rentals.list()])
      .then(([p, pkg, b]) => {
        setProducts(p);
        setPackages(pkg);
        setBusinesses(b);
      })
      .catch((e) => setError(e.message));
  }, []);

  const setCategory = (name) => {
    const next = new URLSearchParams(params);
    if (name) next.set('category', name);
    else next.delete('category');
    setParams(next);
  };

  const dataset = view === 'items' ? products : view === 'packages' ? packages : businesses;

  const counts = useMemo(() => {
    const map = {};
    (dataset || []).forEach((x) => {
      map[x.category] = (map[x.category] || 0) + 1;
    });
    return map;
  }, [dataset]);

  const locations = useMemo(() => {
    const set = new Set();
    (dataset || []).forEach((x) => x.location && set.add(x.location));
    return [...set].sort();
  }, [dataset]);

  const filtered = useMemo(() => {
    let list = [...(dataset || [])];
    if (category) list = list.filter((x) => x.category === category);
    if (location) list = list.filter((x) => x.location === location);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          (x.businessName || '').toLowerCase().includes(q) ||
          (x.location || '').toLowerCase().includes(q),
      );
    }
    // sort — items & packages share price sorts (items use pricePerDay,
    // packages use price); businesses only sort by name/newest.
    if (view === 'businesses') {
      if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      const priceOf = (x) => (view === 'items' ? x.pricePerDay : x.price);
      if (sort === 'price_asc') list.sort((a, b) => priceOf(a) - priceOf(b));
      else if (sort === 'price_desc') list.sort((a, b) => priceOf(b) - priceOf(a));
      else if (sort === 'popular') list.sort((a, b) => (b.bookings || 0) - (a.bookings || 0));
      else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
      // newest = keep API order (already newest-first)
    }
    return list;
  }, [dataset, category, location, search, sort, view]);

  const catSuffix =
    view === 'items' ? ' for rent' : view === 'packages' ? ' packages' : ' businesses';
  const allLabel =
    view === 'items' ? 'All rentals' : view === 'packages' ? 'All packages' : 'All businesses';
  const heading = category ? `${category}${catSuffix}` : allLabel;

  const sorts = view === 'items' ? ITEM_SORTS : view === 'packages' ? PKG_SORTS : BIZ_SORTS;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm text-slate-500">
            <Link to="/" className="hover:text-accent">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/rentals" className="hover:text-accent">Find a rent</Link>
            {category && (<><span className="mx-2">/</span><span className="text-slate-700">{category}</span></>)}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{heading}</h1>
          <p className="mt-2 text-slate-600">Browse, filter, and reserve what you need.</p>

          {/* View toggle */}
          <div className="mt-6 inline-flex rounded-lg border border-slate-300 bg-white p-1">
            {[
              { k: 'items', label: 'Items' },
              { k: 'packages', label: 'Packages' },
              { k: 'businesses', label: 'Businesses' },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => { setView(t.k); setSort(t.k === 'items' ? 'popular' : 'newest'); setLocation(''); }}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${view === t.k ? 'bg-accent text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside>
            <p className="mb-3 text-sm font-semibold text-slate-900">Categories</p>
            <ul className="space-y-1">
              <FilterItem label={allLabel} count={(dataset || []).length} active={!category} onClick={() => setCategory('')} />
              {CATEGORIES.map((c) => (
                <FilterItem key={c.name} label={c.name} count={counts[c.name] || 0} active={category === c.name} onClick={() => setCategory(c.name)} />
              ))}
            </ul>
          </aside>

          <div>
            {/* Toolbar: search + location + sort */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-accent">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full text-sm outline-none" />
              </div>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent">
                <option value="">All locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent">
                {sorts.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>

            {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {!dataset && !error && <p className="py-12 text-center text-sm text-slate-400">Loading…</p>}
            {dataset && (
              <>
                <p className="mb-4 text-sm text-slate-500">{filtered.length} result{filtered.length === 1 ? '' : 's'}</p>
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
                    Nothing found. Try different filters.
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {view === 'items' && filtered.map((p) => <ProductCard key={p.id} p={p} />)}
                    {view === 'packages' && filtered.map((p) => <PackageCard key={p.id} p={p} />)}
                    {view === 'businesses' && filtered.map((b) => <BusinessCard key={b.id} b={b} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FilterItem({ label, count, active, onClick }) {
  return (
    <li>
      <button onClick={onClick} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-accent/10 font-semibold text-accent-dark' : 'text-slate-600 hover:bg-slate-100'}`}>
        {label}
        <span className={`text-xs ${active ? 'text-accent-dark' : 'text-slate-400'}`}>{count}</span>
      </button>
    </li>
  );
}

function ProductCard({ p }) {
  const img = assetUrl(p.imageUrl);
  return (
    <Link to={`/rentals/product/${p.id}`} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 bg-slate-100">
        {img ? (
          <img src={img} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(p.category)} />
            </svg>
          </div>
        )}
        {p.bookings > 0 && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
            <FlameIcon className="h-3.5 w-3.5 text-amber-500" /> {p.bookings} booking{p.bookings === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">{p.name}</h3>
        <p className="text-xs text-slate-500">{p.businessName}{p.location ? ` · ${p.location}` : ''}</p>
        <span className="mt-2 inline-block w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{p.category}</span>
        <p className="mt-auto pt-3 text-lg font-bold text-brand">{formatPrice(p.pricePerDay, p.currency)}<span className="text-sm font-normal text-slate-400">/day</span></p>
      </div>
    </Link>
  );
}

function PackageCard({ p }) {
  const unit = p.priceUnit === 'day' ? '/day' : '';
  return (
    <Link to={`/rentals/business/${p.businessId}`} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-br from-brand/10 to-accent/20 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Package
        </span>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600">{p.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">{p.name}</h3>
        <p className="text-xs text-slate-500">{p.businessName}{p.location ? ` · ${p.location}` : ''}</p>
        {p.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description}</p>}
        {p.items?.length > 0 && (
          <ul className="mt-3 space-y-1">
            {p.items.slice(0, 3).map((it, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {it}
              </li>
            ))}
            {p.items.length > 3 && (
              <li className="text-xs text-slate-400">+{p.items.length - 3} more</li>
            )}
          </ul>
        )}
        <p className="mt-auto pt-3 text-lg font-bold text-brand">
          {formatPrice(p.price, p.currency)}
          <span className="text-sm font-normal text-slate-400">{unit}</span>
        </p>
      </div>
    </Link>
  );
}

function BusinessCard({ b }) {
  return (
    <Link to={`/rentals?category=${encodeURIComponent(b.category)}`} className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-32 bg-slate-100">
        {b.imageUrl ? (
          <img src={assetUrl(b.imageUrl)} alt={b.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(b.category)} />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{b.name}</h3>
        <p className="text-xs text-slate-500">{b.location || 'Location on request'}{b.ownerName ? ` · ${b.ownerName}` : ''}</p>
        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{b.category}</span>
        {b.description && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{b.description}</p>}
      </div>
    </Link>
  );
}
