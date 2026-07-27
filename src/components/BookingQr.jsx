import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// The QR the renter shows at pick-up. It encodes a link to /verify/<token>, so
// the owner can scan it with any phone camera — no app or scanner needed.
// `bookingId` only names the downloaded file.
export default function BookingQr({
  token,
  size = 176,
  className = '',
  bookingId,
  kind = 'release', // 'release' | 'return' — only changes the caption/filename
}) {
  const [src, setSrc] = useState('');
  const url = token ? `${window.location.origin}/verify/${token}` : '';

  useEffect(() => {
    if (!url) return;
    let alive = true;
    QRCode.toDataURL(url, { width: size * 2, margin: 1 })
      .then((d) => alive && setSrc(d))
      .catch(() => alive && setSrc(''));
    return () => {
      alive = false;
    };
  }, [url, size]);

  if (!token) return null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3"
        style={{ width: size + 24, height: size + 24 }}
      >
        {src ? (
          <img src={src} alt="Booking QR code" width={size} height={size} />
        ) : (
          <div className="h-full w-full animate-pulse rounded bg-slate-100" />
        )}
      </div>
      <p className="mt-2 max-w-48 text-center text-xs text-slate-500">
        {kind === 'return'
          ? 'Show this when you return the unit'
          : 'Show this to the owner to release the unit'}
      </p>

      {/* The QR is a data URL, so it downloads straight from the anchor. */}
      {src && (
        <a
          href={src}
          download={`rentivo-booking${bookingId ? `-${bookingId}` : ''}-${kind}-qr.png`}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5M5 17v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
          </svg>
          Download QR
        </a>
      )}
    </div>
  );
}
