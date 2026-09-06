import { useState } from 'react';
import { MAX_UPLOAD_LABEL, validateImageFile } from '../lib/uploads';

// Plain file input for forms that don't need a preview thumbnail. Rejects
// anything over the API's size limit before it can be submitted, and says why.
export default function PhotoField({ label = 'Photo', onFile }) {
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const handle = (e) => {
    const f = e.target.files?.[0] ?? null;
    e.target.value = ''; // allow re-picking the same file after a rejection
    if (!f) return;

    const message = validateImageFile(f);
    if (message) {
      setError(message);
      setName('');
      onFile(null);
      return;
    }
    setError('');
    setName(f.name);
    onFile(f);
  };

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handle}
        className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-dark"
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : (
        <span className="mt-1 block text-xs text-slate-400">
          {name || `JPG, PNG or WebP, up to ${MAX_UPLOAD_LABEL}.`}
        </span>
      )}
    </label>
  );
}
