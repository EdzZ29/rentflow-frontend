import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';
import { StarInput, StarRating } from '../../components/StarRating';
import { ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useRealtime } from '../../context/RealtimeContext';
import { api, assetUrl } from '../../lib/api';

export default function CustomerReviews() {
  const [bookings, setBookings] = useState(null);
  const [mine, setMine] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // product being reviewed
  const { subscribe } = useRealtime();

  const loadMine = () => api.reviews.mine().then(setMine).catch(() => {});
  const load = () =>
    Promise.all([api.bookings.list(), api.reviews.mine()])
      .then(([b, m]) => {
        setBookings(b);
        setMine(m);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  // A completed booking (or any new booking) may trigger a review prompt.
  useEffect(() => subscribe('reservation', load), [subscribe]);

  const reviewByProduct = useMemo(() => {
    const map = {};
    mine.forEach((r) => {
      map[r.productId] = r;
    });
    return map;
  }, [mine]);

  // Unique products the customer has rented (bookings that weren't cancelled).
  const rentedProducts = useMemo(() => {
    const map = new Map();
    (bookings || [])
      .filter((r) => r.status !== 'cancelled' && r.product)
      .forEach((r) => {
        if (!map.has(r.productId)) {
          map.set(r.productId, { ...r.product, id: r.productId, lastStatus: r.status });
        }
      });
    return [...map.values()];
  }, [bookings]);

  if (!bookings && !error) return <Loading />;

  const pending = rentedProducts.filter((p) => !reviewByProduct[p.id]);

  return (
    <div>
      <PageHeader title="My Reviews" subtitle="Review the items you've rented to help other customers." />
      <ErrorNote>{error}</ErrorNote>

      {rentedProducts.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          You haven't rented anything yet.{' '}
          <Link to="/rentals" className="font-semibold text-accent hover:underline">Browse rentals →</Link>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-slate-700">
              You have <strong>{pending.length}</strong> item{pending.length === 1 ? '' : 's'} waiting for a review.
            </div>
          )}

          <div className="mt-4 space-y-3">
            {rentedProducts.map((p) => {
              const review = reviewByProduct[p.id];
              const img = assetUrl(p.imageUrl);
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {img ? <img src={img} alt={p.name} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/rentals/product/${p.id}`} className="font-semibold text-slate-900 hover:text-accent">
                        {p.name}
                      </Link>
                      {review ? (
                        <>
                          <div className="mt-1"><StarRating value={review.rating} count={1} showCount={false} size="h-4 w-4" /></div>
                          {review.comment && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{review.comment}</p>}
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">Not reviewed yet</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(p)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${review ? 'border border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {review ? 'Edit review' : 'Write a review'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {editing && (
        <ReviewModal
          product={editing}
          existing={reviewByProduct[editing.id]}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await loadMine(); }}
        />
      )}
    </div>
  );
}

function ReviewModal({ product, existing, onClose, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!rating) return setError('Please choose a star rating.');
    setSaving(true);
    try {
      await api.reviews.create(product.id, { rating, comment: comment.trim() || undefined });
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Review ${product.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Your rating</p>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Comment (optional)</span>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this item."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {saving ? 'Submitting…' : existing ? 'Update review' : 'Submit review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
