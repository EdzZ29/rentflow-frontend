// Star rating UI — a read-only display of an average, and an interactive
// picker for writing a review. Kept in one place so the browse cards and the
// product page render stars identically.

function Star({ fill = 'full', className = 'h-4 w-4', color = '#f59e0b' }) {
  // fill: 'full' | 'half' | 'empty'
  const gradId = `half-${Math.round(Math.random() * 1e9)}`;
  const fillColor =
    fill === 'empty' ? 'none' : fill === 'half' ? `url(#${gradId})` : color;
  return (
    <svg className={className} viewBox="0 0 20 20" fill={fillColor} stroke={color} strokeWidth="1" aria-hidden="true">
      {fill === 'half' && (
        <defs>
          <linearGradient id={gradId}>
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 15.6l-5.2 2.72.99-5.8L1.58 8.6l5.82-.85L10 1.5z" />
    </svg>
  );
}

// Read-only average. Shows the numeric value and (optionally) the review count.
// When there are no reviews, shows a muted "New" label instead of 0 stars.
// `color` overrides the star colour (defaults to amber/gold).
export function StarRating({ value = 0, count = 0, size = 'h-4 w-4', showCount = true, showValue = true, color, className = '' }) {
  if (!count) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-slate-400 ${className}`}>
        <Star fill="empty" className={size} color={color} />
        New
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={`${value} out of 5`}>
      <span className="flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const d = value - i;
          const fill = d >= 0.75 ? 'full' : d >= 0.25 ? 'half' : 'empty';
          return <Star key={i} fill={fill} className={size} color={color} />;
        })}
      </span>
      {showValue && <span className="text-xs font-medium text-slate-600">{value.toFixed(1)}</span>}
      {showCount && <span className="text-xs text-slate-400">({count})</span>}
    </span>
  );
}

// Interactive 1–5 picker for the review form.
export function StarInput({ value, onChange, size = 'h-7 w-7' }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className="transition-transform hover:scale-110"
        >
          <Star fill={n <= value ? 'full' : 'empty'} className={size} />
        </button>
      ))}
    </div>
  );
}
