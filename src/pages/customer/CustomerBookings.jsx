import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useRealtime } from '../../context/RealtimeContext';
import { api, assetUrl } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const statusTone = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };

export default function CustomerBookings() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const { subscribe } = useRealtime();
  const load = () => api.bookings.list().then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  // Live-refresh when the owner confirms/completes/cancels a booking.
  useEffect(() => subscribe('reservation', load), [subscribe]);

  const cancel = async (r) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.bookings.updateStatus(r.id, 'cancelled');
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!items && !error) return <Loading />;

  return (
    <div>
      <PageHeader title="My Bookings" subtitle="Track your bookings and reservations." />
      <ErrorNote>{error}</ErrorNote>

      {items?.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No bookings yet. <Link to="/rentals" className="font-semibold text-accent hover:underline">Browse rentals →</Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items?.map((r) => {
            const days = rentalDays(r.startDate, r.endDate);
            const total = days * Number(r.product?.pricePerDay || 0);
            const img = assetUrl(r.product?.imageUrl);
            return (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {img ? <img src={img} alt={r.product?.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      {r.product?.name}
                      <Badge tone={r.type === 'reserve' ? 'blue' : 'slate'}>
                        {r.type === 'reserve' ? 'Reservation' : 'Booking'}
                      </Badge>
                    </p>
                    <p className="text-sm text-slate-500">
                      {r.startDate} → {r.endDate} · {days} day{days === 1 ? '' : 's'} ·{' '}
                      <span className="font-medium text-brand">{formatPrice(total, r.product?.currency)}</span>
                    </p>
                    {r.paymentMethod && <p className="text-xs text-slate-400">Payment: {r.paymentMethod}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                  {(r.status === 'pending' || r.status === 'confirmed') && (
                    <button onClick={() => cancel(r)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Cancel</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
