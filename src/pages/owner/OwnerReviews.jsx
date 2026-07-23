import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { StarRating } from '../../components/StarRating';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { BarChart, Legend, Donut, Panel, StatTile, CHART_COLORS } from '../../components/dashboard';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';

const NEG = '#ef4444';
const sentimentOf = (rating) => (rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative');

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function OwnerReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');
  const [replying, setReplying] = useState(null); // review being replied to
  const { subscribe } = useRealtime();

  const load = () => api.ownerReviews.list().then(setReviews).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  // Real-time: refresh when a customer posts a new review (or a reply lands).
  useEffect(() => subscribe('review', load), [subscribe]);

  const stats = useMemo(() => computeStats(reviews || []), [reviews]);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!reviews) return <Loading />;

  const {
    total, avg, replied, notReplied, sentiments, branches, buckets, trendBars,
  } = stats;

  return (
    <div>
      <PageHeader
        title="Insights — Reviews"
        subtitle="Live view of customer feedback across your branches."
        action={<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live</span>}
      />

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center text-slate-500">
          No reviews yet. Once customers review your items, their feedback shows up here in real time.
        </div>
      ) : (
        <>
          {/* Row 1 — Ratings summary + sentiments */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Ratings & Reviews">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-4xl font-bold text-slate-900">{avg.toFixed(1)}</p>
                  <p className="text-xs text-slate-400">Overall rating</p>
                </div>
                <div>
                  <StarRating value={avg} count={total} />
                  <p className="mt-1 text-xs text-slate-400">{total} review{total === 1 ? '' : 's'}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <Mini label="High performing" value={buckets.high} hint="Stores ≥ 4.0" tone="emerald" />
                <Mini label="Avg performing" value={buckets.avg} hint="Stores 3.0–3.9" tone="amber" />
                <Mini label="Low performing" value={buckets.low} hint="Stores < 3.0" tone="red" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Mini label="Reviews replied" value={replied} tone="emerald" />
                <Mini label="Not replied" value={notReplied} tone="slate" />
              </div>
            </Panel>

            <Panel title="Review Sentiments">
              <div className="flex flex-wrap items-center gap-6">
                <Donut segments={sentiments} centerValue={total} centerLabel="Reviews" size={150} stroke={18} />
                <div className="flex-1">
                  <Legend items={sentiments} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                {sentiments.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Row 2 — Recent reviews + top branches */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel title="Reviews">
              <ul className="divide-y divide-slate-100">
                {reviews.slice(0, 6).map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          {r.authorName}
                          <StarRating value={r.rating} count={1} showCount={false} size="h-3.5 w-3.5" />
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {r.product?.name}{r.business?.name ? ` · ${r.business.name}` : ''} · {timeAgo(r.createdAt)}
                        </p>
                        {r.comment && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{r.comment}</p>}
                        {r.ownerReply && (
                          <p className="mt-1 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                            <span className="font-semibold text-slate-500">You replied:</span> {r.ownerReply}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setReplying(r)}
                        className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${r.ownerReply ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                      >
                        {r.ownerReply ? 'Edit reply' : 'Reply'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Top Branches by reviews">
              <BranchTable rows={branches.slice(0, 5)} />
            </Panel>
          </div>

          {/* Row 3 — Trend + bottom branches */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Panel title="Review Trends" action={<span className="text-xs font-medium text-slate-400">Last 6 months</span>}>
              <div className="mb-3">
                <p className="text-3xl font-bold text-slate-900">{avg.toFixed(1)}</p>
                <p className="text-xs text-slate-400">Overall rating</p>
              </div>
              <BarChart data={trendBars} />
            </Panel>

            <Panel title="Bottom Branches by reviews">
              <BranchTable rows={[...branches].reverse().slice(0, 5)} />
            </Panel>
          </div>
        </>
      )}

      {replying && (
        <ReplyModal
          review={replying}
          onClose={() => setReplying(null)}
          onSaved={async () => { setReplying(null); await load(); }}
        />
      )}
    </div>
  );
}

function Mini({ label, value, hint, tone = 'slate' }) {
  const tones = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    slate: 'text-slate-900',
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value}</p>
      <p className="text-xs font-medium text-slate-600">{label}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function BranchTable({ rows }) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-slate-400">No branches yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="pb-2 font-semibold">Business</th>
            <th className="pb-2 font-semibold">Rating</th>
            <th className="pb-2 text-center font-semibold">Reviews</th>
            <th className="pb-2 text-center font-semibold">Replied</th>
            <th className="pb-2 text-center font-semibold">Not Replied</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="py-2.5 pr-2 font-medium text-slate-700">{b.name}</td>
              <td className="py-2.5">
                <span className="inline-flex items-center gap-1">
                  <StarRating value={b.avg} count={b.count} showCount={false} size="h-3.5 w-3.5" />
                </span>
              </td>
              <td className="py-2.5 text-center text-slate-700">{b.count}</td>
              <td className="py-2.5 text-center">
                <Badge tone="green">{b.replied}</Badge>
              </td>
              <td className="py-2.5 text-center">
                <Badge tone={b.notReplied > 0 ? 'amber' : 'slate'}>{b.notReplied}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReplyModal({ review, onClose, onSaved }) {
  const [text, setText] = useState(review.ownerReply || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return setError('Please write a reply.');
    setSaving(true);
    try {
      await api.ownerReviews.reply(review.id, text.trim());
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeReply = async () => {
    setSaving(true);
    try {
      await api.ownerReviews.deleteReply(review.id);
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Reply to review" onClose={onClose}>
      <div className="rounded-lg bg-slate-50 p-3">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          {review.authorName}
          <StarRating value={review.rating} count={1} showCount={false} size="h-3.5 w-3.5" />
        </p>
        <p className="text-xs text-slate-400">{review.product?.name}</p>
        {review.comment && <p className="mt-1 text-sm text-slate-600">{review.comment}</p>}
      </div>
      <form onSubmit={submit} className="mt-3 space-y-3">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Thank the customer or address their feedback…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          {review.ownerReply && (
            <button type="button" onClick={removeReply} disabled={saving} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
              Remove
            </button>
          )}
          <button type="button" onClick={onClose} className="ml-auto rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
            {saving ? 'Saving…' : review.ownerReply ? 'Update reply' : 'Send reply'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Aggregation ─────────────────────────────────────────
function computeStats(reviews) {
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const replied = reviews.filter((r) => r.ownerReply).length;
  const notReplied = total - replied;

  const sentCounts = { positive: 0, neutral: 0, negative: 0 };
  reviews.forEach((r) => { sentCounts[sentimentOf(r.rating)] += 1; });
  const sentiments = [
    { label: 'Positive', value: sentCounts.positive, color: CHART_COLORS.accent },
    { label: 'Neutral', value: sentCounts.neutral, color: CHART_COLORS.amber },
    { label: 'Negative', value: sentCounts.negative, color: NEG },
  ];

  // Per-business aggregation.
  const bmap = new Map();
  reviews.forEach((r) => {
    const id = r.business?.id ?? 0;
    const name = r.business?.name ?? 'Unknown';
    const e = bmap.get(id) || { id, name, count: 0, sum: 0, replied: 0 };
    e.count += 1;
    e.sum += r.rating;
    if (r.ownerReply) e.replied += 1;
    bmap.set(id, e);
  });
  const branches = [...bmap.values()]
    .map((b) => ({ ...b, avg: b.count ? b.sum / b.count : 0, notReplied: b.count - b.replied }))
    .sort((a, b) => b.count - a.count || b.avg - a.avg);

  const buckets = { high: 0, avg: 0, low: 0 };
  branches.forEach((b) => {
    if (b.avg >= 4) buckets.high += 1;
    else if (b.avg >= 3) buckets.avg += 1;
    else buckets.low += 1;
  });

  // Reviews per month, last 6 months.
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  const cnt = Object.fromEntries(months.map((m) => [m.key, 0]));
  reviews.forEach((r) => {
    const d = new Date(r.createdAt);
    if (Number.isNaN(d.getTime())) return;
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (k in cnt) cnt[k] += 1;
  });
  const trendBars = months.map((m) => ({ label: m.label, value: cnt[m.key] }));

  return { total, avg, replied, notReplied, sentiments, branches, buckets, trendBars };
}
