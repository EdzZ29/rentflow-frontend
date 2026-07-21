import { Avatar } from './table';
import { Badge } from './ui';
import { assetUrl } from '../lib/api';
import { formatPrice, rentalDays } from '../lib/currency';

const STATUS_TONE = { pending: 'amber', confirmed: 'green', cancelled: 'red', completed: 'blue' };

const bookingAmount = (r) =>
  rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0);

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
      {children}
    </th>
  );
}

// Shared bookings/reservations table. When `onStatus` is omitted (or
// showActions is false) it renders read-only (e.g. Booking History).
export default function BookingsTable({ rows, onStatus, canManage = true, showActions = true }) {
  return (
    <table className="w-full min-w-[820px] border-collapse text-sm">
      <thead className="border-y border-slate-100 bg-slate-50/60">
        <tr>
          <Th>Product</Th>
          <Th>Customer</Th>
          <Th>Schedule</Th>
          <Th>Amount</Th>
          <Th>Status</Th>
          {showActions && <Th className="text-right">Actions</Th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r) => {
          const days = rentalDays(r.startDate, r.endDate);
          const img = assetUrl(r.product?.imageUrl);
          return (
            <tr key={r.id} className="transition-colors hover:bg-slate-50/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {img ? (
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-300">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{r.product?.name}</p>
                    <p className="truncate text-xs text-slate-400">{r.product?.business?.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.customer?.fullName} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{r.customer?.fullName}</p>
                    <p className="truncate text-xs text-slate-400">{r.customer?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-slate-600">
                <p className="whitespace-nowrap">{r.startDate} → {r.endDate}</p>
                <p className="text-xs text-slate-400">{days} day{days === 1 ? '' : 's'}</p>
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-900">
                {formatPrice(bookingAmount(r), r.product?.currency)}
              </td>
              <td className="px-5 py-3">
                <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
              </td>
              {showActions && (
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    {r.status === 'pending' && (
                      <button onClick={() => onStatus(r, 'confirmed')} disabled={!canManage} title={!canManage ? 'Subscribe to approve bookings' : undefined} className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50">
                        Approve
                      </button>
                    )}
                    {r.status === 'confirmed' && (
                      <button onClick={() => onStatus(r, 'completed')} disabled={!canManage} title={!canManage ? 'Subscribe to manage bookings' : undefined} className="rounded-md border border-brand px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50">
                        Complete
                      </button>
                    )}
                    {(r.status === 'pending' || r.status === 'confirmed') ? (
                      <button onClick={() => onStatus(r, 'cancelled')} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        {r.status === 'pending' ? 'Decline' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="px-1 text-xs text-slate-300">—</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
