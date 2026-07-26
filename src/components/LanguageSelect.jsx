import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../lib/languages';

function GlobeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </svg>
  );
}

// Global language switcher. `full` shows the language name (mobile menu);
// the compact form shows just the code so it fits in the header bar.
export default function LanguageSelect({ full = false }) {
  const { language, setLanguage, current } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand ${
          full ? 'w-full justify-start' : ''
        }`}
      >
        <GlobeIcon />
        {full ? current.label : current.short}
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-1 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
            full ? 'left-0' : 'right-0'
          }`}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === language}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-6 px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                  l.code === language ? 'font-semibold text-accent-dark' : 'text-slate-700'
                }`}
              >
                {l.label}
                <span className="text-xs text-slate-400">{l.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
