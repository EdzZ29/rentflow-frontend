// Reusable dashboard widgets shared by the owner and admin overviews.
// Colours come straight from the RentFlow brand palette so every chart,
// tile, and badge reads as one system.
const C = {
  brand: '#135776',
  brandDark: '#0f465e',
  accent: '#56aea1',
  accentDark: '#47978b',
  amber: '#f59e0b',
  track: '#eef2f6',
};

function ArrowUpRight() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

// Big KPI tile. Pass `highlight` to get the featured green-gradient card.
export function StatTile({ label, value, hint, highlight = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        highlight ? 'border-transparent' : 'border-slate-200 bg-white'
      }`}
      style={highlight ? { background: `linear-gradient(135deg, ${C.brand}, ${C.accentDark})` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium ${highlight ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            highlight ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <ArrowUpRight />
        </span>
      </div>
      <p className={`mt-3 text-4xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </p>
      {hint && (
        <p className={`mt-2 flex items-center gap-1.5 text-xs ${highlight ? 'text-white/70' : 'text-slate-400'}`}>
          <span
            className={`inline-block h-2.5 w-2.5 rounded-sm ${highlight ? 'bg-white/60' : 'bg-accent/60'}`}
          />
          {hint}
        </p>
      )}
    </div>
  );
}

// White rounded panel with an optional header + right-aligned action.
export function Panel({ title, action, className = '', children }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Vertical capsule bar chart. data: [{ label, value }].
export function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex h-44 items-end justify-between gap-2 sm:gap-3">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isMax = d.value === max && d.value > 0;
          return (
            <div key={i} className="flex h-full flex-1 items-end justify-center">
              <div className="relative flex h-full w-full items-end justify-center">
                {isMax && (
                  <span
                    className="absolute -top-1 z-10 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: C.brand }}
                  >
                    {d.value}
                  </span>
                )}
                <div
                  className="w-full max-w-[2.25rem] rounded-full transition-[height] duration-500"
                  style={
                    isMax
                      ? { height: `${Math.max(pct, 8)}%`, background: `linear-gradient(180deg, ${C.accent}, ${C.brand})` }
                      : {
                          height: `${Math.max(pct, 8)}%`,
                          backgroundColor: '#e2f0ed',
                          backgroundImage:
                            'repeating-linear-gradient(45deg, #cfe6e0 0, #cfe6e0 5px, transparent 5px, transparent 11px)',
                        }
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-2 sm:gap-3">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-xs font-medium text-slate-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Multi-segment donut with a value in the middle.
// segments: [{ label, value, color }].
export function Donut({ segments, centerValue, centerLabel, size = 176, stroke = 20 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.track} strokeWidth={stroke} />
        {total > 0 &&
          segments.map((seg, i) => {
            const len = (seg.value / total) * circ;
            if (len <= 0) return null;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-acc}
                strokeLinecap="round"
              />
            );
            acc += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{centerValue}</span>
        {centerLabel && <span className="text-xs text-slate-400">{centerLabel}</span>}
      </div>
    </div>
  );
}

// Small colour-swatch legend for the donut / charts.
export function Legend({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.color }} />
            {it.label}
          </span>
          <span className="font-semibold text-slate-900">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

export const CHART_COLORS = C;
