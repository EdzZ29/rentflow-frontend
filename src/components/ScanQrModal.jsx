import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import Modal from './Modal';
import { api } from '../lib/api';
import { tokenFromScan } from '../lib/qrToken';

// Camera scanner for the owner. Reads a booking QR and performs whatever that
// code is for — release (approving the booking at the same time if it's still
// pending) or accepting the return. The server decides which; we just send the
// token we read.
export default function ScanQrModal({ onClose, onDone }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const busyRef = useRef(false);

  const [cameraError, setCameraError] = useState('');
  const [status, setStatus] = useState('scanning'); // scanning | working | done | error
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Stop the camera as soon as we're finished with it.
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const submitToken = async (token) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus('working');
    setMessage('');
    try {
      const booking = await api.bookingVerify.scan(token);
      stopCamera();
      setResult(booking);
      setStatus('done');
      onDone?.();
    } catch (e) {
      setMessage(e.message);
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  };

  // Decode a QR out of an uploaded image — a screenshot the renter sent, or a
  // photo of their code. Same token rules as a live scan.
  const decodeImageFile = (file) => {
    setUploadError('');
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Cap the size so decoding a 12-megapixel phone photo stays fast.
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);

      const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h);
      const token = found && tokenFromScan(found.data);
      if (!token) {
        setUploadError(
          found
            ? 'That QR is not a Rentivo booking code.'
            : 'No QR code found in that image. Try a clearer, tighter crop.',
        );
        return;
      }
      submitToken(token);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setUploadError('That file could not be opened as an image.');
    };
    img.src = url;
  };

  useEffect(() => {
    let raf;
    let cancelled = false;

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!cancelled && video?.readyState === video?.HAVE_ENOUGH_DATA && canvas) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, w, h);
          const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h);
          const token = found && tokenFromScan(found.data);
          if (token) {
            submitToken(token);
            return; // stop the loop; submitToken owns the flow from here
          }
        }
      }
      if (!cancelled) raf = requestAnimationFrame(tick);
    };

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        raf = requestAnimationFrame(tick);
      } catch {
        setCameraError(
          'Camera unavailable. Paste the booking code below instead.',
        );
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isReturn = result?.tokenKind === 'return';

  return (
    <Modal title="Scan booking QR" onClose={onClose}>
      {status === 'done' && result ? (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-dark">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-3 font-semibold text-slate-900">
            {isReturn ? 'Return confirmed' : 'Unit released'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Booking #{result.id} · {result.productName}
          </p>
          <p className="text-sm text-slate-500">{result.customerName}</p>
          {!isReturn && (
            <p className="mt-2 text-xs text-slate-500">
              Approved and released. Scan the renter’s return code when the unit
              comes back.
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          {!cameraError && (
            <div className="relative overflow-hidden rounded-xl bg-slate-900">
              <video ref={videoRef} playsInline muted className="h-64 w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="h-40 w-40 rounded-lg border-2 border-white/70" />
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          <p className="mt-3 text-center text-sm text-slate-500">
            {status === 'working'
              ? 'Recording…'
              : cameraError || 'Point the camera at the renter’s booking QR.'}
          </p>

          {status === 'error' && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          )}

          {/* Fallbacks for a blocked camera, or a code sent as a screenshot. */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Or upload a QR image
            </span>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-brand hover:text-brand">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V6m0 0L8.5 9.5M12 6l3.5 3.5M5 17v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
              </svg>
              Choose a QR photo or screenshot
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  decodeImageFile(e.target.files?.[0]);
                  // Allow re-picking the same file after a failed read.
                  e.target.value = '';
                }}
              />
            </label>
            {uploadError && (
              <p className="mt-2 text-xs text-red-600">{uploadError}</p>
            )}

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Or paste the booking code / link
              </span>
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="https://…/verify/… or the code itself"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <button
              type="button"
              disabled={status === 'working' || !tokenFromScan(manual)}
              onClick={() => submitToken(tokenFromScan(manual))}
              className="mt-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              Use this code
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
