import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, CardIcon, CheckIcon, PhoneIcon, UserIcon } from '../../components/icons';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { api, assetUrl } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const statusTone = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };
const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function OwnerReservations() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () =>
    api.reservations.list().then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (r, status) => {
    try {
      await api.reservations.updateStatus(r.id, status);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const counts = useMemo(() => {
    const c = { all: items?.length || 0 };
    FILTERS.slice(1).forEach((s) => {
      c[s] = (items || []).filter((r) => r.status === s).length;
    });
    return c;
  }, [items]);

  const shown = useMemo(
    () => (filter === 'all' ? items || [] : (items || []).filter((r) => r.status === filter)),
    [items, filter],
  );

  if (!items && !error) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Manage Bookings"
        subtitle="Review, approve, and track reservations for your products."
      />
      <ErrorNote>{error}</ErrorNote>

      {counts.pending > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have <strong>{counts.pending}</strong> booking request
          {counts.pending === 1 ? '' : 's'} waiting for your approval.
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-accent text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f} ({counts[f] || 0})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No {filter === 'all' ? '' : filter} bookings.
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => {
            const days = rentalDays(r.startDate, r.endDate);
            const total = days * Number(r.product?.pricePerDay || 0);
            const img = assetUrl(r.product?.imageUrl);
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {img ? (
                        <img src={img} alt={r.product?.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-300">
                          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-slate-900">
                        {r.product?.name}
                        <Badge tone={r.type === 'reserve' ? 'blue' : 'slate'}>
                          {r.type === 'reserve' ? 'Reservation' : 'Booking'}
                        </Badge>
                      </p>
                      <p className="text-xs text-slate-400">{r.product?.business?.name}</p>
                      <div className="mt-1 space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-slate-400" />
                          {r.startDate} → {r.endDate} · {days} day{days === 1 ? '' : 's'}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <UserIcon className="h-4 w-4 text-slate-400" />
                          {r.customer?.fullName} · {r.customer?.email}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1.5">
                            <PhoneIcon className="h-4 w-4 text-slate-400" />
                            {r.contactPhone || '—'}
                          </span>
                          {r.paymentMethod && (
                            <span className="flex items-center gap-1.5">
                              <CardIcon className="h-4 w-4 text-slate-400" />
                              {r.paymentMethod}
                            </span>
                          )}
                          {r.agreedToTerms && (
                            <span className="flex items-center gap-1 text-accent-dark">
                              <CheckIcon className="h-4 w-4" />
                              consented
                            </span>
                          )}
                        </p>
                        {r.note && <p className="italic text-slate-500">“{r.note}”</p>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-brand">
                      {formatPrice(total, r.product?.currency)}
                    </p>
                    <div className="mt-1"><Badge tone={statusTone[r.status]}>{r.status}</Badge></div>
                  </div>
                </div>

                {(r.status === 'pending' || r.status === 'confirmed') && (
                  <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                    {r.status === 'pending' && (
                      <button onClick={() => setStatus(r, 'confirmed')} className="rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark">
                        ✓ Approve
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <button onClick={() => setStatus(r, 'completed')} className="rounded-md border border-brand px-4 py-1.5 text-xs font-medium text-brand hover:bg-brand/5">
                        Mark completed
                      </button>
                    )}
                    <button onClick={() => setStatus(r, 'cancelled')} className="rounded-md border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      {r.status === 'pending' ? 'Decline' : 'Cancel'}
                    </button>
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
