import { Fragment, useState } from 'react';
import { Avatar } from './table';
import { Badge } from './ui';
import { assetUrl } from '../lib/api';
import { detailEntries } from '../lib/bookingDetails';
import { formatPrice, rentalDays } from '../lib/currency';

const STATUS_TONE = {
  pending: 'amber',
  confirmed: 'green',
  released: 'blue',
  cancelled: 'red',
  completed: 'blue',
};

// Distinguishes a QR-scanned handover from one done with the button.
function handoverLabel(r) {
  if (r.returnedAt) return r.returnMethod === 'qr' ? 'Returned by QR' : 'Returned';
  if (r.releasedAt) return r.releaseMethod === 'qr' ? 'Released by QR' : 'Released';
  return null;
}

const bookingAmount = (r) =>
  rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0);

// Everything the renter submitted, so the owner can vet a booking without
// leaving the table: who booked it, their answers for this category, the
// handover arrangement, and the uploaded requirement photos.
function BookingDetails({ r }) {
  const validId = assetUrl(r.validIdUrl);
  const licence = assetUrl(r.details?.licenseIdUrl);

  return (
    <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-3">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Booked by</p>
        <dl className="space-y-1.5 text-sm">
          <Row label="Name" value={r.customer?.fullName} />
          <Row label="Email" value={r.customer?.email} />
          <Row label="Contact" value={r.contactPhone} />
          <Row label="Booked on" value={r.createdAt ? new Date(r.createdAt).toLocaleString() : null} />
          <Row label="Payment" value={r.paymentMethod} />
        </dl>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {r.category ? `${r.category} details` : 'Booking details'}
        </p>
        <dl className="space-y-1.5 text-sm">
          {detailEntries(r.details).map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
          {r.purpose && <Row label="Purpose" value={r.purpose} />}
          {r.note && <Row label="Note" value={r.note} />}
        </dl>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Handover</p>
        <dl className="space-y-1.5 text-sm">
          <Row
            label={r.handoverMode === 'dropoff' ? 'Drop off to' : 'Get it at'}
            value={[
              r.handoverMode === 'dropoff' ? r.dropoffLocation : r.pickupLocation,
              r.pickupTime,
            ].filter(Boolean).join(' · ')}
          />
          <Row label="Return time" value={r.dropoffTime} />
          {r.releasedAt && (
            <Row
              label={r.releaseMethod === 'qr' ? 'Released by QR' : 'Released'}
              value={new Date(r.releasedAt).toLocaleString()}
            />
          )}
          {r.returnedAt && (
            <Row
              label={r.returnMethod === 'qr' ? 'Returned by QR' : 'Returned'}
              value={new Date(r.returnedAt).toLocaleString()}
            />
          )}
        </dl>

        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Requirements
        </p>
        {validId || licence ? (
          <div className="flex flex-wrap gap-3">
            {validId && <DocThumb href={validId} label={r.validIdType || 'Valid ID'} />}
            {licence && <DocThumb href={licence} label="Licence" />}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Nothing uploaded.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

// Opens the full-size upload in a new tab for a closer look.
function DocThumb({ href, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group block w-24">
      <div className="h-16 w-24 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
        <img src={href} alt={label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      </div>
      <span className="mt-1 block truncate text-xs text-slate-500 group-hover:text-brand">{label}</span>
    </a>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
      {children}
    </th>
  );
}

// Shared bookings/reservations table. When `onStatus` is omitted (or
// showActions is false) it renders read-only (e.g. Booking History).
export default function BookingsTable({
  rows,
  onStatus,
  onRelease,
  onReturn,
  canManage = true,
  showActions = true,
}) {
  // Which booking's full details are expanded.
  const [openId, setOpenId] = useState(null);
  const columnCount = showActions ? 7 : 6;

  return (
    <table className="w-full min-w-[820px] border-collapse text-sm">
      <thead className="border-y border-slate-100 bg-slate-50/60">
        <tr>
          <Th className="w-8" />
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
          const open = openId === r.id;
          return (
            <Fragment key={r.id}>
            <tr className="transition-colors hover:bg-slate-50/60">
              <td className="pl-4 pr-1 py-3">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : r.id)}
                  aria-expanded={open}
                  aria-label={open ? 'Hide booking details' : 'Show booking details'}
                  title="Booking details"
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand"
                >
                  <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
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
                {handoverLabel(r) && (
                  <p className="mt-1 text-xs text-slate-400">{handoverLabel(r)}</p>
                )}
              </td>
              {showActions && (
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    {r.status === 'pending' && (
                      <button onClick={() => onStatus(r, 'confirmed')} disabled={!canManage} title={!canManage ? 'Subscribe to approve bookings' : undefined} className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50">
                        Approve
                      </button>
                    )}
                    {/* A held reservation has no unit to release, so it still
                        completes directly. */}
                    {r.status === 'confirmed' && r.type === 'reserve' && (
                      <button onClick={() => onStatus(r, 'completed')} disabled={!canManage} title={!canManage ? 'Subscribe to manage bookings' : undefined} className="rounded-md border border-brand px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50">
                        Complete
                      </button>
                    )}
                    {/* Manual equivalents of scanning the renter's QR. */}
                    {(r.status === 'pending' || r.status === 'confirmed') && r.type !== 'reserve' && !r.releasedAt && onRelease && (
                      <button onClick={() => onRelease(r)} disabled={!canManage} title={!canManage ? 'Subscribe to manage bookings' : 'Release without scanning the QR'} className="rounded-md bg-brand px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
                        Release
                      </button>
                    )}
                    {r.status === 'released' && onReturn && (
                      <button onClick={() => onReturn(r)} disabled={!canManage} title={!canManage ? 'Subscribe to manage bookings' : 'Mark returned without scanning the QR'} className="rounded-md border border-brand px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50">
                        Mark returned
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
            {open && (
              <tr className="bg-slate-50/60">
                <td colSpan={columnCount} className="px-5 pb-5 pt-1">
                  <BookingDetails r={r} />
                </td>
              </tr>
            )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
