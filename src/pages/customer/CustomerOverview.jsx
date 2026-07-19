import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, ErrorNote, Loading, PageHeader, StatCard } from '../../components/ui';
import { api } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const statusTone = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };

export default function CustomerOverview() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.bookings.list().then(setItems).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!items) return <Loading />;

  const pending = items.filter((r) => r.status === 'pending').length;
  const confirmed = items.filter((r) => r.status === 'confirmed').length;

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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total bookings" value={items.length} />
        <StatCard label="Awaiting confirmation" value={pending} tone="accent" />
        <StatCard label="Confirmed" value={confirmed} />
      </div>

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
