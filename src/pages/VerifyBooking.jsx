import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { detailEntries } from '../lib/bookingDetails';

const STATUS_TONE = {
  confirmed: 'bg-accent/10 text-accent-dark',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-brand/10 text-brand',
  cancelled: 'bg-red-100 text-red-700',
};

// Opened by scanning a booking QR. Readable by anyone holding the code (the
// owner, at the counter); the validate action is owner-only and enforced by
// the API.
export default function VerifyBooking() {
  const { token } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    api.bookingVerify
      .get(token)
      .then(setBooking)
      .catch((e) => setError(e.message));
  }, [token]);

  const scan = async () => {
    setActionError('');
    setSaving(true);
    try {
      setBooking(await api.bookingVerify.scan(token));
    } catch (e) {
      setActionError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const canAct = user?.role === 'owner' || user?.role === 'admin';
  // The scanned code decides the action — a release code can only release.
  const isReturnCode = booking?.tokenKind === 'return';
  const alreadyDone = isReturnCode ? !!booking?.returnedAt : !!booking?.releasedAt;

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-logo text-xl">
            <span className="text-accent">rentivo</span>
          </span>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-3xl">🚫</p>
            <p className="mt-3 font-semibold text-slate-900">Code not valid</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!booking && !error && (
          <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        )}

        {booking && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Booking #{booking.id}
                  </p>
                  <h1 className="mt-1 text-lg font-bold text-slate-900">
                    {booking.productName || 'Rental item'}
                  </h1>
                  {booking.businessName && (
                    <p className="text-sm text-slate-500">{booking.businessName}</p>
                  )}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_TONE[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                  {booking.status}
                </span>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 px-6 text-sm">
              <Row label="Renter" value={booking.customerName} />
              <Row label="Contact" value={booking.contactPhone || '—'} />
              <Row label="Dates" value={`${booking.startDate} → ${booking.endDate}`} />
              <Row
                label={booking.handoverMode === 'dropoff' ? 'Drop off to' : 'Get it at'}
                value={[
                  booking.handoverMode === 'dropoff' ? booking.dropoffLocation : booking.pickupLocation,
                  booking.pickupTime,
                ].filter(Boolean).join(' · ') || '—'}
              />
              <Row label="Return time" value={booking.dropoffTime || '—'} />
              {/* Whatever this category recorded, from its own detail table. */}
              {detailEntries(booking.details).map(([label, value]) => (
                <Row key={label} label={label} value={value} />
              ))}
              {booking.purpose && <Row label="Purpose" value={booking.purpose} />}
              {booking.note && <Row label="Note" value={booking.note} />}
              <Row
                label="Requirements"
                value={
                  <span className="inline-flex flex-col items-end gap-0.5">
                    <Check ok={booking.hasValidId} label={booking.validIdType || 'Valid ID'} />
                    {booking.details?.driverOption === 'self_drive' && (
                      <Check ok={booking.hasLicenseId} label="Licence" />
                    )}
                  </span>
                }
              />
            </dl>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
              {/* What this code is for is stated up front, so the owner always
                  knows which action they're about to take. */}
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isReturnCode ? 'Return code' : 'Release code'}
              </p>

              {alreadyDone ? (
                <p className="text-center text-sm font-semibold text-accent-dark">
                  ✓ {isReturnCode
                    ? booking.returnMethod === 'qr' ? 'Returned by QR' : 'Returned'
                    : booking.releaseMethod === 'qr' ? 'Released by QR' : 'Released'}{' '}
                  <span className="font-normal text-slate-500">
                    {new Date(isReturnCode ? booking.returnedAt : booking.releasedAt).toLocaleString()}
                  </span>
                  {!isReturnCode && !booking.returnedAt && (
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      Scan the renter’s return code when the unit comes back.
                    </span>
                  )}
                </p>
              ) : canAct ? (
                <>
                  <button
                    type="button"
                    onClick={scan}
                    disabled={saving || booking.status === 'cancelled'}
                    className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
                  >
                    {saving
                      ? 'Recording…'
                      : isReturnCode ? 'Confirm return of unit' : 'Release unit to renter'}
                  </button>
                  {actionError && (
                    <p className="mt-2 text-center text-xs text-red-600">{actionError}</p>
                  )}
                </>
              ) : (
                <p className="text-center text-xs text-slate-500">
                  Only the item’s owner can {isReturnCode ? 'confirm this return' : 'release this unit'}.
                  Sign in to continue.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function Check({ ok, label }) {
  return (
    <span className={ok ? 'text-accent-dark' : 'text-slate-400'}>
      {ok ? '✓' : '—'} {label}
    </span>
  );
}
