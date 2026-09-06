import { useState } from 'react';
import Modal from './Modal';

// Confirmation dialog for destructive actions, used instead of window.confirm.
//
// `onConfirm` may be async: this component shows a busy state while it runs,
// surfaces a thrown error inline (so the user sees why it failed without the
// dialog vanishing), and only closes on success.
export default function ConfirmModal({
  title = 'Are you sure?',
  message,
  detail,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e.message || 'That didn’t work. Please try again.');
      setBusy(false);
    }
  };

  const confirmClass =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-accent hover:bg-accent-dark';

  return (
    // Closing is blocked mid-action so the dialog can't be dismissed from
    // under an in-flight request.
    <Modal title={title} onClose={() => !busy && onClose()}>
      <p className="text-sm text-slate-600">{message}</p>
      {/* whitespace-pre-line so callers can pass a multi-line summary. */}
      {detail && (
        <p className="mt-1 whitespace-pre-line text-sm text-slate-500">{detail}</p>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={run}
          disabled={busy}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${confirmClass}`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
