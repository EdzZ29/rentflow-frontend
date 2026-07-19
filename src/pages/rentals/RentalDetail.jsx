import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { MapPinIcon } from '../../components/icons';
import { categoryIcon } from '../../lib/categories';
import { api } from '../../lib/api';

export default function RentalDetail() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.rentals
      .get(id)
      .then(setB)
      .catch((e) => setError(e.message));
  }, [id]);

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
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
                <svg className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(b.category)} />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{b.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{b.category}</span>
                {b.location && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {b.location}</span>}
                {b.ownerName && <span>· by {b.ownerName}</span>}
              </div>
              {b.description && (
                <p className="mt-6 leading-relaxed text-slate-700">{b.description}</p>
              )}
            </div>

            {/* Booking card */}
            <aside className="h-fit rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500">Interested in this rental?</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Request to book</p>
              <p className="mt-2 text-sm text-slate-600">
                Create a free account to message the owner and reserve your dates.
              </p>
              <Link
                to="/signup"
                className="mt-4 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-dark"
              >
                Request to book
              </Link>
              <Link
                to="/rentals"
                className="mt-2 block rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:border-brand hover:text-brand"
              >
                Back to browse
              </Link>
            </aside>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
