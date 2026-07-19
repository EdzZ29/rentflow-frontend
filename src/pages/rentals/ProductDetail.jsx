import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { LockIcon, MapPinIcon } from '../../components/icons';
import { categoryIcon } from '../../lib/categories';
import { api, assetUrl } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const PAYMENT_METHODS = [
  { key: 'card', label: 'Card' },
  { key: 'gcash', label: 'GCash' },
  { key: 'paypal', label: 'PayPal' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null); // 'book' | 'reserve' | null

  useEffect(() => {
    api.rentals.product(id).then(setP).catch((e) => setError(e.message));
  }, [id]);

  const img = p && assetUrl(p.imageUrl);

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
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="h-72 overflow-hidden rounded-2xl bg-slate-100">
                {img ? (
                  <img src={img} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/20 text-brand">
                    <svg className="h-20 w-20" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={categoryIcon(p.category)} />
                    </svg>
                  </div>
                )}
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{p.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{p.category}</span>
                {p.location && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {p.location}</span>}
                {p.businessName && <span>· by {p.businessName}</span>}
              </div>
              {p.description && <p className="mt-6 leading-relaxed text-slate-700">{p.description}</p>}
            </div>

            {/* Action card */}
            <aside className="h-fit rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-2xl font-bold text-brand">
                {formatPrice(p.pricePerDay, p.currency)}<span className="text-base font-normal text-slate-400">/day</span>
              </p>

              {!user ? (
                <div className="mt-4">
                  <p className="text-sm text-slate-600">Log in to book this item.</p>
                  <Link to="/login" className="mt-3 block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent-dark">
                    Log in to book
                  </Link>
                  <p className="mt-2 text-center text-xs text-slate-500">
                    No account? <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <button onClick={() => setModalType('book')} className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark">
                    Book now
                  </button>
                  <button onClick={() => setModalType('reserve')} className="w-full rounded-lg border border-brand px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5">
                    Reserve for later
                  </button>
                  <p className="pt-1 text-center text-xs text-slate-400">
                    <strong>Book</strong> to rent now · <strong>Reserve</strong> to hold your dates
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
      <Footer />

      {modalType && p && (
        <BookingModal product={p} type={modalType} defaultPhone="" onClose={() => setModalType(null)} />
      )}
    </div>
  );
}

function BookingModal({ product, type, onClose }) {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    contactPhone: '',
    note: '',
    paymentMethod: 'card',
    agreedToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const days = rentalDays(form.startDate, form.endDate);
  const total = days * Number(product.pricePerDay || 0);
  const isBook = type === 'book';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.startDate || !form.endDate) return setError('Please choose your start and end dates.');
    if (form.endDate < form.startDate) return setError('The end date must be on or after the start date.');
    if (form.contactPhone.trim().length < 3) return setError('Please enter a contact number so the owner can reach you.');
    if (!form.agreedToTerms) return setError('Please agree to the rental terms and consent to continue.');
    setLoading(true);
    try {
      await api.bookings.create({
        productId: product.id,
        type,
        startDate: form.startDate,
        endDate: form.endDate,
        contactPhone: form.contactPhone.trim(),
        paymentMethod: form.paymentMethod,
        agreedToTerms: form.agreedToTerms,
        note: form.note.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isBook ? 'Book now' : 'Reserve for later'} onClose={onClose}>
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-dark">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-3 font-semibold text-slate-900">
            {isBook ? 'Booking' : 'Reservation'} requested!
          </p>
          <p className="mt-1 text-sm text-slate-600">The owner will review and confirm shortly.</p>
          <Link to="/customer/bookings" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
            View my bookings
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="rounded-lg bg-brand/5 px-3 py-2 text-xs text-slate-600">
            {isBook
              ? 'Booking rents the item for your chosen dates once the owner confirms.'
              : 'Reserving holds your dates while you finalise — the owner will confirm availability.'}
          </p>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} />
            <Field label="End date" type="date" value={form.endDate} onChange={(e) => set({ endDate: e.target.value })} />
          </div>

          <Field label="Contact number" value={form.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} placeholder="+63 900 000 0000" />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Purpose / note (optional)</span>
            <textarea rows={2} value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="What will you use it for?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Payment method</span>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.key} type="button" onClick={() => set({ paymentMethod: m.key })}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${form.paymentMethod === m.key ? 'border-accent bg-accent/5 text-accent-dark' : 'border-slate-200 text-slate-600'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><LockIcon className="h-3.5 w-3.5" /> Secure demo — no real charge; card details aren’t stored.</p>
          </div>

          {form.startDate && form.endDate && form.endDate >= form.startDate && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-600">{days} day{days === 1 ? '' : 's'} × {formatPrice(product.pricePerDay, product.currency)}</span>
              <span className="font-semibold text-slate-900">{formatPrice(total, product.currency)}</span>
            </div>
          )}

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.agreedToTerms} onChange={(e) => set({ agreedToTerms: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[#56aea1]" />
            <span>I confirm my details are accurate and I agree to the rental terms and payment.</span>
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {loading ? 'Submitting…' : isBook ? 'Confirm booking' : 'Confirm reservation'}
          </button>
        </form>
      )}
    </Modal>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input {...props} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20" />
    </label>
  );
}
