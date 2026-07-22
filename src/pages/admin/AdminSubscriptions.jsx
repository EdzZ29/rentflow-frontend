import { useEffect, useMemo, useState } from 'react';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { StatTile } from '../../components/dashboard';
import { Avatar, Pagination, SearchInput } from '../../components/table';
import { api } from '../../lib/api';

const PLAN_FILTERS = ['all', 'marketplace', 'business'];

export default function AdminSubscriptions() {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [busyId, setBusyId] = useState(null);

  const loadBusinesses = () => api.businesses.list().then(setBusinesses).catch((e) => setError(e.message));
  const loadStats = () => api.admin.stats().then(setStats).catch(() => {});

  useEffect(() => {
    loadBusinesses();
    loadStats();
  }, []);

  const act = async (b, patch) => {
    setBusyId(b.id);
    setError('');
    try {
      await api.businesses.update(b.id, patch);
      await Promise.all([loadBusinesses(), loadStats()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (businesses || []).filter((b) => {
      if (plan !== 'all' && (b.subscriptionType || 'business') !== plan) return false;
      if (!q) return true;
      return (
        b.name?.toLowerCase().includes(q) ||
        b.owner?.fullName?.toLowerCase().includes(q) ||
        b.owner?.email?.toLowerCase().includes(q)
      );
    });
  }, [businesses, plan, query]);

  if (!businesses && !error) return <Loading />;

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const withReset = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Monitor plans, marketplace listings, and revenue." />
      <ErrorNote>{error}</ErrorNote>

      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Marketplace listings" value={stats.marketplace.marketplace} hint="Public businesses" highlight />
          <StatTile label="Private businesses" value={stats.marketplace.business} hint="Management only" />
          <StatTile label="Published products" value={stats.marketplace.publishedProducts} hint="Live to customers" />
          <StatTile label="Estimated MRR" value={`$${stats.revenue.estimatedMrr}`} hint={`~$${stats.revenue.estimatedArr}/yr`} />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <SearchInput value={query} onChange={withReset(setQuery)} placeholder="Search business or owner…" />
          <select
            value={plan}
            onChange={(e) => withReset(setPlan)(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize text-slate-600 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {PLAN_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f === 'all' ? 'All plans' : f}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-400">No businesses found.</div>
          ) : (
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead className="border-y border-slate-100 bg-slate-50/60">
                <tr>
                  <Th>Business</Th>
                  <Th>Owner</Th>
                  <Th>Plan</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((b) => {
                  const isMkt = (b.subscriptionType || 'business') === 'marketplace';
                  const suspended = b.status !== 'active';
                  return (
                    <tr key={b.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{b.name}</p>
                        <p className="text-xs text-slate-400">{b.category}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={b.owner?.fullName} />
                          <div className="min-w-0">
                            <p className="truncate text-slate-800">{b.owner?.fullName || '—'}</p>
                            <p className="truncate text-xs text-slate-400">{b.owner?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={isMkt ? 'green' : 'slate'}>{isMkt ? 'Marketplace' : 'Business'}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={suspended ? 'red' : 'green'}>{suspended ? 'Suspended' : 'Active'}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            disabled={busyId === b.id}
                            onClick={() => act(b, { subscriptionType: isMkt ? 'business' : 'marketplace' })}
                            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                              isMkt
                                ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                : 'bg-accent text-white hover:bg-accent-dark'
                            }`}
                          >
                            {isMkt ? 'Downgrade' : 'Upgrade'}
                          </button>
                          <button
                            disabled={busyId === b.id}
                            onClick={() => act(b, { status: suspended ? 'active' : 'paused' })}
                            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:opacity-60 ${
                              suspended
                                ? 'border-brand text-brand hover:bg-brand/5'
                                : 'border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {suspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <Pagination page={safePage} pageCount={pageCount} onPage={setPage} perPage={perPage} onPerPage={withReset(setPerPage)} />
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 ${className}`}>
      {children}
    </th>
  );
}
