import { useEffect, useState } from 'react';
import { Badge, ErrorNote, Loading } from '../../components/ui';
import { BarChart, Donut, Legend, Panel, StatTile, CHART_COLORS } from '../../components/dashboard';
import { api } from '../../lib/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.stats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!stats) return <Loading />;

  const barData = [
    { label: 'Trial', value: stats.subscriptions.trialing },
    { label: 'Monthly', value: stats.subscriptions.monthly },
    { label: 'Yearly', value: stats.subscriptions.yearly },
    { label: 'None', value: stats.subscriptions.inactive },
  ];

  const donutSegments = [
    { label: 'Owners', value: stats.users.owners, color: CHART_COLORS.brand },
    { label: 'Clients', value: stats.users.customers, color: CHART_COLORS.accent },
    { label: 'Admins', value: stats.users.admins, color: CHART_COLORS.amber },
  ];

  const paidOwners = stats.subscriptions.monthly + stats.subscriptions.yearly;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Platform health, usage, and security at a glance.</p>
      </div>

      {/* KPI tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Users" value={stats.users.total} hint={`${stats.users.active} active`} highlight />
        <StatTile label="Business Owners" value={stats.users.owners} hint={`${paidOwners} on a paid plan`} />
        <StatTile label="Clients" value={stats.users.customers} hint="Registered renters" />
        <StatTile label="Businesses" value={stats.businesses} hint={`${stats.marketplace?.marketplace ?? 0} on marketplace`} />
      </div>

      {/* Subscriptions + system */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel
          title="Subscriptions"
          className="lg:col-span-2"
          action={<span className="text-xs font-medium text-slate-400">Owners by plan</span>}
        >
          <BarChart data={barData} />
          <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-100 pt-4 text-sm">
            <Stat label="On free trial" value={stats.subscriptions.trialing} />
            <Stat label="Paying owners" value={paidOwners} />
            <Stat label="Inactive" value={stats.subscriptions.inactive} />
          </div>
        </Panel>

        {/* System status (featured, dark) */}
        <div
          className="flex flex-col rounded-2xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${CHART_COLORS.brandDark}, ${CHART_COLORS.brand})` }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">System status</p>
            <Badge tone={stats.system.dbConnected ? 'green' : 'red'}>
              {stats.system.dbConnected ? 'Operational' : 'Degraded'}
            </Badge>
          </div>
          <p className="mt-1 text-2xl font-bold">{formatUptime(stats.system.uptimeSeconds)} uptime</p>
          <dl className="mt-4 space-y-2.5 text-sm">
            <SysRow label="Environment" value={stats.system.environment} />
            <SysRow label="Runtime" value={`Node ${stats.system.nodeVersion}`} />
            <SysRow label="Database" value={stats.system.database} />
            <SysRow label="Service" value={stats.system.service} />
          </dl>
        </div>
      </div>

      {/* Users donut + security */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title="Users by Role">
          <Donut segments={donutSegments} centerValue={stats.users.total} centerLabel="Users" />
          <div className="mt-5">
            <Legend items={donutSegments} />
          </div>
        </Panel>

        <Panel title="Security & Requirements" className="lg:col-span-2">
          <ul className="grid gap-3 sm:grid-cols-2">
            {stats.security.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      s.ok ? 'bg-accent/15 text-accent-dark' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      {s.ok ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                      )}
                    </svg>
                  </span>
                  {s.label}
                </span>
                <Badge tone={s.ok ? 'green' : 'amber'}>{s.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SysRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-white/60">{label}</dt>
      <dd className="truncate font-medium capitalize text-white">{value}</dd>
    </div>
  );
}

function formatUptime(s) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
