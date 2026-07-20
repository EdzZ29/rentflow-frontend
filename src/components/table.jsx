// Reusable table chrome — tabs, avatars, a search box, and pagination — shared
// by the owner data pages so every list looks and behaves the same.

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              on ? 'text-accent-dark' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  on ? 'bg-accent/10 text-accent-dark' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {t.count}
              </span>
            )}
            {on && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

const AVATAR_GRADIENTS = [
  'from-accent to-brand',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-rose-400 to-pink-600',
  'from-emerald-400 to-teal-600',
];

export function Avatar({ name, size = 'h-8 w-8' }) {
  const label = (name || '?').trim() || '?';
  const initials =
    label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '?';
  const idx = [...label].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length;
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[idx]} text-xs font-semibold text-white`}
    >
      {initials}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}

function windowPages(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < count - 1) pages.push('…');
  pages.push(count);
  return pages;
}

function Chevron({ dir }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

export function Pagination({ page, pageCount, onPage, perPage, onPerPage }) {
  const pages = windowPages(page, Math.max(1, pageCount));
  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-1 pt-4 sm:flex-row">
      <p className="text-xs text-slate-500">
        Page {page} of {pageCount || 1}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Chevron dir="left" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`h-8 min-w-8 rounded-full px-2 text-sm font-medium transition-colors ${
                p === page ? 'bg-accent text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Chevron dir="right" />
        </button>
      </div>
      {onPerPage && (
        <select
          value={perPage}
          onChange={(e) => onPerPage(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-accent"
        >
          {[8, 15, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
