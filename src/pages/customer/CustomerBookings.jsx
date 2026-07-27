import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingQr from '../../components/BookingQr';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useRealtime } from '../../context/RealtimeContext';
import { api, assetUrl } from '../../lib/api';
import { detailEntries } from '../../lib/bookingDetails';
import { formatPrice, rentalDays } from '../../lib/currency';

const statusTone = {
  pending: 'amber',
  confirmed: 'green',
  released: 'blue',
  cancelled: 'red',
  completed: 'blue',
};

// Which QR the renter needs right now: the release code until the unit is out,
// then the return code. Nothing once it's back or cancelled.
function activeQr(r) {
  if (r.status === 'cancelled') return null;
  if (r.returnedAt) return null;
  if (r.releasedAt) {
    return r.returnToken ? { token: r.returnToken, kind: 'return' } : null;
  }
  return r.releaseToken ? { token: r.releaseToken, kind: 'release' } : null;
}

// "Released by QR" vs "Released" — and the same for the return.
function handoverLabel(r) {
  if (r.returnedAt) {
    return r.returnMethod === 'qr' ? 'Returned by QR' : 'Returned';
  }
  if (r.releasedAt) {
    return r.releaseMethod === 'qr' ? 'Released by QR' : 'Released';
  }
  return null;
}

function HandoverRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value || '—'}</dd>
    </div>
  );
}

export default function CustomerBookings() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  // Which booking's handover QR is expanded.
  const [openQr, setOpenQr] = useState(null);

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
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
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
                  {handoverLabel(r) && <Badge tone="green">{handoverLabel(r)}</Badge>}
                  <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                  {activeQr(r) && (
                    <button
                      onClick={() => setOpenQr((id) => (id === r.id ? null : r.id))}
                      className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {openQr === r.id
                        ? 'Hide QR'
                        : activeQr(r).kind === 'return' ? 'Return QR' : 'Show QR'}
                    </button>
                  )}
                  {(r.status === 'pending' || r.status === 'confirmed') && (
                    <button onClick={() => cancel(r)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Cancel</button>
                  )}
                </div>
              </div>

              {openQr === r.id && (
                <div className="mt-4 flex flex-wrap items-center gap-8 border-t border-slate-100 pt-4">
                  <BookingQr
                    token={activeQr(r).token}
                    kind={activeQr(r).kind}
                    bookingId={r.id}
                    size={144}
                  />
                  <dl className="min-w-48 flex-1 space-y-1.5 text-sm">
                    <HandoverRow
                      label={r.handoverMode === 'dropoff' ? 'Drop off to' : 'Get it at'}
                      value={[
                        r.handoverMode === 'dropoff' ? r.dropoffLocation : r.pickupLocation,
                        r.pickupTime,
                      ].filter(Boolean).join(' · ')}
                    />
                    <HandoverRow label="Return time" value={r.dropoffTime} />
                    {/* Whatever this category asked for, from its own table. */}
                    {detailEntries(r.details).map(([label, value]) => (
                      <HandoverRow key={label} label={label} value={value} />
                    ))}
                    {r.purpose && <HandoverRow label="Purpose" value={r.purpose} />}
                    {r.note && <HandoverRow label="Note" value={r.note} />}
                    <HandoverRow
                      label="Requirements"
                      value={[
                        r.validIdUrl && (r.validIdType || 'Valid ID'),
                        r.details?.licenseIdUrl && 'Licence',
                      ].filter(Boolean).join(' · ') || 'None uploaded'}
                    />
                  </dl>
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
