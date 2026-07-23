import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, ErrorNote, Loading, PageHeader, StatCard } from '../../components/ui';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const statusTone = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };

export default function CustomerOverview() {
  const [items, setItems] = useState(null);
  const [reviewed, setReviewed] = useState(new Set());
  const [error, setError] = useState('');
  const { subscribe } = useRealtime();

  const load = () =>
    Promise.all([api.bookings.list(), api.reviews.mine().catch(() => [])])
      .then(([bookings, mine]) => {
        setItems(bookings);
        setReviewed(new Set(mine.map((r) => r.productId)));
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  // Live-refresh when a booking's status changes.
  useEffect(() => subscribe('reservation', load), [subscribe]);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!items) return <Loading />;

  const pending = items.filter((r) => r.status === 'pending').length;
  const confirmed = items.filter((r) => r.status === 'confirmed').length;

  // Distinct rented (non-cancelled) products not yet reviewed.
  const toReview = [
    ...new Set(
      items
        .filter((r) => r.status !== 'cancelled' && r.productId)
        .map((r) => r.productId),
    ),
  ].filter((pid) => !reviewed.has(pid)).length;

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Your bookings and reservations at a glance."
        action={
          <Link to="/rentals" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
            Browse rentals
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total bookings" value={items.length} />
        <StatCard label="Awaiting confirmation" value={pending} tone="accent" />
        <StatCard label="Confirmed" value={confirmed} />
        <StatCard label="To review" value={toReview} tone={toReview > 0 ? 'accent' : undefined} />
      </div>

      {toReview > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <p className="text-sm text-slate-700">
            You have <strong>{toReview}</strong> rented item{toReview === 1 ? '' : 's'} waiting for a review.
          </p>
          <Link to="/customer/reviews" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark">
            Write reviews
          </Link>
        </div>
      )}

      <Card title="Recent bookings" className="mt-6">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            You haven't booked anything yet.{' '}
            <Link to="/rentals" className="font-semibold text-accent hover:underline">Browse rentals →</Link>
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    {r.product?.name}
                    <Badge tone={r.type === 'reserve' ? 'blue' : 'slate'}>
                      {r.type === 'reserve' ? 'Reservation' : 'Booking'}
                    </Badge>
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.startDate} → {r.endDate} ·{' '}
                    {formatPrice(rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0), r.product?.currency)}
                  </p>
                </div>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
