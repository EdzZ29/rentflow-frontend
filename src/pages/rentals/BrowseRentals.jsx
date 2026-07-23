import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { FlameIcon, MapPinIcon } from '../../components/icons';
import { StarRating } from '../../components/StarRating';
import { CATEGORIES, categoryIcon } from '../../lib/categories';
import { api, assetUrl } from '../../lib/api';
import { cityOf } from '../../lib/location';
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

// Card display modes the user can switch between. `cols` drives the grid;
// `list` renders horizontal rows instead.
const LAYOUTS = [
  { key: 'grid', label: 'Grid', cols: 'sm:grid-cols-2 xl:grid-cols-3', icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z' },
  { key: 'compact', label: 'Compact', cols: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4', icon: 'M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z' },
  { key: 'list', label: 'List', cols: 'grid-cols-1', icon: 'M4 6h16M4 12h16M4 18h16' },
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
  // Card display mode — remembered across visits.
  const [layout, setLayout] = useState(() => {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem('rentals.layout');
    return LAYOUTS.some((l) => l.key === saved) ? saved : 'grid';
  });
  const [fading, setFading] = useState(false);

  // Cross-fade the grid when switching layouts so the change feels smooth.
  const changeLayout = (next) => {
    if (next === layout) return;
    setFading(true);
    setTimeout(() => {
      setLayout(next);
      try { localStorage.setItem('rentals.layout', next); } catch { /* ignore */ }
      setFading(false);
    }, 160);
  };
  const activeLayout = LAYOUTS.find((l) => l.key === layout) || LAYOUTS[0];

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
              {/* Card display toggle */}
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
                {LAYOUTS.map((l) => (
                  <button
                    key={l.key}
                    onClick={() => changeLayout(l.key)}
                    title={`${l.label} view`}
                    aria-label={`${l.label} view`}
                    aria-pressed={layout === l.key}
                    className={`rounded-md p-1.5 transition-colors ${layout === l.key ? 'bg-accent text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={l.icon} />
                    </svg>
                  </button>
                ))}
              </div>
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
                  <div className={`grid gap-5 ${activeLayout.cols} transition-opacity duration-150 ${fading ? 'opacity-0' : 'opacity-100'}`}>
                    {view === 'items' && filtered.map((p) => <ProductCard key={p.id} p={p} layout={layout} />)}
                    {view === 'packages' && filtered.map((p) => <PackageCard key={p.id} p={p} layout={layout} />)}
                    {view === 'businesses' && filtered.map((b) => <BusinessCard key={b.id} b={b} layout={layout} />)}
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

function ProductThumb({ p, img, available, className }) {
  return (
    <div className={`relative bg-slate-100 ${className}`}>
      {img ? (
        <img src={img} alt={p.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
          <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(p.category)} />
          </svg>
        </div>
      )}
      <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm ${available ? 'bg-emerald-500/95 text-white' : 'bg-slate-500/95 text-white'}`}>
        {available ? 'Available' : 'Unavailable'}
      </span>
      {p.bookings > 0 && (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
          <FlameIcon className="h-3.5 w-3.5 text-amber-500" /> {p.bookings} booking{p.bookings === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );
}

function ProductCard({ p, layout = 'grid' }) {
  const img = assetUrl(p.imageUrl);
  const city = cityOf(p.location);
  const available = p.availability === 'available';

  if (layout === 'list') {
    return (
      <Link to={`/rentals/product/${p.id}`} className="group flex flex-row overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
        <ProductThumb p={p} img={img} available={available} className="h-auto w-40 shrink-0 sm:w-56" />
        <div className="flex flex-1 flex-col justify-center gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">{p.name}</h3>
            {city && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPinIcon className="h-3.5 w-3.5" /> {city}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-block w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{p.category}</span>
              <StarRating value={p.rating} count={p.reviewCount} size="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
            <p className="text-lg font-bold text-brand">{formatPrice(p.pricePerDay, p.currency)}<span className="text-sm font-normal text-slate-400">/day</span></p>
            <span className="rounded-lg border border-accent bg-accent/5 px-4 py-2 text-center text-sm font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
              View details
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/rentals/product/${p.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
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
        {/* Availability badge */}
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm ${available ? 'bg-emerald-500/95 text-white' : 'bg-slate-500/95 text-white'}`}>
          {available ? 'Available' : 'Unavailable'}
        </span>
        {p.bookings > 0 && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
            <FlameIcon className="h-3.5 w-3.5 text-amber-500" /> {p.bookings} booking{p.bookings === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">{p.name}</h3>
        </div>
        {/* Location — city only */}
        {city && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPinIcon className="h-3.5 w-3.5" /> {city}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-block w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{p.category}</span>
          <StarRating value={p.rating} count={p.reviewCount} size="h-3.5 w-3.5" />
        </div>
        <p className="mt-auto pt-3 text-lg font-bold text-brand">{formatPrice(p.pricePerDay, p.currency)}<span className="text-sm font-normal text-slate-400">/day</span></p>
        {/* View details button */}
        <span className="mt-3 block rounded-lg border border-accent bg-accent/5 px-4 py-2 text-center text-sm font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
          View details
        </span>
      </div>
    </Link>
  );
}

function PackageCard({ p, layout = 'grid' }) {
  const unit = p.priceUnit === 'day' ? '/day' : '';
  const city = cityOf(p.location);
  const available = p.availability === 'available';
  const individualTotal = (p.itemValues || []).reduce((s, r) => s + (Number(r.value) || 0), 0);
  const savings = individualTotal - Number(p.price || 0);
  const savingsBadge = savings > 0 && (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      Save {formatPrice(savings, p.currency)}
    </span>
  );

  if (layout === 'list') {
    return (
      <Link to={`/rentals/package/${p.id}`} className="group flex flex-row overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
        <div className="flex w-40 shrink-0 flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-brand/10 to-accent/20 p-4 text-brand sm:w-52">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="text-xs font-semibold">Package</span>
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600">{p.category}</span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">{p.name}</h3>
            {city && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPinIcon className="h-3.5 w-3.5" /> {city}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StarRating value={p.rating} count={p.reviewCount} size="h-3.5 w-3.5" />
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {available ? 'Available' : 'Unavailable'}
              </span>
              {savingsBadge}
            </div>
            {p.description && <p className="mt-2 line-clamp-1 text-sm text-slate-600">{p.description}</p>}
          </div>
          <div className="mt-3 flex items-center gap-4 sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
            <p className="text-lg font-bold text-brand">{formatPrice(p.price, p.currency)}<span className="text-sm font-normal text-slate-400">{unit}</span></p>
            <span className="rounded-lg border border-accent bg-accent/5 px-4 py-2 text-center text-sm font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
              View details
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/rentals/package/${p.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
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
        {city && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPinIcon className="h-3.5 w-3.5" /> {city}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StarRating value={p.rating} count={p.reviewCount} size="h-3.5 w-3.5" />
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {available ? 'Available' : 'Unavailable'}
          </span>
          {savingsBadge}
        </div>
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
        <span className="mt-3 block rounded-lg border border-accent bg-accent/5 px-4 py-2 text-center text-sm font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
          View details
        </span>
      </div>
    </Link>
  );
}

function BusinessThumb({ b, className }) {
  return (
    <div className={`bg-slate-100 ${className}`}>
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
  );
}

function BusinessCard({ b, layout = 'grid' }) {
  const city = cityOf(b.location);

  if (layout === 'list') {
    return (
      <Link to={`/rentals/business/${b.id}`} className="group flex flex-row overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md">
        <BusinessThumb b={b} className="h-auto w-40 shrink-0 sm:w-56" />
        <div className="flex flex-1 flex-col justify-center gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">{b.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPinIcon className="h-3.5 w-3.5" /> {city || 'Location on request'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{b.category}</span>
              <StarRating value={b.rating} count={b.reviewCount} size="h-3.5 w-3.5" />
            </div>
            {b.description && <p className="mt-2 line-clamp-1 text-sm text-slate-600">{b.description}</p>}
          </div>
          <span className="mt-3 shrink-0 self-start rounded-lg border border-accent bg-accent/5 px-4 py-2 text-center text-sm font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white sm:mt-0 sm:self-center">
            View details
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/rentals/business/${b.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
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
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">{b.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <MapPinIcon className="h-3.5 w-3.5" /> {city || 'Location on request'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{b.category}</span>
          <StarRating value={b.rating} count={b.reviewCount} size="h-3.5 w-3.5" />
        </div>
        {b.description && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{b.description}</p>}
        <span className="mt-4 block rounded-lg border border-accent bg-accent/5 px-4 py-2 text-center text-sm font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
          View details
        </span>
      </div>
    </Link>
  );
}
