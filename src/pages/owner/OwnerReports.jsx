import { useEffect, useState } from 'react';
import { ErrorNote, Loading, PageHeader } from '../../components/ui';
import { BarChart, Donut, Legend, Panel, StatTile, CHART_COLORS } from '../../components/dashboard';
import { api } from '../../lib/api';
import { formatPrice, rentalDays } from '../../lib/currency';

const money = (r) => rentalDays(r.startDate, r.endDate) * Number(r.product?.pricePerDay || 0);
const isEarning = (r) => r.status === 'confirmed' || r.status === 'completed';
const trendText = (cur, prev) => {
  if (prev <= 0) return cur > 0 ? '+100% vs last month' : 'No change vs last month';
  const pct = Math.round(((cur - prev) / prev) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}% vs last month`;
};

export default function OwnerReports() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reservations.list().then(setItems).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!items) return <Loading />;

  const earning = items.filter(isEarning);
  const currency = items[0]?.product?.currency || 'PHP';
  const totalRevenue = earning.reduce((s, r) => s + money(r), 0);
  const uniqueCustomers = new Set(items.map((r) => r.customer?.email || r.customerId)).size;
  const completed = items.filter((r) => r.status === 'completed').length;
  const completionRate = items.length ? Math.round((completed / items.length) * 100) : 0;
  const avgValue = earning.length ? totalRevenue / earning.length : 0;

  // ── Monthly buckets (last 6 months) ───────────────────
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  const revByMonth = Object.fromEntries(months.map((m) => [m.key, 0]));
  const cntByMonth = Object.fromEntries(months.map((m) => [m.key, 0]));
  items.forEach((r) => {
    const d = new Date(r.startDate);
    if (Number.isNaN(d.getTime())) return;
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    if (k in cntByMonth) {
      cntByMonth[k] += 1;
      if (isEarning(r)) revByMonth[k] += money(r);
    }
  });
  const revenueBars = months.map((m) => ({ label: m.label, value: Math.round(revByMonth[m.key]) }));
  const curKey = months[5].key;
  const prevKey = months[4].key;
  const revTrend = trendText(revByMonth[curKey], revByMonth[prevKey]);
  const bookTrend = trendText(cntByMonth[curKey], cntByMonth[prevKey]);

  // ── Status donut ──────────────────────────────────────
  const statusSegments = [
    { label: 'Completed', value: items.filter((r) => r.status === 'completed').length, color: CHART_COLORS.brand },
    { label: 'Confirmed', value: items.filter((r) => r.status === 'confirmed').length, color: CHART_COLORS.accent },
    { label: 'Pending', value: items.filter((r) => r.status === 'pending').length, color: CHART_COLORS.amber },
    { label: 'Cancelled', value: items.filter((r) => r.status === 'cancelled').length, color: '#ef4444' },
  ];

  // ── Rankings ──────────────────────────────────────────
  const topProducts = rank(earning, (r) => r.product?.name || 'Unknown', currency).slice(0, 5);
  const byBusiness = rank(earning, (r) => r.product?.business?.name || 'Unknown', currency).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Understand your revenue, bookings, and best performers at a glance."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Revenue" value={formatPrice(totalRevenue, currency)} hint={revTrend} highlight />
        <StatTile label="Total Bookings" value={items.length} hint={bookTrend} />
        <StatTile label="Completion Rate" value={`${completionRate}%`} hint={`${completed} completed`} />
        <StatTile label="Active Customers" value={uniqueCustomers} hint="Unique renters" />
      </div>

      {/* Revenue + status */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="Revenue Overview"
          className="lg:col-span-2"
          action={<span className="text-xs font-medium text-slate-400">Last 6 months</span>}
        >
          <BarChart data={revenueBars} />
          <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-sm">
            <Metric label="Total revenue" value={formatPrice(totalRevenue, currency)} />
            <Metric label="Avg. booking" value={formatPrice(avgValue, currency)} />
            <Metric label="Paying bookings" value={earning.length} />
          </div>
        </Panel>

        <Panel title="Booking Status">
          <Donut segments={statusSegments} centerValue={items.length} centerLabel="Bookings" />
          <div className="mt-5">
            <Legend items={statusSegments} />
          </div>
        </Panel>
      </div>

      {/* Rankings */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Top Products">
          <RankedBars rows={topProducts} empty="No paying bookings yet." />
        </Panel>
        <Panel title="Revenue by Business">
          <RankedBars rows={byBusiness} empty="No revenue recorded yet." />
        </Panel>
      </div>
    </div>
  );
}

// Aggregate earning reservations by a key into ranked {label, revenue, count}.
function rank(earning, keyFn, currency) {
  const map = new Map();
  earning.forEach((r) => {
    const label = keyFn(r);
    const e = map.get(label) || { label, revenue: 0, count: 0, currency: r.product?.currency || currency };
    e.revenue += money(r);
    e.count += 1;
    map.set(label, e);
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

function RankedBars({ rows, empty }) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-slate-400">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.revenue));
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium text-slate-700">{r.label}</span>
            <span className="shrink-0 font-semibold text-slate-900">
              {formatPrice(r.revenue, r.currency)}
              <span className="ml-1.5 text-xs font-normal text-slate-400">· {r.count}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.revenue / max) * 100}%`, background: `linear-gradient(90deg, ${CHART_COLORS.accent}, ${CHART_COLORS.brand})` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
