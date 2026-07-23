import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { MapPinIcon } from '../../components/icons';
import { StarRating } from '../../components/StarRating';
import { categoryIcon } from '../../lib/categories';
import { api, assetUrl } from '../../lib/api';
import { cityOf } from '../../lib/location';
import { formatPrice } from '../../lib/currency';

export default function RentalDetail() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setB(null);
    setError('');
    api.rentals
      .get(id)
      .then(setB)
      .catch((e) => setError(e.message));
  }, [id]);

  const city = b && cityOf(b.location);
  const products = b?.products || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-slate-500">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/rentals" className="hover:text-accent">Find a rent</Link>
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {!b && !error && <p className="mt-10 text-slate-400">Loading…</p>}

        {b && (
          <>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="h-56 overflow-hidden rounded-2xl bg-slate-100">
                {b.imageUrl ? (
                  <img src={assetUrl(b.imageUrl)} alt={b.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
                    <svg className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(b.category)} />
                    </svg>
                  </div>
                )}
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{b.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{b.category}</span>
                {city && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {city}</span>}
                <StarRating value={b.rating} count={b.reviewCount} />
                {b.ownerName && <span>· by {b.ownerName}</span>}
              </div>
              {b.description && (
                <p className="mt-6 leading-relaxed text-slate-700">{b.description}</p>
              )}
            </div>

            {/* Booking card */}
            <aside className="h-fit rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500">Interested in this rental?</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Browse the items</p>
              <p className="mt-2 text-sm text-slate-600">
                Pick an item below to see rates, rules, and to book or reserve your dates.
              </p>
              <Link
                to="/rentals"
                className="mt-4 block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand"
              >
                Back to browse
              </Link>
            </aside>
          </div>

          {/* Items offered by this business */}
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Items from {b.name}</h2>
            {products.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">This business hasn’t published any items yet.</p>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => <ItemCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

function ItemCard({ p }) {
  const img = assetUrl(p.imageUrl);
  return (
    <Link to={`/rentals/product/${p.id}`} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="h-32 bg-slate-100">
        {img ? (
          <img src={img} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(p.category)} />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="truncate text-sm font-semibold text-slate-900">{p.name}</h3>
        <div className="mt-1"><StarRating value={p.rating} count={p.reviewCount} size="h-3 w-3" /></div>
        <p className="mt-auto pt-2 font-bold text-brand">{formatPrice(p.pricePerDay, p.currency)}<span className="text-xs font-normal text-slate-400">/day</span></p>
      </div>
    </Link>
  );
}
