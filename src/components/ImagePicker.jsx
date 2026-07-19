import { useState } from 'react';
import { assetUrl } from '../lib/api';

// File picker with a live preview. The preview (and everywhere the image is
// shown) uses object-cover so images are cropped to fit consistently.
export default function ImagePicker({ currentUrl, onFile, label = 'Photo', aspect = 'h-24 w-36' }) {
  const [preview, setPreview] = useState(null);
  const shown = preview || (currentUrl ? assetUrl(currentUrl) : null);

  const handle = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setPreview(URL.createObjectURL(f));
      onFile(f);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <div className={`${aspect} shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100`}>
          {shown ? (
            <img src={shown} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-slate-300">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
              </svg>
            </div>
          )}
        </div>
        <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          {shown ? 'Change image' : 'Choose image'}
          <input type="file" accept="image/*" onChange={handle} className="hidden" />
        </label>
      </div>
      <p className="mt-1 text-xs text-slate-400">Cropped to fit — JPG, PNG or WebP.</p>
    </div>
  );
}
