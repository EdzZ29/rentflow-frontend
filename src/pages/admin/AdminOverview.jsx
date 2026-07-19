import { useEffect, useState } from 'react';
import { Badge, Card, ErrorNote, Loading, PageHeader, StatCard } from '../../components/ui';
import { api } from '../../lib/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .stats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!stats) return <Loading />;

  return (
    <div>
      <PageHeader
        title="System Overview"
        subtitle="Platform health, usage, and security at a glance."
      />

      {/* Usage stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.users.total} hint={`${stats.users.active} active`} />
        <StatCard label="Owners" value={stats.users.owners} tone="accent" />
        <StatCard label="Clients" value={stats.users.customers} />
        <StatCard label="Businesses" value={stats.businesses} tone="accent" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Subscriptions */}
        <Card title="Subscriptions">
          <ul className="space-y-3 text-sm">
            <Row label="On free trial" value={stats.subscriptions.trialing} tone="amber" />
            <Row label="Monthly plan" value={stats.subscriptions.monthly} tone="blue" />
            <Row label="Yearly plan" value={stats.subscriptions.yearly} tone="green" />
            <Row label="Inactive / none" value={stats.subscriptions.inactive} tone="slate" />
          </ul>
        </Card>

        {/* System requirements */}
        <Card title="System">
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Dt>Service</Dt><Dd>{stats.system.service}</Dd>
            <Dt>Environment</Dt><Dd className="capitalize">{stats.system.environment}</Dd>
            <Dt>Runtime</Dt><Dd>Node {stats.system.nodeVersion}</Dd>
            <Dt>Database</Dt><Dd>{stats.system.database} {stats.system.dbConnected ? '· connected' : '· down'}</Dd>
            <Dt>Uptime</Dt><Dd>{formatUptime(stats.system.uptimeSeconds)}</Dd>
          </dl>
        </Card>
      </div>

      {/* Security */}
      <Card title="Security & Requirements" className="mt-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {stats.security.map((s) => (
            <li key={s.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-700">{s.label}</span>
              <Badge tone={s.ok ? 'green' : 'amber'}>{s.status}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Row({ label, value, tone }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </li>
  );
}
const Dt = ({ children }) => <dt className="text-slate-500">{children}</dt>;
const Dd = ({ children, className = '' }) => (
  <dd className={`text-right font-medium text-slate-900 ${className}`}>{children}</dd>
);

function formatUptime(s) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
