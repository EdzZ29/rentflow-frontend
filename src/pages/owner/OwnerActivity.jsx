import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination, SearchInput, Tabs } from '../../components/table';
import { Badge, ErrorNote, Loading, PageHeader } from '../../components/ui';
import { useRealtime } from '../../context/RealtimeContext';
import { api } from '../../lib/api';

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'business', label: 'Businesses' },
  { key: 'product', label: 'Products' },
  { key: 'booking', label: 'Bookings' },
  { key: 'plan', label: 'Plan' },
];

const ACTIONS = [
  'all',
  'created',
  'updated',
  'deleted',
  'booked',
  'confirmed',
  'completed',
  'cancelled',
];

const CATEGORY_TONE = {
  business: 'blue',
  product: 'green',
  booking: 'amber',
  plan: 'slate',
};

const ACTION_TONE = {
  created: 'green',
  booked: 'green',
  confirmed: 'green',
  completed: 'blue',
  updated: 'slate',
  changed: 'slate',
  trial_started: 'amber',
  deleted: 'red',
  cancelled: 'red',
};

function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const labelFor = (a) => a.replace(/_/g, ' ');

// Stable empty reference so memo deps don't change every render while loading.
const EMPTY = [];

export default function OwnerActivity() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [action, setAction] = useState('all');
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const { subscribe } = useRealtime();

  const fetchData = useCallback(() => {
    return api.activity
      .list({
        category: category === 'all' ? undefined : category,
        action: action === 'all' ? undefined : action,
        q: query.trim() || undefined,
        from: from || undefined,
        to: to || undefined,
      })
      .then((data) => {
        setItems(data);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [category, action, query, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live-append: a new activity event refetches with the current filters.
  useEffect(() => subscribe('activity', fetchData), [subscribe, fetchData]);

  // Any filter change starts back at page 1.
  const bump = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const hasFilters =
    category !== 'all' || action !== 'all' || query || from || to;

  const clearFilters = () => {
    setCategory('all');
    setAction('all');
    setQuery('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const rows = items || EMPTY;
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * perPage, safePage * perPage),
    [rows, safePage, perPage],
  );

  const dateInput =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

  return (
    <div>
      <PageHeader
        title="Activity Log"
        subtitle="A record of everything that's happened across your businesses."
      />
      <ErrorNote>{error}</ErrorNote>

      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Category tabs */}
        <div className="px-4 pt-2 sm:px-5">
          <Tabs tabs={CATEGORY_TABS} active={category} onChange={bump(setCategory)} />
        </div>

        {/* Filter toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:px-5 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">Search by name</label>
            <SearchInput value={query} onChange={bump(setQuery)} placeholder="Business, product, or customer…" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Action</label>
            <select
              value={action}
              onChange={(e) => bump(setAction)(e.target.value)}
              className={`${dateInput} capitalize`}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All actions' : labelFor(a)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">From</label>
            <input type="date" value={from} max={to || undefined} onChange={(e) => bump(setFrom)(e.target.value)} className={dateInput} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">To</label>
            <input type="date" value={to} min={from || undefined} onChange={(e) => bump(setTo)(e.target.value)} className={dateInput} />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-[38px] rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* List */}
        {!items ? (
          <Loading />
        ) : rows.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-400">
            {hasFilters ? 'No activity matches your filters.' : 'No activity yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pageRows.map((a) => (
              <li key={a.id} className="flex items-start gap-4 px-5 py-4">
                <span className="mt-0.5">
                  <Badge tone={CATEGORY_TONE[a.category] || 'slate'}>{a.category}</Badge>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                    <Badge tone={ACTION_TONE[a.action] || 'slate'}>{labelFor(a.action)}</Badge>
                  </div>
                  {a.description && <p className="mt-0.5 text-sm text-slate-600">{a.description}</p>}
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">
                  {formatDateTime(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {items && rows.length > 0 && (
          <div className="px-4 pb-4 sm:px-5">
            <Pagination page={safePage} pageCount={pageCount} onPage={setPage} perPage={perPage} onPerPage={bump(setPerPage)} />
          </div>
        )}
      </div>
    </div>
  );
}
