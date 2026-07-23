import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Modal from '../../components/Modal';
import { StarRating, StarInput } from '../../components/StarRating';
import { useAuth } from '../../context/AuthContext';
import { LockIcon, MapPinIcon } from '../../components/icons';
import { categoryIcon } from '../../lib/categories';
import { api, assetUrl } from '../../lib/api';
import { cityOf } from '../../lib/location';
import { formatPrice, rentalDays } from '../../lib/currency';

// Shown when an owner hasn't set their own rules / policy.
const DEFAULT_RULES = [
  'Present a valid government-issued ID at pickup.',
  'Return the item in the same condition you received it.',
  'Late returns may incur additional daily charges.',
  'Any damage or loss during the rental is the renter’s responsibility.',
];
const DEFAULT_CANCELLATION =
  'Free cancellation up to 48 hours before your start date. Cancellations within 48 hours may be charged up to one day’s rate. No-shows are non-refundable.';

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
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [canReview, setCanReview] = useState(false);

  const loadProduct = () =>
    api.rentals.product(id).then(setP).catch((e) => setError(e.message));
  const loadReviews = () =>
    api.reviews.list(id).then(setReviews).catch(() => {});

  useEffect(() => {
    // Reset when navigating between products.
    setP(null);
    setError('');
    setReviews([]);
    setRelated([]);
    setCanReview(false);
    loadProduct();
    loadReviews();
    api.rentals.related(id).then(setRelated).catch(() => {});
    // A customer may only review items they've actually booked/reserved.
    if (user?.role === 'customer') {
      api.bookings
        .list()
        .then((bs) =>
          setCanReview(
            bs.some((b) => b.productId === Number(id) && b.status !== 'cancelled'),
          ),
        )
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const img = p && assetUrl(p.imageUrl);
  const city = p && cityOf(p.location);

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
          <>
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
                {city && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {city}</span>}
                <StarRating value={p.rating} count={p.reviewCount} />
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.availability === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {p.availability === 'available' ? 'Available' : 'Unavailable'}
                </span>
                {p.businessName && <span>· by {p.businessName}</span>}
              </div>

              {p.description && (
                <Section title="Description">
                  <p className="leading-relaxed text-slate-700">{p.description}</p>
                </Section>
              )}

              <Section title="Rental rules">
                {p.rentalRules ? (
                  <p className="whitespace-pre-line leading-relaxed text-slate-700">{p.rentalRules}</p>
                ) : (
                  <ul className="space-y-1.5 text-slate-700">
                    {DEFAULT_RULES.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Cancellation policy">
                <p className="whitespace-pre-line leading-relaxed text-slate-700">
                  {p.cancellationPolicy || DEFAULT_CANCELLATION}
                </p>
              </Section>

              <ReviewsSection
                productId={p.id}
                reviews={reviews}
                rating={p.rating}
                reviewCount={p.reviewCount}
                canReview={canReview}
                isCustomer={user?.role === 'customer'}
                isLoggedIn={!!user}
                onSubmitted={async () => { await Promise.all([loadReviews(), loadProduct()]); }}
              />
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

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">More from {p.businessName || 'this business'}</h2>
              <p className="mt-1 text-sm text-slate-500">Other items you can rent from the same owner.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => <RelatedCard key={r.id} p={r} />)}
              </div>
            </div>
          )}
          </>
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

// A titled block used for description / rules / policy sections.
function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}

function ReviewsSection({ productId, reviews, rating, reviewCount, canReview, isCustomer, isLoggedIn, onSubmitted }) {
  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Reviews {reviewCount > 0 && <span className="text-slate-400">({reviewCount})</span>}
        </h2>
        <StarRating value={rating} count={reviewCount} />
      </div>

      {canReview && <ReviewForm productId={productId} onSubmitted={onSubmitted} />}
      {!isLoggedIn && (
        <p className="mt-3 text-sm text-slate-500">
          <Link to="/login" className="font-medium text-accent hover:underline">Log in</Link> as a customer to leave a review.
        </p>
      )}
      {isLoggedIn && isCustomer && !canReview && (
        <p className="mt-3 text-sm text-slate-500">
          Only customers who have booked this item can review it.
        </p>
      )}

      <ReviewList reviews={reviews} />
    </div>
  );
}

const PREVIEW_COUNT = 4;

function ReviewList({ reviews }) {
  const [showAll, setShowAll] = useState(false);

  if (reviews.length === 0) {
    return <p className="mt-4 text-sm text-slate-400">No reviews yet. Be the first to review this item.</p>;
  }

  const shown = showAll ? reviews : reviews.slice(0, PREVIEW_COUNT);
  return (
    <>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {shown.map((r) => <ReviewCard key={r.id} r={r} />)}
      </div>
      {reviews.length > PREVIEW_COUNT && (
        <div className="mt-5 text-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-accent hover:text-accent"
          >
            {showAll ? 'Show less' : `See all ${reviews.length} reviews`}
            <svg className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

function monthYear(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

// Review card matching the storefront style: comment on top, green stars,
// then the reviewer's avatar, name, and date.
function ReviewCard({ r }) {
  const avatar = assetUrl(r.authorAvatar);
  const initials = (r.authorName || 'C').trim().charAt(0).toUpperCase();
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.15)] transition-transform hover:-translate-y-0.5">
      {r.comment ? (
        <p className="text-slate-700">“{r.comment}”</p>
      ) : (
        <p className="text-slate-400">Rated this item</p>
      )}
      <div className="mt-4">
        <StarRating value={r.rating} count={1} showCount={false} showValue={false} size="h-5 w-5" color="#2f9e6f" />
      </div>
      {r.ownerReply && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-accent-dark">Owner reply</p>
          {r.ownerReply}
        </div>
      )}
      <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
        {avatar ? (
          <img src={avatar} alt={r.authorName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent-dark">
            {initials}
          </span>
        )}
        <div>
          <p className="font-semibold text-slate-900">{r.authorName}</p>
          <p className="text-xs text-slate-400">{monthYear(r.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!rating) return setError('Please choose a star rating.');
    setSaving(true);
    try {
      await api.reviews.create(productId, { rating, comment: comment.trim() || undefined });
      setComment('');
      setRating(0);
      await onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-sm font-medium text-slate-700">Rate this item</p>
      <div className="mt-2"><StarInput value={rating} onChange={setRating} /></div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {saving ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}

// Compact card for the "More from this business" grid.
function RelatedCard({ p }) {
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
