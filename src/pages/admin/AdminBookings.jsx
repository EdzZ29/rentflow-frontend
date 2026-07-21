import { useEffect, useState } from 'react';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const statusTone = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };

export default function AdminBookings() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const { subscribe } = useRealtime();

  const load = () => api.reservations.list().then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  // Live-refresh whenever any booking is created or updated platform-wide.
  useEffect(() => subscribe('reservation', load), [subscribe]);

  if (!items && !error) return <Loading />;

  return (
    <div>
      <PageHeader title="All Bookings" subtitle="Every reservation across the platform." />
      <ErrorNote>{error}</ErrorNote>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No bookings yet.</td></tr>
            )}
            {items?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{r.product?.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.customer?.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{r.startDate} → {r.endDate}</td>
                <td className="px-4 py-3 font-medium text-brand">
                  {formatPrice(rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0), r.product?.currency)}
                </td>
                <td className="px-4 py-3"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
